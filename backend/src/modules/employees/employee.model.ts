import mongoose, { Document, Schema } from 'mongoose';

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

const employeeSchema = new Schema<EmployeeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    bankAccount: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.pre('validate', async function () {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
});

export const Employee = mongoose.model<EmployeeDocument>('Employee', employeeSchema);

// ---- Attendance ----
export interface IAttendance {
  employee: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes?: string;
  markedBy: mongoose.Types.ObjectId;
}
export interface AttendanceDocument extends IAttendance, Document {}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    checkIn: Date,
    checkOut: Date,
    status: { type: String, enum: ['present', 'absent', 'half_day', 'leave'], required: true },
    notes: String,
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);

// ---- Leave Request ----
export interface ILeaveRequest {
  employee: mongoose.Types.ObjectId;
  leaveType: 'casual' | 'sick' | 'annual' | 'unpaid';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalNotes?: string;
}
export interface LeaveRequestDocument extends ILeaveRequest, Document {}

const leaveRequestSchema = new Schema<LeaveRequestDocument>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['casual', 'sick', 'annual', 'unpaid'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: String,
  },
  { timestamps: true }
);

export const LeaveRequest = mongoose.model<LeaveRequestDocument>('LeaveRequest', leaveRequestSchema);
