import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as memberController from './member.controller';

const router = Router();

// Public plan browsing
router.get('/plans', memberController.getPlans);

// Protected routes
router.use(requireAuth);

// Plan administration
router.post('/plans', requireRole('super_admin', 'owner', 'manager'), memberController.createPlan);
router.patch('/plans/:id', requireRole('super_admin', 'owner', 'manager'), memberController.updatePlan);
router.delete('/plans/:id', requireRole('super_admin', 'owner'), memberController.deletePlan);

// Member Self-Service (any logged-in member/visitor can view their own membership or subscribe)
router.get('/my-membership', memberController.getMyMembership);
router.post('/subscribe', memberController.subscribeMembership);

// Staff / Admin Management
router.get('/', requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'), memberController.getMembers);
router.post('/', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.createMember);
router.post('/direct', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.createMemberDirect);
router.get('/:id', requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'), memberController.getMemberById);
router.patch('/:id', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.updateMember);
router.post('/:id/renew', requireRole('super_admin', 'owner', 'manager', 'receptionist'), memberController.renewMembership);
router.post('/expire-check', requireRole('super_admin', 'owner', 'manager'), memberController.expireMemberships);

export default router;
