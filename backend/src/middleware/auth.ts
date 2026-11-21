import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../modules/auth/auth.model';
import { AuthenticationError, AuthorizationError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: UserDocument;
}

// Extend express Request globally
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // Then check cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      return next(new AuthenticationError('Authentication required. Please log in.'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as { id: string; role: string; iat: number; exp: number };

    // Lazy import to avoid circular deps
    const { User } = await import('../modules/auth/auth.model');
    const user = await User.findById(decoded.id).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return next(new AuthenticationError('User belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(new AuthenticationError('Your account has been deactivated. Please contact support.'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'manager'
  | 'receptionist'
  | 'shop_staff'
  | 'bar_staff'
  | 'accountant'
  | 'coach'
  | 'member'
  | 'visitor';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }
    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AuthorizationError(
          `Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};
