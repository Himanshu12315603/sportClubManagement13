import mongoose, { Document } from 'mongoose';

export type PaymentGatewayStatus = 'created' | 'authorized' | 'processing' | 'captured' | 'failed' | 'refunded';
export type PaymentPurpose = 'membership' | 'booking' | 'shop_order' | 'cafeteria' | 'invoice';

export interface IPayment {
  paymentNumber: string;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  relatedId?: mongoose.Types.ObjectId;
  gateway: 'razorpay' | 'cash' | 'card' | 'upi';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  status: PaymentGatewayStatus;
  notes?: string;
}

export interface PaymentDocument extends IPayment, Document {}

export interface CreatePaymentOrderInput {
  purpose: 'membership' | 'shop_order' | 'cafeteria';
  relatedId: string;
}

export interface VerifyPaymentInput {
  paymentId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface CancelPaymentInput {
  paymentId?: string;
  purpose?: 'shop_order' | 'cafeteria';
  relatedId?: string;
}
