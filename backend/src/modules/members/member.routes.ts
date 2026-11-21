import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as memberController from './member.controller';

const router = Router();

// All member routes require authentication
router.use(requireAuth);

// ---- Membership Plans ----
router.get('/plans', memberController.getPlans);  // Public read (even members can see plans)
router.post('/plans', requireRole('super_admin', 'owner', 'manager'), memberController.createPlan);
router.patch('/plans/:id', requireRole('super_admin', 'owner', 'manager'), memberController.updatePlan);
router.delete('/plans/:id', requireRole('super_admin', 'owner'), memberController.deletePlan);

// ---- Members ----
router.get('/my-membership', memberController.getMyMembership);  // Any logged-in user

router.get('/', requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'), memberController.getMembers);
router.post('/', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.createMember);
router.get('/:id', requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'), memberController.getMemberById);
router.patch('/:id', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.updateMember);
router.post('/:id/renew', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.renewMembership);
router.post('/expire-check', requireRole('super_admin', 'owner', 'manager'), memberController.expireMemberships);

export default router;
