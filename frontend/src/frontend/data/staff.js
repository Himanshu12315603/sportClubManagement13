import { addDays, toISODate } from '../utils/format';

/** Staff directory, shifts, attendance and leave requests. */
export const staffRoles = ['Head Coach', 'Coach', 'Front Desk', 'Cafeteria', 'Shop Manager', 'Housekeeping', 'Maintenance', 'Finance'];

export const staff = [
  { id: 'ST-01', name: 'Vikram Sethi', role: 'Head Coach', dept: 'Coaching', shift: 'Morning', salary: 92000, attendance: 97, rating: 4.8, phone: '+91 98200 11001', joined: toISODate(addDays(new Date(), -900)) },
  { id: 'ST-02', name: 'Neha Grover', role: 'Coach', dept: 'Coaching', shift: 'Evening', salary: 58000, attendance: 94, rating: 4.7, phone: '+91 98200 11002', joined: toISODate(addDays(new Date(), -640)) },
  { id: 'ST-03', name: 'Rakesh Yadav', role: 'Coach', dept: 'Coaching', shift: 'Morning', salary: 54000, attendance: 91, rating: 4.5, phone: '+91 98200 11003', joined: toISODate(addDays(new Date(), -520)) },
  { id: 'ST-04', name: 'Farhan Ali', role: 'Front Desk', dept: 'Operations', shift: 'Morning', salary: 32000, attendance: 96, rating: 4.6, phone: '+91 98200 11004', joined: toISODate(addDays(new Date(), -310)) },
  { id: 'ST-05', name: 'Pooja Rane', role: 'Front Desk', dept: 'Operations', shift: 'Evening', salary: 31000, attendance: 89, rating: 4.3, phone: '+91 98200 11005', joined: toISODate(addDays(new Date(), -280)) },
  { id: 'ST-06', name: 'Chef Anton Dsouza', role: 'Cafeteria', dept: 'Cafeteria', shift: 'Split', salary: 62000, attendance: 93, rating: 4.7, phone: '+91 98200 11006', joined: toISODate(addDays(new Date(), -410)) },
  { id: 'ST-07', name: 'Simran Kaur', role: 'Shop Manager', dept: 'Retail', shift: 'Morning', salary: 45000, attendance: 95, rating: 4.6, phone: '+91 98200 11007', joined: toISODate(addDays(new Date(), -360)) },
  { id: 'ST-08', name: 'Ganesh Pawar', role: 'Housekeeping', dept: 'Facilities', shift: 'Morning', salary: 24000, attendance: 88, rating: 4.2, phone: '+91 98200 11008', joined: toISODate(addDays(new Date(), -700)) },
  { id: 'ST-09', name: 'Salim Ansari', role: 'Maintenance', dept: 'Facilities', shift: 'Evening', salary: 28000, attendance: 90, rating: 4.4, phone: '+91 98200 11009', joined: toISODate(addDays(new Date(), -560)) },
  { id: 'ST-10', name: 'Anita Bhatt', role: 'Finance', dept: 'Accounts', shift: 'Morning', salary: 66000, attendance: 98, rating: 4.9, phone: '+91 98200 11010', joined: toISODate(addDays(new Date(), -1200)) },
];

export const shiftPlan = [
  { id: 'SH-1', day: 'Monday', morning: ['Vikram Sethi', 'Farhan Ali', 'Ganesh Pawar'], evening: ['Neha Grover', 'Pooja Rane', 'Salim Ansari'] },
  { id: 'SH-2', day: 'Tuesday', morning: ['Vikram Sethi', 'Simran Kaur', 'Ganesh Pawar'], evening: ['Neha Grover', 'Pooja Rane', 'Salim Ansari'] },
  { id: 'SH-3', day: 'Wednesday', morning: ['Rakesh Yadav', 'Farhan Ali', 'Ganesh Pawar'], evening: ['Neha Grover', 'Pooja Rane', 'Salim Ansari'] },
  { id: 'SH-4', day: 'Thursday', morning: ['Vikram Sethi', 'Simran Kaur', 'Ganesh Pawar'], evening: ['Rakesh Yadav', 'Pooja Rane', 'Salim Ansari'] },
  { id: 'SH-5', day: 'Friday', morning: ['Rakesh Yadav', 'Farhan Ali', 'Ganesh Pawar'], evening: ['Neha Grover', 'Simran Kaur', 'Salim Ansari'] },
  { id: 'SH-6', day: 'Saturday', morning: ['Vikram Sethi', 'Farhan Ali', 'Rakesh Yadav'], evening: ['Neha Grover', 'Pooja Rane', 'Simran Kaur'] },
  { id: 'SH-7', day: 'Sunday', morning: ['Vikram Sethi', 'Farhan Ali'], evening: ['Neha Grover', 'Simran Kaur'] },
];

export const leaveRequests = [
  { id: 'LV-201', staffId: 'ST-03', name: 'Rakesh Yadav', type: 'Casual Leave', from: toISODate(addDays(new Date(), 3)), to: toISODate(addDays(new Date(), 5)), days: 3, status: 'pending', reason: 'Family function out of town.' },
  { id: 'LV-202', staffId: 'ST-05', name: 'Pooja Rane', type: 'Sick Leave', from: toISODate(addDays(new Date(), -1)), to: toISODate(new Date()), days: 2, status: 'approved', reason: 'Viral fever, doctor advised rest.' },
  { id: 'LV-203', staffId: 'ST-08', name: 'Ganesh Pawar', type: 'Earned Leave', from: toISODate(addDays(new Date(), 10)), to: toISODate(addDays(new Date(), 17)), days: 8, status: 'pending', reason: 'Annual leave — village visit.' },
  { id: 'LV-204', staffId: 'ST-09', name: 'Salim Ansari', type: 'Casual Leave', from: toISODate(addDays(new Date(), -8)), to: toISODate(addDays(new Date(), -8)), days: 1, status: 'rejected', reason: 'Requested during tournament weekend.' },
];

export const attendanceTrend = [
  { day: 'Mon', present: 9, absent: 1 },
  { day: 'Tue', present: 10, absent: 0 },
  { day: 'Wed', present: 8, absent: 2 },
  { day: 'Thu', present: 9, absent: 1 },
  { day: 'Fri', present: 10, absent: 0 },
  { day: 'Sat', present: 9, absent: 1 },
  { day: 'Sun', present: 7, absent: 3 },
];
