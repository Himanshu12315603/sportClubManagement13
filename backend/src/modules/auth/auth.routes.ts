import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

const router = Router();

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many password reset attempts. Try again after 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordLimiter, authController.forgotPassword);
router.post('/reset-password/:token', passwordLimiter, authController.resetPassword);

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.patch('/change-password', requireAuth, authController.changePassword);
router.patch('/profile', requireAuth, authController.updateProfile);
router.get('/users', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist'), authController.getAllUsers);

export default router;
