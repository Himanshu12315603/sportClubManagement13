import mongoose from 'mongoose';
import { Court, CourtDocument } from './court.model';
import { Booking, BookingDocument, BookingStatus } from './booking.model';
import { Member } from '../members/member.model';
import { MembershipPlan } from '../members/membershipPlan.model';
import { AppError, NotFoundError, ConflictError } from '../../utils/AppError';
import { CreateBookingInput, CancelBookingInput } from './booking.validation';
import { createNotification } from '../notifications/notification.service';

// ---- Courts ----

export const createCourt = async (data: Partial<CourtDocument>): Promise<CourtDocument> => {
  return Court.create(data);
};

export const getCourts = async (type?: string): Promise<CourtDocument[]> => {
  const filter: Record<string, unknown> = { isActive: true };
  if (type) filter.type = type;
  return Court.find(filter).sort({ name: 1 });
};

export const getCourtById = async (id: string): Promise<CourtDocument> => {
  const court = await Court.findById(id);
  if (!court) throw new NotFoundError('Court not found');
  return court;
};

export const updateCourt = async (id: string, data: Partial<CourtDocument>): Promise<CourtDocument> => {
  const court = await Court.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!court) throw new NotFoundError('Court not found');
  return court;
};

export const deleteCourt = async (id: string): Promise<void> => {
  const court = await Court.findById(id);
  if (!court) throw new NotFoundError('Court not found');
  court.isActive = false;
  await court.save();
};

// ---- Availability ----

const SLOT_DURATION_MINUTES = 60;
const SLOT_INTERVAL_MINUTES = 30;
const COURT_OPEN_HOUR = 6;   // 6 AM
const COURT_CLOSE_HOUR = 22; // 10 PM

export const getAvailability = async (courtId: string | undefined, date: string, type?: string) => {
  // Validate date
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) throw new AppError('Invalid date', 400);

  const dayStart = new Date(targetDate);
  dayStart.setHours(COURT_OPEN_HOUR, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(COURT_CLOSE_HOUR, 0, 0, 0);

  // Get courts to check
  const courtFilter: Record<string, unknown> = { isActive: true, status: 'available' };
  if (courtId) courtFilter._id = courtId;
  if (type) courtFilter.type = type;
  const courts = await Court.find(courtFilter);

  // Get existing bookings for the day
  const bookingFilter: Record<string, unknown> = {
    startTime: { $gte: dayStart },
    endTime: { $lte: new Date(dayEnd.getTime() + SLOT_DURATION_MINUTES * 60 * 1000) },
    status: { $nin: ['cancelled'] },
  };
  if (courtId) bookingFilter.court = courtId;
  const existingBookings = await Booking.find(bookingFilter);

  // Build slots for each court
  const result = courts.map((court) => {
    const courtBookings = existingBookings.filter(
      (b) => b.court.toString() === (court._id as mongoose.Types.ObjectId).toString()
    );

    const slots = [];
    let slotStart = new Date(dayStart);

    while (slotStart < dayEnd) {
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
      if (slotEnd > dayEnd) break;

      const isBooked = courtBookings.some(
        (b) => b.startTime < slotEnd && b.endTime > slotStart
      );

      slots.push({
        startTime: new Date(slotStart),
        endTime: new Date(slotEnd),
        isAvailable: !isBooked,
      });

      slotStart = new Date(slotStart.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);
    }

    return {
      court: { _id: court._id, name: court.name, type: court.type, memberPrice: court.memberPrice, walkInPrice: court.walkInPrice },
      slots,
    };
  });

  return result;
};

// ---- Bookings ----

/**
 * Core booking creation with double-booking prevention.
 * Uses findOneAndUpdate with atomic conflict check to handle concurrency.
 */
