import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole } from '../../middleware/auth';
import { User } from '../auth/auth.model';
import * as trialController from './trial.controller';

const router = Router();

// Middleware: optionally attach user if token present (for public/optional routes)
const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    } catch {
      // Ignore invalid token on optional route
    }
  }
  next();
};

// Public trial session booking (can be called by guests or logged-in members)
router.post('/register', optionalAuth, trialController.register);

// Protected: member view of their own trial bookings
router.get('/my-trials', requireAuth, trialController.getMyTrials);

// Protected: staff/coach/admin management
router.get('/', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.getTrials);
router.get('/:id', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.getById);
router.patch('/:id/status', requireAuth, requireRole('super_admin', 'owner', 'manager', 'receptionist', 'coach'), trialController.updateStatus);

export default router;
