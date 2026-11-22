import mongoose, { Document, Schema } from 'mongoose';

export type NotificationAudience = 'customer' | 'manager' | 'staff' | 'admin' | 'all';

export interface INotification {
  audience: NotificationAudience;
  kind: string;
  title: string;
  message: string;
  /** When set, the notification is personal to this user. */
  user?: mongoose.Types.ObjectId;
  /** Optional link back to the source document (booking, order, member...). */
  relatedId?: mongoose.Types.ObjectId;
  read: boolean;
  meta?: Record<string, unknown>;
}

export interface NotificationDocument extends INotification, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    audience: {
      type: String,
      enum: ['customer', 'manager', 'staff', 'admin', 'all'],
      default: 'manager',
      index: true,
    },
    kind: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    relatedId: { type: Schema.Types.ObjectId },
    read: { type: Boolean, default: false, index: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ audience: 1, createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);
