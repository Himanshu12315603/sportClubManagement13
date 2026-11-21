import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as productController from './product.controller';

const router = Router();

// Categories (public read)
router.get('/categories', productController.getCategories);
router.post('/categories', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff'), productController.createCategory);

// Products (public read)
router.get('/products', productController.getProducts);
router.post('/products', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff'), productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.patch('/products/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff'), productController.updateProduct);

// Inventory
router.post('/inventory/adjust', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff'), productController.adjustStock);

// Orders
router.get('/orders/my', requireAuth, productController.getMyOrders);
router.post('/orders', requireAuth, productController.createOrder);
router.get('/orders', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff', 'accountant'), productController.getOrders);
router.get('/orders/:id', requireAuth, productController.getOrderById);
router.patch('/orders/:id/status', requireAuth, requireRole('super_admin', 'owner', 'manager', 'shop_staff'), productController.updateOrderStatus);

export default router;
