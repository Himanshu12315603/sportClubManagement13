import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes';
import memberRoutes from '../modules/members/member.routes';
import bookingRoutes from '../modules/courts/booking.routes';
import productRoutes from '../modules/products/product.routes';
import cafeRoutes from '../modules/cafeteria/cafeteria.routes';
import financeRoutes from '../modules/finance/finance.routes';
import employeeRoutes from '../modules/employees/employee.routes';
import enquiryRoutes from '../modules/crm/enquiry.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import trialRoutes from '../modules/trials/trial.routes';
import aiRoutes from '../modules/ai/ai.routes';
import activityRoutes from '../modules/activity/activity.routes';

const router = Router();

// Mounted under /api/v1
router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/', bookingRoutes);       // /courts and /bookings
router.use('/', productRoutes);       // /products, /categories, /orders, /inventory
router.use('/cafe', cafeRoutes);
router.use('/finance', financeRoutes);
router.use('/employees', employeeRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/payments', paymentRoutes);
router.use('/trials', trialRoutes);
router.use('/ai', aiRoutes);
router.use('/activities', activityRoutes);

export default router;

// Named exports for convenience
export {
  authRoutes,
  memberRoutes,
  bookingRoutes,
  productRoutes,
  cafeRoutes,
  financeRoutes,
  employeeRoutes,
  enquiryRoutes,
  paymentRoutes,
  trialRoutes,
  aiRoutes,
  activityRoutes,
};
