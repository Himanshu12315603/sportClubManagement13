import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as paymentService from './payment.service';

export const createOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payment = await paymentService.createPaymentOrder(req.user!._id.toString(), req.body);
  sendCreated(res, { payment }, 'Payment order initialized');
});

export const verify = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payment = await paymentService.verifyPayment(req.user!._id.toString(), req.body);
  sendSuccess(res, { payment }, 'Payment verified and captured');
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payments = await paymentService.getMyPayments(req.user!._id.toString());
  sendSuccess(res, { payments }, 'User payments fetched');
});

export const getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const payment = await paymentService.getPaymentById(getParam(req));
  sendSuccess(res, { payment }, 'Payment details fetched');
});
