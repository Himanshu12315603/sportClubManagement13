import mongoose, { Document } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'returned';
export type OrderType = 'online' | 'in_store' | 'click_and_collect';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface IOrderAddress {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  deliveryAddress?: IOrderAddress;
  notes?: string;
}

export interface OrderDocument extends IOrder, Document {}
