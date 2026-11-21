import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { getParam } from '../../utils/params';
import * as employeeService from './employee.service';

export const createEmployee = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const emp = await employeeService.createEmployee(req.body);
  sendCreated(res, { employee: emp }, 'Employee created');
});

export const getEmployees = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const result = await employeeService.getEmployees({
    department: req.query.department as string | undefined,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });
  sendSuccess(res, result, 'Employees fetched');
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const emp = await employeeService.getEmployeeById(getParam(req));
  sendSuccess(res, { employee: emp }, 'Employee fetched');
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const emp = await employeeService.updateEmployee(getParam(req), req.body);
  sendSuccess(res, { employee: emp }, 'Employee updated');
});

export const markAttendance = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const attendance = await employeeService.markAttendance({ ...req.body, markedById: req.user!._id.toString() });
  sendSuccess(res, { attendance }, 'Attendance marked');
});

export const getAttendance = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const id = getParam(req);
  const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
  const attendance = await employeeService.getAttendance(id, month, year);
  sendSuccess(res, { attendance }, 'Attendance fetched');
});

export const submitLeave = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const leave = await employeeService.submitLeave(req.body);
  sendCreated(res, { leave }, 'Leave request submitted');
});

export const getLeaveRequests = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const leaves = await employeeService.getLeaveRequests(
    req.query.employee as string | undefined,
    req.query.status as string | undefined
  );
  sendSuccess(res, { leaves }, 'Leave requests fetched');
});

export const processLeave = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { status, notes } = req.body as { status: 'approved' | 'rejected'; notes?: string };
  const leave = await employeeService.processLeave(getParam(req), status, req.user!._id.toString(), notes);
  sendSuccess(res, { leave }, `Leave request ${status}`);
});
