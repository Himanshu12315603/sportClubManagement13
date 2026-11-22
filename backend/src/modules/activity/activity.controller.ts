import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/apiResponse';
import * as activityService from './activity.service';
import { ActivityType } from './activity.model';

export const getMyActivities = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const activities = await activityService.getUserActivities(req.user!._id.toString(), limit);
  sendSuccess(res, { activities }, 'Activities fetched');
});

export const getAllActivities = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const filters = {
    userId: req.query.userId as string | undefined,
    type: req.query.type as ActivityType | undefined,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
  };
  const result = await activityService.getAllActivities(filters);
  sendSuccess(res, result, 'Activities fetched');
});

export const getActivityStats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.query.userId as string | undefined;
  const stats = await activityService.getActivityStats(userId);
  sendSuccess(res, stats, 'Activity stats fetched');
});
