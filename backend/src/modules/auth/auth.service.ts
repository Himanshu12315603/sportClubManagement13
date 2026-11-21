import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserDocument } from './auth.model';
import { AppError, AuthenticationError, NotFoundError } from '../../utils/AppError';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from './auth.validation';

// ---- Token generation ----

export const generateAccessToken = (user: UserDocument): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn }
  );
};

export const generateRefreshToken = (user: UserDocument): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured');
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'];
  return jwt.sign(
    { id: user._id },
    secret,
    { expiresIn }
  );
};

// ---- Auth Service ----

export const registerUser = async (data: RegisterInput): Promise<{ user: UserDocument; accessToken: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError('Email already registered', 409);

  const user = await User.create(data);
  const accessToken = generateAccessToken(user);
  return { user, accessToken };
};

export const loginUser = async (
  data: LoginInput
): Promise<{ user: UserDocument; accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user) throw new AuthenticationError('Invalid email or password');

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) throw new AuthenticationError('Invalid email or password');

  if (!user.isActive) throw new AuthenticationError('Account deactivated. Contact support.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const getMe = async (userId: string): Promise<UserDocument> => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const forgotPassword = async (data: ForgotPasswordInput): Promise<string> => {
  const user = await User.findOne({ email: data.email });
  if (!user) return 'If that email exists, a reset link has been sent.';

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  console.log(`🔗 Password reset URL (dev): ${resetUrl}`);
  return 'If that email exists, a reset link has been sent.';
};

export const resetPassword = async (
  token: string,
  data: ResetPasswordInput
): Promise<{ user: UserDocument; accessToken: string }> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = data.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const accessToken = generateAccessToken(user);
  return { user, accessToken };
};

export const changePassword = async (
  userId: string,
  data: ChangePasswordInput
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new NotFoundError('User not found');

  const isMatch = await user.comparePassword(data.currentPassword);
  if (!isMatch) throw new AuthenticationError('Current password is incorrect');

  user.password = data.newPassword;
  await user.save();
};

export const updateProfile = async (
  userId: string,
  data: { name?: string; phone?: string; profileImage?: string }
): Promise<UserDocument> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!user) throw new NotFoundError('User not found');
  return user;
};
