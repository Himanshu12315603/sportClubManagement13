import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as notificationController from './notification.controller';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.post('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markNotificationRead);

// Staff / admin broadcast
router.post(
  '/broadcast',
  requireRole('super_admin', 'owner', 'manager', 'receptionist'),
  notificationController.broadcast
);

export default router;
