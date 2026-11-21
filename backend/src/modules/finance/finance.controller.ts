import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import * as financeService from './finance.service';

export const getSummary = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const period = (req.query.period as 'today' | 'week' | 'month' | 'year') || 'month';
  const summary = await financeService.getFinanceSummary(period);
  sendSuccess(res, { summary }, 'Financial summary fetched');
});

export const getTransactions = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await financeService.getTransactions({
    type: req.query.type as string | undefined,
    source: req.query.source as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Transactions fetched');
});

export const recordTransaction = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const tx = await financeService.recordTransaction({ ...req.body, performedBy: req.user!._id });
  sendCreated(res, { transaction: tx }, 'Transaction recorded');
});

export const addExpense = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const expense = await financeService.addExpense({ ...req.body, submittedBy: req.user!._id });
  sendCreated(res, { expense }, 'Expense recorded');
});

export const getExpenses = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await financeService.getExpenses({
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    category: req.query.category as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Expenses fetched');
});
