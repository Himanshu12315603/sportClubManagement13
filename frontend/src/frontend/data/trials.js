import { addDays, toISODate } from '../utils/format';

/** Visitor trial registrations + trial status metadata. */
export const trialStatuses = {
  requested: { label: 'Requested', tone: 'badge-info', desc: 'Your trial request has been received.' },
  scheduled: { label: 'Scheduled', tone: 'badge-warning', desc: 'Your slot is scheduled — see you at the club!' },
  completed: { label: 'Completed', tone: 'badge-active', desc: 'Trial completed. Time to pick a membership!' },
  declined: { label: 'Declined', tone: 'badge-danger', desc: 'This slot was unavailable. Please request another.' },
  expired: { label: 'Expired', tone: 'badge-danger', desc: 'This trial request expired.' },
};

export const trialRegistrations = [
  { id: 'TR-501', name: 'Sara Khan', email: 'sara.khan@example.com', phone: '+91 90000 11234', sport: 'padel', date: toISODate(addDays(new Date(), 2)), slot: '19:00', status: 'scheduled', source: 'Website', createdOffset: -3 },
  { id: 'TR-502', name: 'Devansh Joshi', email: 'devansh.joshi@example.com', phone: '+91 91520 33478', sport: 'badminton', date: toISODate(addDays(new Date(), 1)), slot: '08:00', status: 'requested', source: 'Website', createdOffset: -1 },
  { id: 'TR-503', name: 'Nisha Reddy', email: 'nisha.reddy@example.com', phone: '+91 99490 66201', sport: 'tennis', date: toISODate(addDays(new Date(), -6)), slot: '07:00', status: 'expired', source: 'Walk-in', createdOffset: -8 },
  { id: 'TR-504', name: 'Manav Shetty', email: 'manav.shetty@example.com', phone: '+91 97220 66109', sport: 'cricket', date: toISODate(addDays(new Date(), 4)), slot: '09:00', status: 'requested', source: 'Instagram', createdOffset: -4 },
  { id: 'TR-505', name: 'Ritika Sen', email: 'ritika.sen@example.com', phone: '+91 99030 55210', sport: 'badminton', date: toISODate(addDays(new Date(), -2)), slot: '18:30', status: 'completed', source: 'Referral', createdOffset: -5 },
  { id: 'TR-506', name: 'Owais Ahmed', email: 'owais.ahmed@example.com', phone: '+91 98490 33018', sport: 'padel', date: toISODate(addDays(new Date(), -1)), slot: '20:00', status: 'converted', source: 'Website', createdOffset: -7 },
  { id: 'TR-507', name: 'Lakshmi Prasad', email: 'lakshmi.p@example.com', phone: '+91 90080 44712', sport: 'tennis', date: toISODate(addDays(new Date(), 3)), slot: '17:00', status: 'scheduled', source: 'Walk-in', createdOffset: -2 },
  { id: 'TR-508', name: 'Harsh Vardhan', email: 'harsh.v@example.com', phone: '+91 99110 22876', sport: 'cricket', date: toISODate(addDays(new Date(), -9)), slot: '10:00', status: 'declined', source: 'Instagram', createdOffset: -11 },
];

export const trialConversion = {
  total: 148,
  scheduled: 96,
  completed: 71,
  converted: 34,
  conversionRate: 48,
  avgDaysToConvert: 6.4,
};

export const trialFunnel = [
  { stage: 'Requests', value: 148, color: '#00a3ff' },
  { stage: 'Scheduled', value: 96, color: '#2563eb' },
  { stage: 'Completed', value: 71, color: '#38bdf8' },
  { stage: 'Converted', value: 34, color: '#22c55e' },
];

export const trialSports = [
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'padel', label: 'Padel' },
  { id: 'fitness', label: 'Fitness Studio' },
];

export const trialTimeSlots = ['07:00', '08:00', '09:00', '17:00', '18:30', '19:00', '20:00'];
