import { Employee, Attendance, LeaveRequest } from './employee.model';
import { NotFoundError, AppError } from '../../utils/AppError';

export const createEmployee = async (data: object) => Employee.create(data);

export const getEmployees = async (query: { department?: string; isActive?: boolean; page?: number; limit?: number }) => {
  const { department, isActive, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;
  const [employees, total] = await Promise.all([
    Employee.find(filter).populate('userId', 'name email phone profileImage').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);
  return { employees, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getEmployeeById = async (id: string) => {
  const emp = await Employee.findById(id).populate('userId', 'name email phone profileImage');
  if (!emp) throw new NotFoundError('Employee not found');
  return emp;
};

export const updateEmployee = async (id: string, data: object) => {
  const emp = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('userId', 'name email');
  if (!emp) throw new NotFoundError('Employee not found');
  return emp;
};

export const markAttendance = async (data: { employeeId: string; date: string; status: string; checkIn?: string; checkOut?: string; notes?: string; markedById: string }) => {
  const { employeeId, date, status, checkIn, checkOut, notes, markedById } = data;
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: dateObj },
    {
      employee: employeeId,
      date: dateObj,
      status,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      notes,
      markedBy: markedById,
    },
    { upsert: true, new: true, runValidators: true }
  );
  return attendance;
};

export const getAttendance = async (employeeId: string, month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return Attendance.find({ employee: employeeId, date: { $gte: start, $lte: end } }).sort({ date: 1 });
};

export const submitLeave = async (data: object) => LeaveRequest.create(data);

export const getLeaveRequests = async (employeeId?: string, status?: string) => {
  const filter: Record<string, unknown> = {};
  if (employeeId) filter.employee = employeeId;
  if (status) filter.status = status;
  return LeaveRequest.find(filter).populate('employee').populate('approvedBy', 'name').sort({ createdAt: -1 });
};

export const processLeave = async (id: string, status: 'approved' | 'rejected', approvedById: string, notes?: string) => {
  const leave = await LeaveRequest.findByIdAndUpdate(
    id,
    { status, approvedBy: approvedById, approvalNotes: notes },
    { new: true }
  );
  if (!leave) throw new NotFoundError('Leave request not found');
  return leave;
};
