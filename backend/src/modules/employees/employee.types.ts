import mongoose, { Document } from 'mongoose';

export interface IEmployee {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: Date;
  salary: number;
  bankAccount?: { accountNumber: string; ifsc: string; bankName: string };
  emergencyContact?: { name: string; phone: string; relation: string };
  isActive: boolean;
}
export interface EmployeeDocument extends IEmployee, Document {}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

export interface IAttendance {
  employee: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  markedBy: mongoose.Types.ObjectId;
}
export interface AttendanceDocument extends IAttendance, Document {}

export type LeaveType = 'casual' | 'sick' | 'annual' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface ILeaveRequest {
  employee: mongoose.Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvalNotes?: string;
}
export interface LeaveRequestDocument extends ILeaveRequest, Document {}
