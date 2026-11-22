import mongoose from 'mongoose';
import { Employee, Attendance, LeaveRequest, EmployeeDocument } from './employee.model';
import { User, UserRole } from '../auth/auth.model';
import { NotFoundError, AppError, ConflictError } from '../../utils/AppError';

export interface CreateStaffInput {
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: UserRole;
  department: string;
  designation: string;
  salary: number;
  joiningDate?: string;
  bankAccount?: { accountNumber: string; ifsc: string; bankName: string };
  emergencyContact?: { name: string; phone: string; relation: string };
}

export const createEmployee = async (data: CreateStaffInput): Promise<EmployeeDocument> => {
  let staffUserId = data.userId;

  // If no userId provided, create the User account directly so staff can immediately log in
  if (!staffUserId) {
    if (!data.email) throw new AppError('Email is required to create a staff account', 400);
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new ConflictError('A user with this email already exists');

    const defaultRole = data.role || 'receptionist';
    const rawPassword = data.password || 'Staff@12345';

    const newUser = await User.create({
      name: data.name || data.designation,
      email: data.email,
      password: rawPassword,
      phone: data.phone,
      role: defaultRole,
      isActive: true,
    });
    staffUserId = newUser._id.toString();
  } else {
    // If userId was provided, ensure user exists and update role if specified
    const existingUser = await User.findById(staffUserId);
    if (!existingUser) throw new NotFoundError('User not found');
    if (data.role && existingUser.role !== data.role) {
      existingUser.role = data.role;
      await existingUser.save();
    }
  }

  // Check if an Employee document already exists for this user
  const existingEmployee = await Employee.findOne({ userId: staffUserId });
  if (existingEmployee) throw new ConflictError('Employee profile already exists for this user');

  const employee = await Employee.create({
    userId: new mongoose.Types.ObjectId(staffUserId),
    department: data.department,
    designation: data.designation,
    salary: data.salary,
    joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
    bankAccount: data.bankAccount,
    emergencyContact: data.emergencyContact,
    isActive: true,
  });

  return employee.populate('userId', 'name email phone role isActive');
};

export const getEmployees = async (query: { department?: string; isActive?: boolean; page?: number; limit?: number }) => {
  const { department, isActive, page = 1, limit = 20 } = query;
  const filter: Record<string, unknown> = {};
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;
  const [employees, total] = await Promise.all([
    Employee.find(filter).populate('userId', 'name email phone role profileImage lastLogin').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);
  return { employees, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getEmployeeById = async (id: string) => {
  const emp = await Employee.findById(id).populate('userId', 'name email phone role profileImage lastLogin');
  if (!emp) throw new NotFoundError('Employee not found');
  return emp;
};

export const updateEmployee = async (id: string, data: Partial<CreateStaffInput>) => {
  const emp = await Employee.findById(id);
  if (!emp) throw new NotFoundError('Employee not found');

  if (data.department) emp.department = data.department;
  if (data.designation) emp.designation = data.designation;
  if (data.salary !== undefined) emp.salary = data.salary;
  if (data.bankAccount) emp.bankAccount = data.bankAccount;
  if (data.emergencyContact) emp.emergencyContact = data.emergencyContact;

  if (data.role && emp.userId) {
    await User.findByIdAndUpdate(emp.userId, { role: data.role });
  }

  await emp.save();
  return emp.populate('userId', 'name email phone role');
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
  return LeaveRequest.find(filter)
    .populate({ path: 'employee', populate: { path: 'userId', select: 'name email phone' } })
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 });
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
