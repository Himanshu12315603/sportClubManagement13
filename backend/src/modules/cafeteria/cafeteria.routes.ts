import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as cafeController from './cafeteria.controller';

const router = Router();

// Menu (public read)
router.get('/menu', cafeController.getMenu);
router.post('/menu', requireAuth, requireRole('super_admin', 'owner', 'manager', 'bar_staff'), cafeController.createMenuItem);
router.patch('/menu/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'bar_staff'), cafeController.updateMenuItem);

// Tables
router.get('/tables', requireAuth, cafeController.getTables);
router.post('/tables', requireAuth, requireRole('super_admin', 'owner', 'manager'), cafeController.createTable);
router.patch('/tables/:id/status', requireAuth, requireRole('super_admin', 'owner', 'manager', 'bar_staff'), cafeController.updateTableStatus);

// Orders
router.get('/orders/my', requireAuth, cafeController.getMyOrders);
router.post('/orders', requireAuth, cafeController.createOrder);
router.get('/orders', requireAuth, requireRole('super_admin', 'owner', 'manager', 'bar_staff', 'accountant'), cafeController.getOrders);
router.get('/orders/:id', requireAuth, cafeController.getOrderById);
router.patch('/orders/:id/status', requireAuth, requireRole('super_admin', 'owner', 'manager', 'bar_staff'), cafeController.updateOrderStatus);

export default router;
