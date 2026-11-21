import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as empController from './employee.controller';

const router = Router();
router.use(requireAuth);

router.post('/', requireRole('super_admin', 'owner', 'manager'), empController.createEmployee);
router.get('/', requireRole('super_admin', 'owner', 'manager', 'accountant'), empController.getEmployees);
router.get('/:id', requireRole('super_admin', 'owner', 'manager'), empController.getEmployeeById);
router.patch('/:id', requireRole('super_admin', 'owner', 'manager'), empController.updateEmployee);

// Attendance
router.post('/attendance', requireRole('super_admin', 'owner', 'manager'), empController.markAttendance);
router.get('/:id/attendance', requireRole('super_admin', 'owner', 'manager', 'accountant'), empController.getAttendance);

// Leave
router.post('/leave', empController.submitLeave);
router.get('/leave/all', requireRole('super_admin', 'owner', 'manager'), empController.getLeaveRequests);
router.patch('/leave/:id/process', requireRole('super_admin', 'owner', 'manager'), empController.processLeave);

export default router;
