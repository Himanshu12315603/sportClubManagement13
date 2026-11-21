import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'booking_created'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'order_placed'
  | 'membership_renewed'
  | 'profile_updated'
  | 'password_changed'
  | 'payment_made';

export interface IActivity {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityDocument extends IActivity, Document {}

const activitySchema = new Schema<ActivityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'login',
        'logout',
        'booking_created',
        'booking_cancelled',
        'booking_completed',
        'order_placed',
        'membership_renewed',
        'profile_updated',
        'password_changed',
        'payment_made',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<ActivityDocument>('Activity', activitySchema);
