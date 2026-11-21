import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    courtId: z.string().min(1, 'Court ID is required'),
    memberUserId: z.string().optional(),   // For staff-assisted bookings
    startTime: z.string().datetime({ message: 'Invalid start time' }),
    bookingType: z.enum(['member', 'walk_in', 'social_play']),
    paymentMethod: z.enum(['cash', 'card', 'upi', 'online']).optional(),
    participants: z
      .array(
        z.object({
          name: z.string(),
          memberId: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .optional(),
    notes: z.string().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const availabilityQuerySchema = z.object({
  query: z.object({
    courtId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    type: z.enum(['tennis', 'cricket']).optional(),
  }),
});

export const bookingQuerySchema = z.object({
  query: z.object({
    courtId: z.string().optional(),
    userId: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
    date: z.string().optional(),
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>['body'];
