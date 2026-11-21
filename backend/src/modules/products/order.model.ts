import mongoose, { Document, Schema } from 'mongoose';

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
  deliveryAddress?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes?: string;
}

export interface OrderDocument extends IOrder, Document {}

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, unique: true, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        productSku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    orderType: { type: String, enum: ['online', 'in_store', 'click_and_collect'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentMethod: String,
    paymentReference: String,
    deliveryAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('validate', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);
