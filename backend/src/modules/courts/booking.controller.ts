import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as bookingService from './booking.service';
import {
  createBookingSchema,
  cancelBookingSchema,
  availabilityQuerySchema,
  bookingQuerySchema,
} from './booking.validation';

// ---- Courts ----
export const createCourt = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const court = await bookingService.createCourt(req.body);
  sendCreated(res, { court }, 'Court created');
});

export const getCourts = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const courts = await bookingService.getCourts(req.query.type as string | undefined);
  sendSuccess(res, { courts }, 'Courts fetched');
});

export const getCourtById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const court = await bookingService.getCourtById(getParam(req));
  sendSuccess(res, { court }, 'Court fetched');
});

export const updateCourt = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const court = await bookingService.updateCourt(getParam(req), req.body);
  sendSuccess(res, { court }, 'Court updated');
});

export const deleteCourt = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  await bookingService.deleteCourt(getParam(req));
  sendSuccess(res, null, 'Court deactivated');
});

// ---- Availability ----
export const getAvailability = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = availabilityQuerySchema.parse({ query: req.query });
  const { courtId, date, type } = validated.query;
  const availability = await bookingService.getAvailability(courtId, date, type);
  sendSuccess(res, { availability }, 'Court availability fetched');
});

// ---- Bookings ----
export const createBooking = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = createBookingSchema.parse({ body: req.body });
  const booking = await bookingService.createBooking(validated.body, req.user!._id.toString());
  sendCreated(res, { booking }, 'Booking created successfully');
});

export const getBookings = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = bookingQuerySchema.parse({ query: req.query });
  const result = await bookingService.getBookings(validated.query);
  sendSuccess(res, result, 'Bookings fetched');
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await bookingService.getBookings({ userId: req.user!._id.toString() });
  sendSuccess(res, result, 'Your bookings fetched');
});

export const getBookingById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const booking = await bookingService.getBookingById(getParam(req));
  sendSuccess(res, { booking }, 'Booking fetched');
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = cancelBookingSchema.parse({ body: req.body });
  const booking = await bookingService.cancelBooking(getParam(req), req.user!._id.toString(), validated.body);
  sendSuccess(res, { booking }, 'Booking cancelled');
});

export const markBookingPaid = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { paymentMethod, paymentReference } = req.body as { paymentMethod: string; paymentReference?: string };
  const booking = await bookingService.markBookingPaid(getParam(req), paymentMethod, paymentReference);
  sendSuccess(res, { booking }, 'Booking marked as paid');
});
