import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type BookingType = 'member' | 'walk_in' | 'social_play';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IBooking {
  court: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;        // User who made the booking
  memberUserId?: mongoose.Types.ObjectId;   // The member playing (may differ from bookedBy for staff-assisted)
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  bookingType: BookingType;
  status: BookingStatus;
  price: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  participants?: Array<{
    name: string;
    memberId?: string;
    phone?: string;
  }>;
  notes?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
}

export interface BookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<BookingDocument>(
  {
    court: { type: Schema.Types.ObjectId, ref: 'Court', required: true, index: true },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60 },
    bookingType: {
      type: String,
      enum: ['member', 'walk_in', 'social_play'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'confirmed',
    },
    price: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: String,
    paymentReference: String,
    participants: [
      {
        name: String,
        memberId: String,
        phone: String,
      },
    ],
    notes: String,
    cancelledAt: Date,
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound index for fast conflict detection
bookingSchema.index({ court: 1, startTime: 1, endTime: 1, status: 1 });
// Daily booking count per member
bookingSchema.index({ memberUserId: 1, startTime: 1 });

export const Booking = mongoose.model<BookingDocument>('Booking', bookingSchema);
