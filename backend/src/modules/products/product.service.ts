import mongoose from 'mongoose';
import { Product, ProductDocument, Category, InventoryTransaction } from './product.model';
import { Order, OrderDocument } from './order.model';
import { Member } from '../members/member.model';
import { MembershipPlan } from '../members/membershipPlan.model';
import { AppError, NotFoundError, ConflictError } from '../../utils/AppError';

// ---- Categories ----
export const createCategory = async (data: { name: string; description?: string }) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-');
  return Category.create({ ...data, slug });
};

export const getCategories = async () => Category.find({ isActive: true }).sort({ name: 1 });

// ---- Products ----
export const createProduct = async (data: Partial<ProductDocument>) => {
  return Product.create(data);
};

export const getProducts = async (query: {
  search?: string;
  categoryId?: string;
  online?: boolean;
  page?: number;
  limit?: number;
}) => {
  const { search, categoryId, online, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = { isActive: true };
  if (categoryId) filter.category = categoryId;
  if (online !== undefined) filter.isAvailableOnline = online;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort({ name: 1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit), lowStock: lowStock.length, outOfStock: outOfStock.length };
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw new NotFoundError('Product not found');
  return product;
};

export const updateProduct = async (id: string, data: Partial<ProductDocument>) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('category', 'name slug');
  if (!product) throw new NotFoundError('Product not found');
  return product;
};

export const adjustStock = async (
  productId: string,
  quantity: number,     // positive = add, negative = deduct
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage',
  performedById: string,
  reference?: string,
  notes?: string
) => {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError('Product not found');

  const previousStock = product.stock;
  const newStock = previousStock + quantity;
  if (newStock < 0) throw new AppError(`Insufficient stock. Available: ${previousStock}`, 400);

  product.stock = newStock;
  await product.save();

  await InventoryTransaction.create({
    product: productId,
    type,
    quantity,
    previousStock,
    newStock,
    reference,
    notes,
    performedBy: performedById,
  });

  return { product, previousStock, newStock };
};

// ---- Orders ----
export const createOrder = async (data: {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  orderType: 'online' | 'in_store' | 'click_and_collect';
  paymentMethod?: string;
  deliveryAddress?: { line1: string; city: string; state: string; pincode: string };
  notes?: string;
}): Promise<OrderDocument> => {
  const { customerId, items, orderType, paymentMethod, deliveryAddress, notes } = data;

  // Get member discount
  const member = await Member.findOne({ userId: customerId });
  const plan = member ? await MembershipPlan.findById(member.membershipPlan) : null;
  const shopDiscount = plan?.shopDiscount ?? 0;

  // Build order items with stock validation
  const orderItems = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new NotFoundError(`Product ${item.productId} not found`);
    if (!product.isActive) throw new AppError(`Product "${product.name}" is not available`, 400);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock}`, 400);
    }

    const unitPrice = member && product.memberPrice ? product.memberPrice : product.price;
    const discount = (unitPrice * shopDiscount) / 100;
    const effectivePrice = unitPrice - discount;
    const totalPrice = effectivePrice * item.quantity;

    orderItems.push({
      product: item.productId,
      productName: product.name,
      productSku: product.sku,
      quantity: item.quantity,
      unitPrice,
      discount: discount * item.quantity,
      totalPrice,
    });

    subtotal += unitPrice * item.quantity;
    discountTotal += discount * item.quantity;
  }

  const total = subtotal - discountTotal;

  // Create order
  const order = await Order.create({
    customer: customerId,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    status: 'confirmed',
    orderType,
    paymentStatus: paymentMethod ? 'pending' : 'pending',
    paymentMethod,
    deliveryAddress,
    notes,
  });

  // Deduct stock atomically
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!result) {
      // Rollback order
      await Order.findByIdAndDelete(order._id);
      throw new ConflictError(`Failed to reserve stock for a product. Please try again.`);
    }

    await InventoryTransaction.create({
      product: item.productId,
      type: 'sale',
      quantity: -item.quantity,
      previousStock: result.stock + item.quantity,
      newStock: result.stock,
      reference: order.orderNumber,
      performedBy: customerId,
    });
  }

  return order.populate([
    { path: 'customer', select: 'name email phone' },
    { path: 'items.product', select: 'name sku images' },
  ]);
};

export const getOrders = async (query: { customerId?: string; status?: string; page?: number; limit?: number }) => {
  const { customerId, status, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (customerId) filter.customer = customerId;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getOrderById = async (id: string) => {
  const order = await Order.findById(id)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name sku images price');
  if (!order) throw new NotFoundError('Order not found');
  return order;
};

export const updateOrderStatus = async (id: string, status: string, updatedById: string) => {
  const order = await Order.findById(id);
  if (!order) throw new NotFoundError('Order not found');

  const allowedTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready', 'cancelled'],
    ready: ['dispatched', 'delivered'],
    dispatched: ['delivered'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
  };

  if (!allowedTransitions[order.status]?.includes(status)) {
    throw new AppError(`Cannot transition from '${order.status}' to '${status}'`, 400);
  }

  // Handle cancellation stock return
  if (status === 'cancelled' && order.status !== 'cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      const product = await Product.findById(item.product);
      if (product) {
        await InventoryTransaction.create({
          product: item.product,
          type: 'return',
          quantity: item.quantity,
          previousStock: product.stock - item.quantity,
          newStock: product.stock,
          reference: order.orderNumber,
          performedBy: updatedById,
        });
      }
    }
  }

  order.status = status as OrderDocument['status'];
  if (status === 'delivered' || status === 'in_store') {
    order.paymentStatus = 'paid';
  }
  await order.save();
  return order;
};