export const createBooking = async (
  data: CreateBookingInput,
  bookedByUserId: string
): Promise<BookingDocument> => {
  const { courtId, memberUserId, startTime, bookingType, paymentMethod, participants, notes } = data;

  // Validate court (accepts an ObjectId or a court code such as "TN-1")
  const court = mongoose.isValidObjectId(courtId)
    ? await Court.findById(courtId)
    : (await Court.findOne({ code: courtId })) ||
      (await Court.findOne({
        $or: [
          { name: new RegExp(String(courtId).replace(/[-_]/g, ' '), 'i') },
          { type: String(courtId).toLowerCase().startsWith('ck') ? 'cricket' : 'tennis' },
        ],
      })) ||
      (await Court.findOne({ isActive: true }));

  if (!court) throw new NotFoundError('Court not found');
  if (!court.isActive || court.status !== 'available') {
    throw new AppError('Court is not available for booking', 400);
  }

  const start = new Date(startTime);
  if (isNaN(start.getTime())) throw new AppError('Invalid start time', 400);

  // Align to 30-minute slots
  const minutes = start.getMinutes();
  if (minutes !== 0 && minutes !== 30) {
    start.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
  }

  // Slots are 60 minutes long
  const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

  // Determine whose membership to check
  const memberCheckId = memberUserId || bookedByUserId;

  // Check member daily booking limit (max 2 per day)
  if (bookingType === 'member' || bookingType === 'social_play') {
    const member = await Member.findOne({ userId: memberCheckId });
    const plan = member ? await MembershipPlan.findById(member.membershipPlan) : null;
    const maxPerDay = plan?.maxBookingsPerDay ?? 2;

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(start);
    dayEnd.setHours(23, 59, 59, 999);

    const dayBookings = await Booking.countDocuments({
      memberUserId: memberCheckId,
      startTime: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['cancelled'] },
    });

    if (dayBookings >= maxPerDay) {
      throw new AppError(`You have reached the maximum of ${maxPerDay} bookings for this day`, 400);
    }
  }

  // ---- CONFLICT CHECK (atomic) ----
  // The critical rule: newStart < existingEnd && newEnd > existingStart
  const conflict = await Booking.findOne({
    court: court._id,
    status: { $nin: ['cancelled'] },
    $and: [
      { startTime: { $lt: end } },
      { endTime: { $gt: start } },
    ],
  });

  if (conflict) {
    throw new ConflictError('This court slot is already booked. Please choose another time.');
  }

  // Determine price
  let price: number;
  if (bookingType === 'member' || bookingType === 'social_play') {
    const member = await Member.findOne({ userId: memberCheckId }).populate('membershipPlan');
    if (!member) {
      price = court.walkInPrice;
    } else {
      const plan = await MembershipPlan.findById(member.membershipPlan);
      const discount = plan?.courtBookingDiscount ?? 0;
      price = court.memberPrice * (1 - discount / 100);
    }
  } else {
    price = court.walkInPrice;
  }

  const booking = await Booking.create({
    court: court._id,
    bookedBy: bookedByUserId,
    memberUserId: memberCheckId,
    startTime: start,
    endTime: end,
    durationMinutes: SLOT_DURATION_MINUTES,
    bookingType,
    status: 'confirmed',
    price: Math.round(price * 100) / 100,
    paymentStatus: 'paid',
    paymentMethod,
    participants,
    notes,
  });

  const populated = await booking.populate([
    { path: 'court', select: 'name type code' },
    { path: 'bookedBy', select: 'name email' },
    { path: 'memberUserId', select: 'name email' },
  ]);

  // Let the manager desk know a court has been booked.
  try {
    const who = (populated.memberUserId as any)?.name || (populated.bookedBy as any)?.name || 'A member';
    const courtName = (populated.court as any)?.name || court.name;
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(start);
    const timeStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
    await createNotification({
      audience: 'manager',
      kind: 'booking_created',
      title: 'New court booking',
      message: `${who} booked ${courtName} on ${dateStr} at ${timeStr}.`,
      relatedId: populated._id.toString(),
    });
  } catch (error) {
    console.error('Failed to raise booking notification:', error);
  }

  return populated;
};

export const getBookings = async (query: {
  courtId?: string;
  userId?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}) => {
  const { courtId, userId, status, date, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};

  if (courtId) filter.court = courtId;
  if (userId) filter.$or = [{ bookedBy: userId }, { memberUserId: userId }];
  if (status) filter.status = status;
  if (date) {
    const d = new Date(date);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: start, $lte: end };
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('court', 'name type code')
      .populate('bookedBy', 'name email')
      .populate('memberUserId', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getBookingById = async (id: string): Promise<BookingDocument> => {
  const booking = await Booking.findById(id)
    .populate('court', 'name type code memberPrice walkInPrice')
    .populate('bookedBy', 'name email phone')
    .populate('memberUserId', 'name email phone');
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};

export const cancelBooking = async (
  id: string,
  cancelledById: string,
  data: CancelBookingInput
): Promise<BookingDocument> => {
  const booking = await Booking.findById(id);
  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.status === 'cancelled') throw new AppError('Booking is already cancelled', 400);
  if (booking.status === 'completed') throw new AppError('Cannot cancel a completed booking', 400);

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelledBy = new mongoose.Types.ObjectId(cancelledById);
  booking.cancellationReason = data.reason;
  if (booking.paymentStatus === 'paid') booking.paymentStatus = 'refunded';

  await booking.save();
  return booking;
};

export const markBookingPaid = async (id: string, paymentMethod: string, paymentReference?: string): Promise<BookingDocument> => {
  const booking = await Booking.findByIdAndUpdate(
    id,
    { paymentStatus: 'paid', paymentMethod, paymentReference },
    { new: true }
  );
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<BookingDocument> => {
  const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!booking) throw new NotFoundError('Booking not found');
  return booking;
};
