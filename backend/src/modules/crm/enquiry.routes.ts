import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as enquiryController from './enquiry.controller';

const router = Router();

// Anyone can submit an enquiry (public)
router.post('/', enquiryController.submit);

// Admin/staff only
router.get('/', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist'), enquiryController.getAll);
router.get('/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist'), enquiryController.getById);
router.patch('/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist'), enquiryController.update);
router.post('/:id/notes', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist'), enquiryController.addNote);

export default router;
