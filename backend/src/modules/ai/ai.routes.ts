import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as aiController from './ai.controller';

const router = Router();
router.use(requireAuth, requireRole('super_admin', 'owner', 'manager', 'accountant'));

router.get('/insights', aiController.getInsights);
router.post('/insights/refresh', aiController.refreshInsights);

export default router;
