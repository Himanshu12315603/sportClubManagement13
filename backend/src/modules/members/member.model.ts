import mongoose, { Document, Schema } from 'mongoose';
import { MembershipTier } from './membershipPlan.model';

export type MembershipStatus = 'active' | 'expired' | 'suspended' | 'pending';

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
  renewalHistory: Array<{
    renewedAt: Date;
    endDate: Date;
    amountPaid: number;
    paymentMethod: string;
  }>;
  notes?: string;
}

export interface MemberDocument extends IMember, Document {}

const memberSchema = new Schema<MemberDocument>(
  {
    memberId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    membershipPlan: {
      type: Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    tier: {
      type: String,
      enum: ['gold', 'silver', 'junior', 'trial'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'pending'],
      default: 'active',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'free_trial'],
      required: true,
    },
    paymentReference: String,
    renewalHistory: [
      {
        renewedAt: Date,
        endDate: Date,
        amountPaid: Number,
        paymentMethod: String,
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

memberSchema.index({ status: 1 });
memberSchema.index({ endDate: 1 });
memberSchema.index({ tier: 1 });

memberSchema.pre('validate', async function () {
  if (!this.memberId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Member').countDocuments();
    this.memberId = `CC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

export const Member = mongoose.model<MemberDocument>('Member', memberSchema);
