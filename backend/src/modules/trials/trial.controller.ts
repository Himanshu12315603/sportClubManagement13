import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as trialService from './trial.service';
import { TrialStatus } from './trial.types';

export const register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const trial = await trialService.registerTrial(req.body);
  sendCreated(res, { trial }, 'Trial registration successful. Our team will contact you!');
});

export const getTrials = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await trialService.getTrials({
    sport: req.query.sport as string | undefined,
    status: req.query.status as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Trial registrations fetched');
});

export const getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const trial = await trialService.getTrialById(getParam(req));
  sendSuccess(res, { trial }, 'Trial fetched');
});

export const updateStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { status, assignedCoachId, feedbackNotes } = req.body as {
    status: TrialStatus;
    assignedCoachId?: string;
    feedbackNotes?: string;
  };
  const trial = await trialService.updateTrialStatus(getParam(req), status, assignedCoachId, feedbackNotes);
  sendSuccess(res, { trial }, 'Trial status updated');
});
