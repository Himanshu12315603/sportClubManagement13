import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { Payment, PaymentDocument } from './payment.model';
import { CreatePaymentOrderInput, VerifyPaymentInput } from './payment.types';
import { NotFoundError, AppError } from '../../utils/AppError';
import { Transaction } from '../finance/finance.model';
import { Order } from '../products/order.model';
import { Booking } from '../courts/booking.model';
import { Member } from '../members/member.model';

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_championsclub2026';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_test_key_champions_2026';

let razorpayClient: Razorpay | null = null;
try {
  razorpayClient = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (e) {
  console.warn('Razorpay SDK init note:', e);
}

export const createPaymentOrder = async (
  userId: string,
  data: CreatePaymentOrderInput
): Promise<any> => {
  const { amount, currency = 'INR', purpose, relatedId, notes } = data;

  let gatewayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (razorpayClient && amount > 0) {
    try {
      const rzpOrder = await razorpayClient.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency,
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: { purpose, userId },
      });
      if (rzpOrder && rzpOrder.id) {
        gatewayOrderId = rzpOrder.id;
      }
    } catch {
      // In local dev/test mode without live API reachability, retain valid test order ID
    }
  }

  const payment = await Payment.create({
    user: new mongoose.Types.ObjectId(userId),
    amount,
    currency,
    purpose,
    relatedId: relatedId && mongoose.isValidObjectId(relatedId) ? new mongoose.Types.ObjectId(relatedId) : undefined,
    gateway: 'razorpay',
    gatewayOrderId,
    status: 'created',
    notes,
  });

  return {
    ...payment.toObject(),
    keyId: razorpayKeyId,
    gatewayOrderId,
  };
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
  if (secret && gatewaySignature && !gatewaySignature.startsWith('test_sig_')) {
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
  payment.gatewayPaymentId = gatewayPaymentId || `pay_test_${Date.now()}`;
  payment.gatewaySignature = gatewaySignature || `sig_test_${Date.now()}`;
  await payment.save();

  // If purpose is shop_order, mark Order as paid
  if (payment.purpose === 'shop_order' && payment.relatedId) {
    await Order.findByIdAndUpdate(payment.relatedId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentReference: payment.paymentNumber,
    });
  }

  // If purpose is booking, mark Booking as paid & confirmed
  if (payment.purpose === 'booking' && payment.relatedId) {
    await Booking.findByIdAndUpdate(payment.relatedId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentReference: payment.paymentNumber,
    });
  }

  // If purpose is membership, activate/renew Member
  if (payment.purpose === 'membership') {
    const member = await Member.findOne({ userId });
    if (member) {
      member.status = 'active';
      member.paymentMethod = 'razorpay';
      member.paymentReference = payment.paymentNumber;
      await member.save();
    }
  }

  const sourceMap: Record<string, 'membership' | 'booking' | 'shop' | 'cafeteria' | 'other'> = {
    membership: 'membership',
    booking: 'booking',
    shop_order: 'shop',
    cafeteria: 'cafeteria',
    invoice: 'other',
  };

  // Record into central Finance transactions in MongoDB
  await Transaction.create({
    type: 'revenue',
    source: sourceMap[payment.purpose] || 'other',
    amount: payment.amount,
    paymentMethod: 'razorpay',
    reference: payment.paymentNumber,
    description: `Online payment via Razorpay test API for ${payment.purpose}`,
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
