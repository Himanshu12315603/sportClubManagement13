import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as bookingController from './booking.controller';

const router = Router();

// ---- Courts (some public, some protected) ----
router.get('/courts', bookingController.getCourts);
router.get('/courts/availability', bookingController.getAvailability);  // Public availability check
router.get('/courts/:id', bookingController.getCourtById);
router.post('/courts', requireAuth, requireRole('super_admin', 'owner', 'manager'), bookingController.createCourt);
router.patch('/courts/:id', requireAuth, requireRole('super_admin', 'owner', 'manager'), bookingController.updateCourt);
router.delete('/courts/:id', requireAuth, requireRole('super_admin', 'owner'), bookingController.deleteCourt);

// ---- Bookings ----
router.get('/bookings/my', requireAuth, bookingController.getMyBookings);
router.post('/bookings', requireAuth, bookingController.createBooking);
router.get(
  '/bookings',
  requireAuth,
  requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'),
  bookingController.getBookings
);
router.get('/bookings/:id', requireAuth, bookingController.getBookingById);
router.post('/bookings/:id/cancel', requireAuth, bookingController.cancelBooking);
router.patch(
  '/bookings/:id/pay',
  requireAuth,
  requireRole('super_admin', 'owner', 'manager', 'receptionist', 'accountant'),
  bookingController.markBookingPaid
);

export default router;
