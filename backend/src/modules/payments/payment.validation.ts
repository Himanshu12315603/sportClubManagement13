import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  body: z.object({
    purpose: z.enum(['membership', 'shop_order', 'cafeteria']),
    relatedId: z.string().min(1),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1),
    gatewayOrderId: z.string().min(1),
    gatewayPaymentId: z.string().min(1),
    gatewaySignature: z.string().min(1),
  }),
});

export const cancelPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().optional(),
    purpose: z.enum(['shop_order', 'cafeteria']).optional(),
    relatedId: z.string().optional(),
  }).refine(
    (data) => Boolean(data.paymentId || (data.purpose && data.relatedId)),
    'Payment ID or purchase purpose and ID are required'
  ),
});
