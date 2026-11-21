import mongoose, { Document } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type BookingType = 'member' | 'walk_in' | 'social_play';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IBookingParticipant {
  name: string;
  memberId?: string;
  phone?: string;
}

export interface IBooking {
  court: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  memberUserId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  bookingType: BookingType;
  status: BookingStatus;
  price: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  participants?: IBookingParticipant[];
  notes?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
}

export interface BookingDocument extends IBooking, Document {}

export interface ISlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}
