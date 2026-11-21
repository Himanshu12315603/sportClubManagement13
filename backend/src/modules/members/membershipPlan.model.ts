import mongoose, { Document, Schema } from 'mongoose';

export type MembershipTier = 'gold' | 'silver' | 'junior';

export interface IMembershipPlan {
  name: string;
  tier: MembershipTier;
  description: string;
  price: number;
  durationMonths: number;
  discountPercentage: number;
  courtBookingDiscount: number;
  shopDiscount: number;
  cafeDiscount: number;
  maxBookingsPerDay: number;
  benefits: string[];
  isActive: boolean;
}

export interface MembershipPlanDocument extends IMembershipPlan, Document {}

const membershipPlanSchema = new Schema<MembershipPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    tier: {
      type: String,
      enum: ['gold', 'silver', 'junior'],
      required: true,
      unique: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    courtBookingDiscount: { type: Number, default: 0, min: 0, max: 100 },
    shopDiscount: { type: Number, default: 0, min: 0, max: 100 },
    cafeDiscount: { type: Number, default: 0, min: 0, max: 100 },
    maxBookingsPerDay: { type: Number, default: 2 },
    benefits: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model<MembershipPlanDocument>('MembershipPlan', membershipPlanSchema);
