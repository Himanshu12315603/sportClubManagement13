import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment, PaymentDocument } from './payment.model';
import { CreatePaymentOrderInput, VerifyPaymentInput } from './payment.types';
import { NotFoundError, AppError } from '../../utils/AppError';
import { Transaction } from '../finance/finance.model';

export const createPaymentOrder = async (
  userId: string,
  data: CreatePaymentOrderInput
): Promise<PaymentDocument> => {
  const { amount, currency = 'INR', purpose, relatedId, notes } = data;

  const mockGatewayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const payment = await Payment.create({
    user: new mongoose.Types.ObjectId(userId),
    amount,
    currency,
    purpose,
    relatedId: relatedId ? new mongoose.Types.ObjectId(relatedId) : undefined,
    gateway: 'razorpay',
    gatewayOrderId: mockGatewayOrderId,
    status: 'created',
    notes,
  });

  return payment;
};

export const verifyPayment = async (
  userId: string,
  data: VerifyPaymentInput
): Promise<PaymentDocument> => {
  const { paymentId, gatewayOrderId, gatewayPaymentId, gatewaySignature } = data;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new NotFoundError('Payment record not found');

  if (payment.gatewayOrderId !== gatewayOrderId) {
    throw new AppError('Gateway order ID mismatch', 400);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (secret && gatewaySignature) {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== gatewaySignature) {
      payment.status = 'failed';
      await payment.save();
      throw new AppError('Payment signature verification failed', 400);
    }
  }

  payment.status = 'captured';
  payment.gatewayPaymentId = gatewayPaymentId;
  payment.gatewaySignature = gatewaySignature;
  await payment.save();

  const sourceMap: Record<string, 'membership' | 'booking' | 'shop' | 'cafeteria' | 'other'> = {
    membership: 'membership',
    booking: 'booking',
    shop_order: 'shop',
    cafeteria: 'cafeteria',
    invoice: 'other',
  };

  // Record into central Finance transactions
  await Transaction.create({
    type: 'revenue',
    source: sourceMap[payment.purpose] || 'other',
    amount: payment.amount,
    paymentMethod: 'online',
    reference: payment.paymentNumber,
    description: `Online payment via Razorpay for ${payment.purpose}`,
    relatedId: payment._id,
    performedBy: new mongoose.Types.ObjectId(userId),
  });

  return payment;
};

export const getMyPayments = async (userId: string) => {
  return Payment.find({ user: userId }).sort({ createdAt: -1 });
};

export const getPaymentById = async (id: string) => {
  const payment = await Payment.findById(id).populate('user', 'name email phone');
  if (!payment) throw new NotFoundError('Payment not found');
  return payment;
};
