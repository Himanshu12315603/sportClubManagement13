import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import * as authService from './auth.service';
import { logActivity } from '../activity/activity.service';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = registerSchema.parse({ body: req.body });
  const { user, accessToken } = await authService.registerUser(validated.body);

  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);

  sendCreated(res, { user, accessToken }, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = loginSchema.parse({ body: req.body });
  const { user, accessToken, refreshToken, member } = await authService.loginUser(validated.body);

  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

  sendSuccess(res, { user, member, accessToken }, 'Login successful');
});

export const logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  // Log logout activity
  if (req.user) {
    await logActivity({
      userId: req.user._id.toString(),
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'logout',
      description: 'User logged out',
    });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  sendSuccess(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = await authService.getMe(req.user!._id.toString());
  sendSuccess(res, { user }, 'Profile fetched');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = forgotPasswordSchema.parse({ body: req.body });
  const message = await authService.forgotPassword(validated.body);
  sendSuccess(res, null, message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = resetPasswordSchema.parse({ params: req.params, body: req.body });
  const { user, accessToken } = await authService.resetPassword(validated.params.token, validated.body);

  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
  sendSuccess(res, { user, accessToken }, 'Password reset successful');
});

export const changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = changePasswordSchema.parse({ body: req.body });
  await authService.changePassword(req.user!._id.toString(), validated.body);

  // Log password change activity
  await logActivity({
    userId: req.user!._id.toString(),
    userName: req.user.name,
    userEmail: req.user.email,
    type: 'password_changed',
    description: 'User changed their password',
  });

  sendSuccess(res, null, 'Password changed successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { name, phone, profileImage } = req.body as {
    name?: string;
    phone?: string;
    profileImage?: string;
  };
  const user = await authService.updateProfile(req.user!._id.toString(), { name, phone, profileImage });

  // Log profile update activity
  await logActivity({
    userId: req.user!._id.toString(),
    userName: req.user.name,
    userEmail: req.user.email,
    type: 'profile_updated',
    description: 'User updated their profile',
    metadata: { fields: Object.keys({ name, phone, profileImage }).filter(k => req.body[k]) },
  });

  sendSuccess(res, { user }, 'Profile updated successfully');
});

export const getAllUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const users = await authService.getAllUsers();
  sendSuccess(res, { users }, 'Users fetched');
});
