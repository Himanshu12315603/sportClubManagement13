import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as notificationService from './notification.service';
import { NotificationAudience } from './notification.model';
import { AppError } from '../../utils/AppError';

const STAFF_ROLES = ['manager', 'super_admin', 'owner', 'receptionist', 'accountant', 'shop_staff', 'bar_staff', 'coach'];

/** Which audiences can the current role see. */
const audiencesFor = (role: string): NotificationAudience[] => {
  if (role === 'super_admin' || role === 'owner') return ['manager', 'staff', 'admin', 'all'];
  if (STAFF_ROLES.includes(role)) return ['manager', 'staff', 'all'];
  return ['customer', 'all'];
};

export const getNotifications = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = req.user!;
  const audiences = audiencesFor(user.role);
  const notifications = await notificationService.getNotifications(audiences, user._id.toString());
  sendSuccess(res, { notifications }, 'Notifications fetched');
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const notification = await notificationService.markNotificationRead(getParam(req));
  sendSuccess(res, { notification }, 'Notification marked as read');
});

export const markAllRead = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = req.user!;
  await notificationService.markAllRead(audiencesFor(user.role), user._id.toString());
  sendSuccess(res, {}, 'All notifications marked as read');
});

/** Staff can broadcast a message to an audience (members / managers / everyone). */
export const broadcast = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { audience = 'customer', kind = 'general', title = 'Club announcement', message } = req.body || {};
  if (!message || !String(message).trim()) {
    throw new AppError('Message is required', 400);
  }
  const notification = await notificationService.createNotification({
    audience: (['customer', 'manager', 'staff', 'admin', 'all'].includes(audience) ? audience : 'customer') as NotificationAudience,
    kind,
    title,
    message: String(message).trim(),
  });
  sendSuccess(res, { notification }, 'Broadcast sent', 201);
});
