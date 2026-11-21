import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as trialController from './trial.controller';

const router = Router();

// Public: website visitors can register for a trial
router.post('/register', trialController.register);

// Protected: staff/coach/admin management
router.get('/', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.getTrials);
router.get('/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.getById);
router.patch('/:id/status', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.updateStatus);

export default router;
