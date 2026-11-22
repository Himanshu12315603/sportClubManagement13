import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as paymentService from './payment.service';
import {
  cancelPaymentSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from './payment.validation';

export const createOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = createPaymentOrderSchema.parse({ body: req.body });
  const payment = await paymentService.createPaymentOrder(req.user!._id.toString(), validated.body);
  sendCreated(res, { payment }, 'Payment order initialized');
});

export const verify = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = verifyPaymentSchema.parse({ body: req.body });
  const result = await paymentService.verifyPayment(req.user!._id.toString(), validated.body);
  sendSuccess(res, result, 'Payment verified and captured');
});

export const cancel = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = cancelPaymentSchema.parse({ body: req.body });
  await paymentService.cancelPayment(req.user!._id.toString(), validated.body);
  sendSuccess(res, null, 'Unpaid purchase cancelled');
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payments = await paymentService.getMyPayments(req.user!._id.toString());
  sendSuccess(res, { payments }, 'User payments fetched');
});

export const getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payment = await paymentService.getPaymentById(
    getParam(req),
    req.user!._id.toString(),
    req.user!.role
  );
  sendSuccess(res, { payment }, 'Payment details fetched');
});
