import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as activityController from './activity.controller';

const router = Router();

// All activity routes require authentication
router.use(requireAuth);

// User can see their own activities
router.get('/my', activityController.getMyActivities);

// Managers and admins can see all activities
router.get('/all', requireRole('super_admin', 'owner', 'manager', 'receptionist'), activityController.getAllActivities);
router.get('/stats', requireRole('super_admin', 'owner', 'manager', 'receptionist'), activityController.getActivityStats);

export default router;
