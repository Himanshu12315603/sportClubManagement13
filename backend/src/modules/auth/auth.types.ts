import { Document } from 'mongoose';

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

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  profileImage?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

export interface TokenPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
