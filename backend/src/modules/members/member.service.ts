import { Member, MemberDocument } from './member.model';
import { MembershipPlan, MembershipPlanDocument } from './membershipPlan.model';
import { User } from '../auth/auth.model';
import { AppError, NotFoundError, ConflictError } from '../../utils/AppError';
import { CreateMemberInput, RenewMembershipInput, UpdateMemberInput } from './member.validation';
import mongoose from 'mongoose';

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
  // Soft delete
  plan.isActive = false;
  await plan.save();
};

// ---- Members ----

export const createMember = async (data: CreateMemberInput): Promise<MemberDocument> => {
  const { userId, membershipPlanId, startDate, amountPaid, paymentMethod, paymentReference, notes } = data;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  // Check if user is already a member
  const existing = await Member.findOne({ userId });
  if (existing) throw new ConflictError('User is already a member');

  // Get plan
  const plan = await MembershipPlan.findById(membershipPlanId);
  if (!plan) throw new NotFoundError('Membership plan not found');
  if (!plan.isActive) throw new AppError('Membership plan is not active', 400);

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);

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

  // Update user role to member
  await User.findByIdAndUpdate(userId, { role: 'member' });

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

  // Build filter
  const memberFilter: Record<string, unknown> = {};
  if (status) memberFilter.status = status;
  if (tier) memberFilter.tier = tier;

  // If search, find user IDs first
  let userIds: mongoose.Types.ObjectId[] | undefined;
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    userIds = users.map((u) => u._id as mongoose.Types.ObjectId);
    memberFilter.userId = { $in: userIds };
  }

  const [members, total] = await Promise.all([
    Member.find(memberFilter)
      .populate('userId', 'name email phone profileImage')
      .populate('membershipPlan', 'name tier price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Member.countDocuments(memberFilter),
  ]);

  return { members, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getMemberById = async (id: string): Promise<MemberDocument> => {
  const member = await Member.findById(id)
    .populate('userId', 'name email phone profileImage')
    .populate('membershipPlan', 'name tier price benefits');
  if (!member) throw new NotFoundError('Member not found');
  return member;
};

export const getMemberByUserId = async (userId: string): Promise<MemberDocument | null> => {
  return Member.findOne({ userId })
    .populate('userId', 'name email phone profileImage')
    .populate('membershipPlan', 'name tier price benefits discountPercentage courtBookingDiscount shopDiscount cafeDiscount maxBookingsPerDay');
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

  // Push current end date to renewal history
  member.renewalHistory.push({
    renewedAt: new Date(),
    endDate: member.endDate,
    amountPaid: data.amountPaid,
    paymentMethod: data.paymentMethod,
  });

  // Extend from today or existing end date, whichever is later
  const renewFrom = member.endDate > new Date() ? member.endDate : new Date();
  const newEndDate = new Date(renewFrom);
  newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);

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

// Auto-expire memberships (run via cron or on-demand)
export const checkAndExpireMemberships = async (): Promise<number> => {
  const result = await Member.updateMany(
    { endDate: { $lt: new Date() }, status: 'active' },
    { $set: { status: 'expired' } }
  );
  return result.modifiedCount;
};
