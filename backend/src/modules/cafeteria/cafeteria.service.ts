import mongoose from 'mongoose';
import { MenuItem, Table, CafeOrder, CafeOrderDocument, CafeOrderStatus, ICafeOrderItem } from './cafeteria.model';
import { Member } from '../members/member.model';
import { MembershipPlan } from '../members/membershipPlan.model';
import { AppError, NotFoundError } from '../../utils/AppError';

// ---- Menu ----
export const createMenuItem = async (data: object) => MenuItem.create(data);

export const getMenu = async (category?: string) => {
  const filter: Record<string, unknown> = { isActive: true, isAvailable: true };
  if (category) filter.category = category;
  return MenuItem.find(filter).sort({ category: 1, name: 1 });
};

export const updateMenuItem = async (id: string, data: object) => {
  const item = await MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw new NotFoundError('Menu item not found');
  return item;
};

// ---- Tables ----
export const createTable = async (data: object) => Table.create(data);

export const getTables = async () => Table.find().sort({ tableNumber: 1 }).populate('currentOrder', 'orderNumber status total');

export const updateTableStatus = async (id: string, status: string) => {
  const table = await Table.findByIdAndUpdate(id, { status }, { new: true });
  if (!table) throw new NotFoundError('Table not found');
  return table;
};

// ---- Orders ----
const CAFE_STATUS_TRANSITIONS: Record<string, string[]> = {
  created: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['served'],
  served: ['paid'],
  paid: [],
  cancelled: [],
};

export const createCafeOrder = async (data: {
  tableId?: string;
  customerId?: string;
  items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
  notes?: string;
  createdById: string;
}): Promise<CafeOrderDocument> => {
  const { tableId, customerId, items, notes, createdById } = data;

  let cafeDiscount = 0;
  if (customerId) {
    const member = await Member.findOne({ userId: customerId });
    if (member) {
      const plan = await MembershipPlan.findById(member.membershipPlan);
      cafeDiscount = plan?.cafeDiscount ?? 0;
    }
  }

  const orderItems: ICafeOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (!menuItem || !menuItem.isActive || !menuItem.isAvailable) {
      throw new AppError(`Menu item ${item.menuItemId} is not available`, 400);
    }
    const unitPrice = customerId && menuItem.memberPrice ? menuItem.memberPrice : menuItem.price;
    subtotal += unitPrice * item.quantity;
    orderItems.push({
      menuItem: new mongoose.Types.ObjectId(item.menuItemId),
      itemName: menuItem.name,
      quantity: item.quantity,
      unitPrice,
      notes: item.notes,
      status: 'pending',
    });
  }

  const discount = (subtotal * cafeDiscount) / 100;
  const total = subtotal - discount;

  const order = await CafeOrder.create({
    table: tableId ? new mongoose.Types.ObjectId(tableId) : undefined,
    customer: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: 'created',
    statusHistory: [{ status: 'created', changedAt: new Date(), changedBy: new mongoose.Types.ObjectId(createdById) }],
    notes,
  });

  if (tableId) {
    await Table.findByIdAndUpdate(tableId, { status: 'occupied', currentOrder: order._id });
  }

  return order.populate([
    { path: 'table', select: 'tableNumber capacity' },
    { path: 'customer', select: 'name email' },
  ]);
};

export const updateCafeOrderStatus = async (
  id: string,
  status: CafeOrderStatus,
  updatedById: string,
  paymentMethod?: string,
  paymentReference?: string
): Promise<CafeOrderDocument> => {
  const order = await CafeOrder.findById(id);
  if (!order) throw new NotFoundError('Order not found');

  if (!CAFE_STATUS_TRANSITIONS[order.status]?.includes(status)) {
    throw new AppError(`Cannot transition from '${order.status}' to '${status}'`, 400);
  }

  order.status = status;
  order.statusHistory.push({ status, changedAt: new Date(), changedBy: new mongoose.Types.ObjectId(updatedById) });

  if (status === 'paid') {
    order.paymentStatus = 'paid';
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentReference) order.paymentReference = paymentReference;
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'cleaning', currentOrder: undefined });
    }
  }

  await order.save();
  return order;
};

export const getCafeOrders = async (query: { status?: string; tableId?: string; customerId?: string; page?: number; limit?: number }) => {
  const { status, tableId, customerId, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (tableId) filter.table = tableId;
  if (customerId) filter.customer = customerId;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    CafeOrder.find(filter)
      .populate('table', 'tableNumber')
      .populate('customer', 'name email')
      .populate('servedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CafeOrder.countDocuments(filter),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getCafeOrderById = async (id: string) => {
  const order = await CafeOrder.findById(id)
    .populate('table', 'tableNumber capacity')
    .populate('customer', 'name email phone')
    .populate('servedBy', 'name');
  if (!order) throw new NotFoundError('Cafe order not found');
  return order;
};
