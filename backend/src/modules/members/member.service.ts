import mongoose from 'mongoose';
import { Member, MemberDocument } from './member.model';
import { MembershipPlan, MembershipPlanDocument } from './membershipPlan.model';
import { User } from '../auth/auth.model';
import { Transaction } from '../finance/finance.model';
import { Payment } from '../payments/payment.model';
import { createNotification } from '../notifications/notification.service';
import { AppError, NotFoundError, ConflictError } from '../../utils/AppError';
import { CreateMemberInput, CreateMemberDirectInput, RenewMembershipInput, UpdateMemberInput } from './member.validation';
import { SubscribeMembershipInput } from './member.types';

// ---- Membership Plans ----

export const createPlan = async (data: Partial<MembershipPlanDocument>): Promise<MembershipPlanDocument> => {
  const plan = await MembershipPlan.create(data);
  return plan;
};

export const getPlans = async (activeOnly = true): Promise<MembershipPlanDocument[]> => {
  const filter = activeOnly ? { isActive: true } : {};
  return MembershipPlan.find(filter).sort({ price: 1 });
};

export const updatePlan = async (id: string, data: Partial<MembershipPlanDocument>): Promise<MembershipPlanDocument> => {
  const plan = await MembershipPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!plan) throw new NotFoundError('Membership plan not found');
  return plan;
};

export const deletePlan = async (id: string): Promise<void> => {
  const plan = await MembershipPlan.findById(id);
  if (!plan) throw new NotFoundError('Membership plan not found');
  plan.isActive = false;
  await plan.save();
};

// ---- Members ----

/**
 * Self-service membership subscription for regular members/visitors.
 * Allows grabbing Gold, Silver, Junior, or Free Trial membership!
 */
export const subscribeMembership = async (
  userId: string,
  data: SubscribeMembershipInput,
  verifiedPaymentId?: string
): Promise<MemberDocument> => {
  const rawPlanId = (data as any).membershipPlanId || (data as any).planId;
  const { paymentMethod = 'online', notes } = data;

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const plan = mongoose.isValidObjectId(rawPlanId)
    ? await MembershipPlan.findById(rawPlanId)
    : await MembershipPlan.findOne({ tier: rawPlanId });
  if (!plan) throw new NotFoundError('Membership plan not found');
  if (!plan.isActive) throw new AppError('This membership plan is currently not available', 400);

  let paymentReference = data.paymentReference;
  if (plan.price > 0) {
    if (!verifiedPaymentId) throw new AppError('Complete Razorpay checkout before activating a paid membership', 402);
    const payment = await Payment.findOne({
      _id: verifiedPaymentId,
      user: userId,
      purpose: 'membership',
      relatedId: plan._id,
      status: { $in: ['processing', 'captured'] },
    });
    if (!payment || !payment.gatewayPaymentId || !payment.gatewaySignature) {
      throw new AppError('A verified Razorpay payment is required to activate this membership', 402);
    }
    paymentReference = payment.paymentNumber;
  }

  const existing = await Member.findOne({ userId });
  if (existing && paymentReference && existing.paymentReference === paymentReference) {
    return existing.populate([
      { path: 'userId', select: 'name email phone profileImage' },
      { path: 'membershipPlan', select: 'name tier price benefits durationMonths durationDays discountPercentage courtBookingDiscount shopDiscount cafeDiscount' },
    ]);
  }

  // A member holds exactly one plan: they may renew it, but cannot switch to a different plan while active.
  const isRenewal = Boolean(existing && existing.status === 'active' && String(existing.membershipPlan) === String(plan._id));
  if (existing && existing.status === 'active' && !isRenewal) {
    throw new ConflictError('You cannot switch to another plan while your membership is active. Renew your current plan instead.');
  }

  const start = new Date();
  const end = new Date(start);
  if (plan.durationDays) {
    end.setDate(end.getDate() + plan.durationDays);
  } else {
    end.setMonth(end.getMonth() + plan.durationMonths);
  }

  const effectivePaymentMethod = plan.price === 0 ? 'free_trial' : paymentMethod;

  let member: MemberDocument;
  if (existing) {
    existing.membershipPlan = plan._id as mongoose.Types.ObjectId;
    existing.tier = plan.tier;
    existing.status = 'active';
    existing.startDate = start;
    existing.endDate = end;
    existing.amountPaid = plan.price;
    existing.paymentMethod = effectivePaymentMethod;
    if (paymentReference) existing.paymentReference = paymentReference;
    if (notes) existing.notes = notes;
    await existing.save();
    member = existing;
  } else {
    member = await Member.create({
      userId,
      membershipPlan: plan._id,
      tier: plan.tier,
      status: 'active',
      startDate: start,
      endDate: end,
      amountPaid: plan.price,
      paymentMethod: effectivePaymentMethod,
      paymentReference,
      notes,
    });
  }

  // Update user role to member
  await User.findByIdAndUpdate(userId, { role: 'member' });

  // Record revenue if price > 0
  if (plan.price > 0) {
    await Transaction.create({
      type: 'revenue',
      source: 'membership',
      amount: plan.price,
      paymentMethod: effectivePaymentMethod === 'free_trial' ? 'online' : effectivePaymentMethod,
      reference: member.memberId,
      description: `Membership subscription: ${plan.name} (${plan.tier.toUpperCase()})`,
      relatedId: member._id,
      performedBy: userId,
    });
  }

  // Let the manager desk know about the membership activity.
  try {
    await createNotification({
      audience: 'manager',
      kind: 'membership_subscribed',
      title: isRenewal ? 'Membership renewed' : 'New membership',
      message: `${user.name} ${isRenewal ? 'renewed' : 'subscribed to'} the ${plan.name} plan (₹${plan.price}).`,
      relatedId: member._id.toString(),
    });
  } catch (error) {
    console.error('Failed to raise membership notification:', error);
  }

  return member.populate([
    { path: 'userId', select: 'name email phone profileImage' },
    { path: 'membershipPlan', select: 'name tier price benefits durationMonths durationDays discountPercentage courtBookingDiscount shopDiscount cafeDiscount' },
  ]);
};

