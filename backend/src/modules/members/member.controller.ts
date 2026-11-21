import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as memberService from './member.service';
import {
  createMemberSchema,
  renewMembershipSchema,
  updateMemberSchema,
  memberQuerySchema,
} from './member.validation';

// ---- Membership Plans ----

export const createPlan = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const plan = await memberService.createPlan(req.body);
  sendCreated(res, { plan }, 'Membership plan created');
});

export const getPlans = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const activeOnly = req.query.all !== 'true';
  const plans = await memberService.getPlans(activeOnly);
  sendSuccess(res, { plans }, 'Membership plans fetched');
});

export const updatePlan = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const plan = await memberService.updatePlan(getParam(req), req.body);
  sendSuccess(res, { plan }, 'Membership plan updated');
});

export const deletePlan = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  await memberService.deletePlan(getParam(req));
  sendSuccess(res, null, 'Membership plan deactivated');
});

// ---- Members ----

export const createMember = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = createMemberSchema.parse({ body: req.body });
  const member = await memberService.createMember(validated.body);
  sendCreated(res, { member }, 'Member registered successfully');
});

export const getMembers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = memberQuerySchema.parse({ query: req.query });
  const result = await memberService.getMembers(validated.query);
  sendSuccess(res, result, 'Members fetched');
});

export const getMemberById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const member = await memberService.getMemberById(getParam(req));
  sendSuccess(res, { member }, 'Member fetched');
});

export const getMyMembership = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const member = await memberService.getMemberByUserId(req.user!._id.toString());
  sendSuccess(res, { member }, member ? 'Membership found' : 'No active membership');
});

export const subscribeMembership = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const member = await memberService.subscribeMembership(req.user!._id.toString(), req.body);
  sendCreated(res, { member }, 'Membership successfully activated!');
});

export const updateMember = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = updateMemberSchema.parse({ body: req.body });
  const member = await memberService.updateMember(getParam(req), validated.body);
  sendSuccess(res, { member }, 'Member updated');
});

export const renewMembership = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const validated = renewMembershipSchema.parse({ body: req.body });
  const member = await memberService.renewMembership(getParam(req), validated.body);
  sendSuccess(res, { member }, 'Membership renewed successfully');
});

export const expireMemberships = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const count = await memberService.checkAndExpireMemberships();
  sendSuccess(res, { expiredCount: count }, `${count} memberships marked as expired`);
});
