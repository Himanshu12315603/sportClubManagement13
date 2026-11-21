import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as enquiryService from './enquiry.service';

export const submit = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const enquiry = await enquiryService.submitEnquiry(req.body);
  sendCreated(res, { enquiry }, 'Enquiry submitted. We will get back to you soon!');
});

export const getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await enquiryService.getEnquiries({
    status: req.query.status as string | undefined,
    assignedTo: req.query.assignedTo as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Enquiries fetched');
});

export const getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const enquiry = await enquiryService.getEnquiryById(getParam(req));
  sendSuccess(res, { enquiry }, 'Enquiry fetched');
});

export const update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const enquiry = await enquiryService.updateEnquiry(getParam(req), req.body);
  sendSuccess(res, { enquiry }, 'Enquiry updated');
});

export const addNote = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { note } = req.body as { note: string };
  const enquiry = await enquiryService.addFollowUpNote(getParam(req), note, req.user!._id.toString());
  sendSuccess(res, { enquiry }, 'Note added');
});
