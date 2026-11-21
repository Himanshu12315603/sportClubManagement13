import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import * as paymentController from './payment.controller';

const router = Router();
router.use(requireAuth);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verify);
router.get('/my', paymentController.getMyPayments);
router.get('/:id', paymentController.getById);

export default router;
