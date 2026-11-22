import mongoose, { Document, Schema } from 'mongoose';

export type PaymentGatewayStatus = 'created' | 'authorized' | 'processing' | 'captured' | 'failed' | 'refunded';

export interface IPayment {
  paymentNumber: string;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  purpose: 'membership' | 'booking' | 'shop_order' | 'cafeteria' | 'invoice';
  relatedId?: mongoose.Types.ObjectId;
  gateway: 'razorpay' | 'cash' | 'card' | 'upi';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  status: PaymentGatewayStatus;
  notes?: string;
  expiresAt?: Date;
}

export interface PaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<PaymentDocument>(
  {
    paymentNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    purpose: {
      type: String,
      enum: ['membership', 'booking', 'shop_order', 'cafeteria', 'invoice'],
      required: true,
    },
    relatedId: Schema.Types.ObjectId,
    gateway: { type: String, enum: ['razorpay', 'cash', 'card', 'upi'], default: 'razorpay' },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    status: {
      type: String,
      enum: ['created', 'authorized', 'processing', 'captured', 'failed', 'refunded'],
      default: 'created',
    },
    notes: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ gatewayOrderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 });

paymentSchema.pre('validate', async function () {
  if (!this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentNumber = `PAY-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