export const createMember = async (data: CreateMemberInput): Promise<MemberDocument> => {
  const { userId, membershipPlanId, startDate, amountPaid, paymentMethod, paymentReference, notes } = data;

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  const existing = await Member.findOne({ userId });
  if (existing) throw new ConflictError('User is already a member');

  const plan = await MembershipPlan.findById(membershipPlanId);
  if (!plan) throw new NotFoundError('Membership plan not found');
  if (!plan.isActive) throw new AppError('Membership plan is not active', 400);

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  if (plan.durationDays) {
    end.setDate(end.getDate() + plan.durationDays);
  } else {
    end.setMonth(end.getMonth() + plan.durationMonths);
  }

  const member = await Member.create({
    userId,
    membershipPlan: membershipPlanId,
    tier: plan.tier,
    status: 'active',
    startDate: start,
    endDate: end,
    amountPaid,
    paymentMethod,
    paymentReference,
    notes,
  });

  await User.findByIdAndUpdate(userId, { role: 'member' });

  return member.populate([
    { path: 'userId', select: 'name email phone profileImage' },
    { path: 'membershipPlan', select: 'name tier price benefits' },
  ]);
};

/**
 * Staff-side member creation: creates the login account (if needed) and the
 * membership in one step, so managers can onboard walk-in members directly.
 */
export const createMemberWithUser = async (data: CreateMemberDirectInput): Promise<MemberDocument> => {
  const { name, email, phone, tier, amountPaid, paymentMethod } = data;

  let user = await User.findOne({ email });
  if (user) {
    const existingMember = await Member.findOne({ userId: user._id });
    if (existingMember) throw new ConflictError('A membership already exists for this email');
  } else {
    user = await User.create({
      name,
      email,
      phone,
      password: 'Member@12345',
      role: 'member',
      isActive: true,
    });
  }

  const plan = await MembershipPlan.findOne({ tier });
  if (!plan) throw new NotFoundError('No membership plan found for this tier');

  const start = new Date();
  const end = new Date(start);
  if (plan.durationDays) {
    end.setDate(end.getDate() + plan.durationDays);
  } else {
    end.setMonth(end.getMonth() + plan.durationMonths);
  }

  const paid = amountPaid ?? plan.price;
  const method = paymentMethod || (plan.price === 0 ? 'free_trial' : 'online');

  const member = await Member.create({
    userId: user._id,
    membershipPlan: plan._id,
    tier: plan.tier,
    status: 'active',
    startDate: start,
    endDate: end,
    amountPaid: paid,
    paymentMethod: method,
  });

  if (paid > 0) {
    await Transaction.create({
      type: 'revenue',
      source: 'membership',
      amount: paid,
      paymentMethod: method === 'free_trial' ? 'online' : method,
      reference: member.memberId,
      description: `Membership created by staff: ${plan.name} (${plan.tier.toUpperCase()})`,
      relatedId: member._id,
      performedBy: user._id,
    });
  }

  return member.populate([
    { path: 'userId', select: 'name email phone profileImage' },
    { path: 'membershipPlan', select: 'name tier price benefits' },
  ]);
};

