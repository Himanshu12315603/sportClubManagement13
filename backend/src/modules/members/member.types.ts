import mongoose, { Document } from 'mongoose';

export type MembershipTier = 'gold' | 'silver' | 'junior' | 'trial';
export type MembershipStatus = 'active' | 'expired' | 'suspended' | 'pending';

export interface IMembershipPlan {
  name: string;
  tier: MembershipTier;
  description: string;
  price: number;
  durationMonths: number;
  durationDays?: number;
  discountPercentage: number;
  courtBookingDiscount: number;
  shopDiscount: number;
  cafeDiscount: number;
  maxBookingsPerDay: number;
  benefits: string[];
  isActive: boolean;
}

export interface MembershipPlanDocument extends IMembershipPlan, Document {}

export interface IMemberRenewal {
  renewedAt: Date;
  endDate: Date;
  amountPaid: number;
  paymentMethod: string;
}

export interface IMember {
  memberId: string;
  userId: mongoose.Types.ObjectId;
  membershipPlan: mongoose.Types.ObjectId;
  tier: MembershipTier;
  status: MembershipStatus;
  startDate: Date;
  endDate: Date;
  amountPaid: number;
  paymentMethod: string;
  paymentReference?: string;
  renewalHistory: IMemberRenewal[];
  notes?: string;
}

export interface MemberDocument extends IMember, Document {}

export interface SubscribeMembershipInput {
  membershipPlanId: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online' | 'free_trial';
  paymentReference?: string;
  notes?: string;
}
