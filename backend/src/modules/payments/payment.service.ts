import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import { Payment, PaymentDocument } from './payment.model';
import { CancelPaymentInput, CreatePaymentOrderInput, VerifyPaymentInput } from './payment.types';
import { AppError, ConflictError, NotFoundError } from '../../utils/AppError';
import { Transaction } from '../finance/finance.model';
import { Order } from '../products/order.model';
import * as productService from '../products/product.service';
import { CafeOrder, Table } from '../cafeteria/cafeteria.model';
import { Member } from '../members/member.model';
import { MembershipPlan, MembershipTier } from '../members/membershipPlan.model';
import * as memberService from '../members/member.service';
import { createNotification } from '../notifications/notification.service';

const PAYMENT_EXPIRY_MINUTES = 20;
const MEMBERSHIP_TIERS: MembershipTier[] = ['gold', 'silver', 'junior', 'trial'];

const findMembershipPlan = (id: string) => {
  if (mongoose.isValidObjectId(id)) return MembershipPlan.findById(id);
  if (!MEMBERSHIP_TIERS.includes(id as MembershipTier)) return null;
  return MembershipPlan.findOne({ tier: id as MembershipTier });
};

const getRazorpayClient = (): { client: Razorpay; keyId: string; keySecret: string } => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || /your_|replace_me|placeholder/i.test(keyId) || /your_|replace_me|placeholder/i.test(keySecret)) {
    throw new AppError('Razorpay test keys are not configured on the backend', 503);
  }
  if (!keyId.startsWith('rzp_test_')) {
    throw new AppError('This checkout only accepts Razorpay Test Mode keys', 503);
  }
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
};

const getPurchaseAmount = async (userId: string, data: CreatePaymentOrderInput) => {
  if (data.purpose === 'membership') {
    const plan = await findMembershipPlan(data.relatedId);
    if (!plan || !plan.isActive) throw new NotFoundError('Membership plan not found');
    if (plan.price <= 0) throw new AppError('Free plans do not require Razorpay checkout', 400);

    const currentMember = await Member.findOne({ userId });
    const renewingSamePlan = currentMember?.status === 'active'
      && String(currentMember.membershipPlan) === String(plan._id);
    if (currentMember?.status === 'active' && !renewingSamePlan) {
      throw new ConflictError('You cannot switch plans while your membership is active. Renew your current plan instead.');
    }

    return { amount: plan.price, relatedId: plan._id, notes: plan.name };
  }

  if (data.purpose === 'shop_order') {
    const order = await Order.findOne({
      _id: data.relatedId,
      customer: userId,
      status: 'pending',
      paymentStatus: 'pending',
    });
    if (!order) throw new NotFoundError('Unpaid shop order not found');
    return { amount: order.total, relatedId: order._id, notes: order.orderNumber };
  }

  const cafeOrder = await CafeOrder.findOne({
    _id: data.relatedId,
    customer: userId,
    status: 'created',
    paymentStatus: 'pending',
  });
  if (!cafeOrder) throw new NotFoundError('Unpaid cafeteria order not found');
  return { amount: cafeOrder.total, relatedId: cafeOrder._id, notes: cafeOrder.orderNumber };
};