export const getMembers = async (query: {
  search?: string;
  status?: string;
  tier?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, status, tier, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const memberFilter: Record<string, unknown> = {};
  if (status) memberFilter.status = status;
  if (tier) memberFilter.tier = tier;

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const userIds = users.map((u) => u._id as mongoose.Types.ObjectId);
    memberFilter.$or = [
      { userId: { $in: userIds } },
      { memberId: { $regex: search, $options: 'i' } },
    ];
  }

  const [members, total] = await Promise.all([
    Member.find(memberFilter)
      .populate('userId', 'name email phone profileImage lastLogin')
      .populate('membershipPlan', 'name tier price benefits durationMonths durationDays')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Member.countDocuments(memberFilter),
  ]);

  return { members, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getMemberById = async (id: string): Promise<MemberDocument> => {
  const member = await Member.findById(id)
    .populate('userId', 'name email phone profileImage lastLogin')
    .populate('membershipPlan', 'name tier price benefits durationMonths durationDays');
  if (!member) throw new NotFoundError('Member not found');
  return member;
};

export const getMemberByUserId = async (userId: string): Promise<MemberDocument | null> => {
  return Member.findOne({ userId })
    .populate('userId', 'name email phone profileImage lastLogin')
    .populate('membershipPlan', 'name tier price benefits discountPercentage courtBookingDiscount shopDiscount cafeDiscount maxBookingsPerDay durationMonths durationDays');
};

export const updateMember = async (id: string, data: UpdateMemberInput): Promise<MemberDocument> => {
  const member = await Member.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('userId', 'name email phone')
    .populate('membershipPlan', 'name tier price');
  if (!member) throw new NotFoundError('Member not found');
  return member;
};

export const renewMembership = async (id: string, data: RenewMembershipInput): Promise<MemberDocument> => {
  const member = await Member.findById(id);
  if (!member) throw new NotFoundError('Member not found');

  const planId = data.membershipPlanId || member.membershipPlan.toString();
  const plan = await MembershipPlan.findById(planId);
  if (!plan) throw new NotFoundError('Membership plan not found');

  member.renewalHistory.push({
    renewedAt: new Date(),
    endDate: member.endDate,
    amountPaid: data.amountPaid,
    paymentMethod: data.paymentMethod,
  });

  const renewFrom = member.endDate > new Date() ? member.endDate : new Date();
  const newEndDate = new Date(renewFrom);
  if (plan.durationDays) {
    newEndDate.setDate(newEndDate.getDate() + plan.durationDays);
  } else {
    newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);
  }

  member.membershipPlan = new mongoose.Types.ObjectId(planId);
  member.tier = plan.tier;
  member.endDate = newEndDate;
  member.status = 'active';
  member.amountPaid = data.amountPaid;
  member.paymentMethod = data.paymentMethod;
  if (data.paymentReference) member.paymentReference = data.paymentReference;

  await member.save();
  return member.populate([
    { path: 'userId', select: 'name email phone' },
    { path: 'membershipPlan', select: 'name tier price' },
  ]);
};

export const checkAndExpireMemberships = async (): Promise<number> => {
  const result = await Member.updateMany(
    { endDate: { $lt: new Date() }, status: 'active' },
    { $set: { status: 'expired' } }
  );
  return result.modifiedCount;
};
