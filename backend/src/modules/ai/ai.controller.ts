import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as aiService from './ai.service';

export const getInsights = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  let insights = await aiService.getInsights(req.query.type as string | undefined);
  if (insights.length === 0) {
    insights = await aiService.generateFreshInsights();
  }
  sendSuccess(res, { insights }, 'AI insights fetched');
});

export const refreshInsights = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const insights = await aiService.generateFreshInsights();
  sendSuccess(res, { insights }, 'AI insights refreshed');
});