export const createPaymentOrder = async (
  userId: string,
  data: CreatePaymentOrderInput
): Promise<Record<string, unknown>> => {
  const { client, keyId } = getRazorpayClient();
  const purchase = await getPurchaseAmount(userId, data);
  if (!Number.isFinite(purchase.amount) || purchase.amount <= 0) {
    throw new AppError('The purchase total must be greater than zero', 400);
  }

  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000);
  const gatewayOrder = await (async () => {
    try {
      return await client.orders.create({
      amount: Math.round(purchase.amount * 100),
      currency: 'INR',
      receipt: `cc_${Date.now()}`,
      notes: {
        purpose: data.purpose,
        userId,
        relatedId: String(purchase.relatedId),
      },
    });
    } catch (error) {
      const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
        && typeof error.statusCode === 'number'
        ? error.statusCode
        : undefined;
      console.error('Razorpay order creation failed', { statusCode });
      const message = statusCode === 401 || statusCode === 403
        ? 'Razorpay rejected the Test Mode credentials. Verify the key ID and secret are a matching pair.'
        : 'Could not create a Razorpay Test Mode order. Verify backend connectivity and Test Mode credentials.';
      throw new AppError(message, 502);
    }
  })();

  const payment = await Payment.create({
    user: new mongoose.Types.ObjectId(userId),
    amount: purchase.amount,
    currency: 'INR',
    purpose: data.purpose,
    relatedId: purchase.relatedId,
    gateway: 'razorpay',
    gatewayOrderId: gatewayOrder.id,
    status: 'created',
    notes: purchase.notes,
    expiresAt,
  });

  return {
    ...payment.toObject(),
    keyId,
    gatewayOrderId: gatewayOrder.id,
    gatewayAmount: gatewayOrder.amount,
    gatewayCurrency: gatewayOrder.currency,
  };
};

const verifySignature = (secret: string, orderId: string, paymentId: string, signature: string) => {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, 'hex');
  } catch {
    throw new AppError('Payment signature verification failed', 400);
  }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new AppError('Payment signature verification failed', 400);
  }
};

