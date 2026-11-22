import { Notification, NotificationDocument, NotificationAudience } from './notification.model';

export const createNotification = async (data: {
  audience: NotificationAudience;
  kind: string;
  title: string;
  message: string;
  user?: string;
  relatedId?: string;
  meta?: Record<string, unknown>;
}): Promise<NotificationDocument> => {
  return Notification.create(data);
};

/** Fetch notifications visible to a set of audiences (plus any personal to the user). */
export const getNotifications = async (audiences: NotificationAudience[], userId?: string, limit = 60) => {
  const or: Array<Record<string, unknown>> = [{ audience: { $in: audiences } }];
  if (userId) or.push({ user: userId });
  return Notification.find({ $or: or }).sort({ createdAt: -1 }).limit(limit);
};

export const markNotificationRead = async (id: string): Promise<NotificationDocument> => {
  const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!notification) throw new Error('Notification not found');
  return notification;
};

export const markAllRead = async (audiences: NotificationAudience[], userId?: string): Promise<void> => {
  const or: Array<Record<string, unknown>> = [{ audience: { $in: audiences } }];
  if (userId) or.push({ user: userId });
  await Notification.updateMany({ $or: or }, { read: true });
};
