import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as financeController from './finance.controller';

const router = Router();
router.use(requireAuth, requireRole('super_admin', 'owner', 'accountant', 'manager'));

router.get('/summary', financeController.getSummary);
router.get('/transactions', financeController.getTransactions);
router.post('/transactions', financeController.recordTransaction);
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', financeController.addExpense);

export default router;
