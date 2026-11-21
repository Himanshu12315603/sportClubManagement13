import mongoose, { Document } from 'mongoose';

export interface IMenuItem {
  name: string;
  description?: string;
  category: string;
  price: number;
  memberPrice?: number;
  image?: string;
  isAvailable: boolean;
  isActive: boolean;
  preparationTimeMinutes?: number;
  tags?: string[];
}
export interface MenuItemDocument extends IMenuItem, Document {}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface ITable {
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  currentOrder?: mongoose.Types.ObjectId;
  location?: string;
}
export interface TableDocument extends ITable, Document {}

export type CafeOrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface ICafeOrderItem {
  menuItem: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface ICafeOrderHistory {
  status: CafeOrderStatus;
  changedAt: Date;
  changedBy: mongoose.Types.ObjectId;
}

export interface ICafeOrder {
  orderNumber: string;
  table?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  items: ICafeOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: CafeOrderStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  paymentReference?: string;
  servedBy?: mongoose.Types.ObjectId;
  notes?: string;
  statusHistory: ICafeOrderHistory[];
}
export interface CafeOrderDocument extends ICafeOrder, Document {}