export const verifyPayment = async (
  userId: string,
  data: VerifyPaymentInput
): Promise<{ payment: PaymentDocument; purchase: unknown }> => {
  const payment = await Payment.findOne({ _id: data.paymentId, user: userId });
  if (!payment) throw new NotFoundError('Payment record not found');
  if (payment.gatewayOrderId !== data.gatewayOrderId) {
    throw new AppError('Gateway order ID mismatch', 400);
  }
  if (payment.status === 'captured') {
    if (
      payment.gatewayPaymentId !== data.gatewayPaymentId
      || payment.gatewaySignature !== data.gatewaySignature
    ) {
      throw new ConflictError('This payment order has already been used');
    }
    return { payment, purchase: await getFulfilledPurchase(payment) };
  }
  if (
    !['created', 'processing'].includes(payment.status)
    || (payment.status === 'created' && payment.expiresAt && payment.expiresAt < new Date())
  ) {
    throw new ConflictError('This payment order has expired or is no longer payable');
  }

  const { client, keySecret } = getRazorpayClient();
  verifySignature(keySecret, data.gatewayOrderId, data.gatewayPaymentId, data.gatewaySignature);

  const gatewayPayment = await client.payments.fetch(data.gatewayPaymentId);
  if (
    gatewayPayment.order_id !== data.gatewayOrderId
    || gatewayPayment.amount !== Math.round(payment.amount * 100)
    || gatewayPayment.currency !== payment.currency
  ) {
    throw new AppError('Razorpay payment does not match the purchase', 400);
  }

  const captured = gatewayPayment.status === 'captured'
    ? gatewayPayment
    : gatewayPayment.status === 'authorized'
      ? await client.payments.capture(data.gatewayPaymentId, gatewayPayment.amount, gatewayPayment.currency)
      : null;
  if (!captured || captured.status !== 'captured') {
    throw new AppError('Razorpay has not captured this payment', 409);
  }

  payment.status = 'processing';
  payment.gatewayPaymentId = data.gatewayPaymentId;
  payment.gatewaySignature = data.gatewaySignature;
  await payment.save();

  const purchase = await fulfillPurchase(userId, payment);
  payment.status = 'captured';
  await payment.save();

  if (payment.purpose !== 'membership') {
    const source = payment.purpose === 'shop_order' ? 'shop' : 'cafeteria';
    await Transaction.updateOne(
      { reference: payment.paymentNumber },
      {
        $setOnInsert: {
          type: 'revenue',
          source,
          amount: payment.amount,
          paymentMethod: 'online',
          reference: payment.paymentNumber,
          description: `Razorpay test payment for ${payment.purpose}`,
          relatedId: payment.relatedId,
          performedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { upsert: true }
    );
  }

  return { payment, purchase };
};

const fulfillPurchase = async (userId: string, payment: PaymentDocument): Promise<unknown> => {
  if (!payment.relatedId) throw new NotFoundError('Purchase reference not found');

  if (payment.purpose === 'membership') {
    const plan = await MembershipPlan.findById(payment.relatedId);
    if (!plan) throw new NotFoundError('Membership plan not found');
    return memberService.subscribeMembership(
      userId,
      {
        membershipPlanId: String(plan._id),
        paymentMethod: 'online',
        paymentReference: payment.paymentNumber,
      },
      payment._id.toString()
    );
  }

  if (payment.purpose === 'shop_order') {
    const existingOrder = await Order.findOne({ _id: payment.relatedId, customer: userId });
    if (existingOrder?.paymentStatus === 'paid' && existingOrder.paymentReference === payment.paymentNumber) {
      return existingOrder;
    }
    const order = await Order.findOneAndUpdate(
      {
        _id: payment.relatedId,
        customer: userId,
        status: 'pending',
        paymentStatus: 'pending',
      },
      {
        $set: {
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          paymentReference: payment.paymentNumber,
        },
      },
      { new: true }
    );
    if (!order) throw new ConflictError('The shop order is no longer awaiting payment');
    await notifyPurchase('order_placed', 'New shop order', `${order.orderNumber} was paid and confirmed.`, order._id.toString());
    return order;
  }

  const existingCafeOrder = await CafeOrder.findOne({ _id: payment.relatedId, customer: userId });
  if (existingCafeOrder?.paymentStatus === 'paid' && existingCafeOrder.paymentReference === payment.paymentNumber) {
    return existingCafeOrder;
  }
  const cafeOrder = await CafeOrder.findOneAndUpdate(
    {
      _id: payment.relatedId,
      customer: userId,
      status: 'created',
      paymentStatus: 'pending',
    },
    {
      $set: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        paymentReference: payment.paymentNumber,
      },
      $push: {
        statusHistory: {
          status: 'confirmed',
          changedAt: new Date(),
          changedBy: new mongoose.Types.ObjectId(userId),
        },
      },
    },
    { new: true }
  ).populate('table', 'tableNumber');
  if (!cafeOrder) throw new ConflictError('The cafeteria order is no longer awaiting payment');
  if (cafeOrder.table) {
    await Table.findByIdAndUpdate(cafeOrder.table, { status: 'occupied', currentOrder: cafeOrder._id });
  }
  await notifyPurchase(
    'order_placed',
    'New cafeteria order',
    `${cafeOrder.orderNumber} was paid and sent to the kitchen.`,
    cafeOrder._id.toString()
  );
  return cafeOrder;
};

const getFulfilledPurchase = async (payment: PaymentDocument) => {
  if (!payment.relatedId) return null;
  if (payment.purpose === 'membership') {
    return Member.findOne({ userId: payment.user }).populate('membershipPlan');
  }
  if (payment.purpose === 'shop_order') return Order.findById(payment.relatedId);
  return CafeOrder.findById(payment.relatedId);
};

const notifyPurchase = async (kind: string, title: string, message: string, relatedId: string) => {
  try {
    await createNotification({ audience: 'manager', kind, title, message, relatedId });
  } catch (error) {
    console.error('Failed to raise paid-purchase notification:', error);
  }
};

export const cancelPayment = async (userId: string, data: CancelPaymentInput): Promise<void> => {
  const payment = data.paymentId
    ? await Payment.findOne({ _id: data.paymentId, user: userId })
    : null;
  if (data.paymentId && !payment) throw new NotFoundError('Payment record not found');
  if (payment?.status === 'captured') throw new ConflictError('A captured payment cannot be cancelled');
  if (payment?.status === 'processing') throw new ConflictError('A captured payment is being finalized and cannot be cancelled');

  const purpose = payment?.purpose || data.purpose;
  const relatedId = payment?.relatedId?.toString() || data.relatedId;
  if (purpose && relatedId) {
    const capturedPayment = await Payment.exists({
      user: userId,
      purpose,
      relatedId,
      status: { $in: ['processing', 'captured'] },
    });
    if (capturedPayment) throw new ConflictError('A successful payment is already being finalized');
  }
  if (purpose === 'shop_order' && relatedId) {
    await productService.cancelPendingOrder(relatedId, userId);
  } else if (purpose === 'cafeteria' && relatedId) {
    await cancelPendingCafeOrder(relatedId, userId);
  }

  if (payment && payment.status === 'created') {
    payment.status = 'failed';
    await payment.save();
  }
};

const cancelPendingCafeOrder = async (orderId: string, userId: string) => {
  const order = await CafeOrder.findOne({ _id: orderId, customer: userId });
  if (!order) throw new NotFoundError('Cafeteria order not found');
  if (order.paymentStatus === 'paid') throw new ConflictError('A paid cafeteria order cannot be cancelled as unpaid');
  if (order.status === 'cancelled') return;
  if (order.status !== 'created') throw new ConflictError('Cafeteria order is no longer awaiting payment');

  order.status = 'cancelled';
  order.paymentStatus = 'failed';
  order.statusHistory.push({
    status: 'cancelled',
    changedAt: new Date(),
    changedBy: new mongoose.Types.ObjectId(userId),
  });
  await order.save();
  if (order.table) await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: undefined });
};

