import { z } from 'zod';

export const createMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    membershipPlanId: z.string().min(1, 'Membership plan ID is required'),
    startDate: z.string().datetime({ message: 'Invalid start date' }).optional(),
    amountPaid: z.number().min(0, 'Amount paid must be non-negative'),
    paymentMethod: z.enum(['cash', 'card', 'upi', 'online']),
    paymentReference: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const renewMembershipSchema = z.object({
  body: z.object({
    membershipPlanId: z.string().optional(),
    amountPaid: z.number().min(0),
    paymentMethod: z.enum(['cash', 'card', 'upi', 'online']),
    paymentReference: z.string().optional(),
  }),
});

export const updateMemberSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'expired', 'suspended', 'pending']).optional(),
    notes: z.string().optional(),
  }),
});

export const memberQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['active', 'expired', 'suspended', 'pending']).optional(),
    tier: z.enum(['gold', 'silver', 'junior']).optional(),
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
  }),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>['body'];
export type RenewMembershipInput = z.infer<typeof renewMembershipSchema>['body'];
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>['body'];