export const expirePendingPurchases = async (): Promise<void> => {
  const expiredBefore = new Date(Date.now() - PAYMENT_EXPIRY_MINUTES * 60 * 1000);
  const expiredPayments = await Payment.find({ status: 'created', expiresAt: { $lt: new Date() } });
  for (const payment of expiredPayments) {
    if (payment.purpose === 'shop_order' && payment.relatedId) {
      await productService.cancelPendingOrder(payment.relatedId.toString(), payment.user.toString());
    } else if (payment.purpose === 'cafeteria' && payment.relatedId) {
      await cancelPendingCafeOrder(payment.relatedId.toString(), payment.user.toString());
    }
    payment.status = 'failed';
    await payment.save();
  }

  const unpaidShopOrders = await Order.find({
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: { $lt: expiredBefore },
  }).select('_id customer');
  for (const order of unpaidShopOrders) {
    const paymentInProgress = await Payment.exists({
      purpose: 'shop_order',
      relatedId: order._id,
      status: { $in: ['processing', 'captured'] },
    });
    if (paymentInProgress) continue;
    await productService.cancelPendingOrder(order._id.toString(), order.customer.toString());
  }

  const unpaidCafeOrders = await CafeOrder.find({
    status: 'created',
    paymentStatus: 'pending',
    createdAt: { $lt: expiredBefore },
  }).select('_id customer');
  for (const order of unpaidCafeOrders) {
    if (!order.customer) continue;
    const paymentInProgress = await Payment.exists({
      purpose: 'cafeteria',
      relatedId: order._id,
      status: { $in: ['processing', 'captured'] },
    });
    if (!paymentInProgress) await cancelPendingCafeOrder(order._id.toString(), order.customer.toString());
  }
};

export const getMyPayments = async (userId: string) => {
  return Payment.find({ user: userId }).sort({ createdAt: -1 });
};

export const getPaymentById = async (id: string, userId: string, role: string) => {
  const payment = await Payment.findById(id);
  if (!payment) throw new NotFoundError('Payment not found');
  const staffRoles = ['admin', 'super_admin', 'owner', 'manager', 'accountant'];
  if (payment.user.toString() !== userId && !staffRoles.includes(role)) {
    throw new AppError('You are not allowed to view this payment', 403);
  }
  return payment.populate('user', 'name email phone');
};
