import { addDays, toISODate } from '../utils/format';

/**
 * Demo personas. The app ships with three local accounts so a reviewer can
 * switch roles from the login screen without any backend.
 */
export const demoAccounts = [
  {
    id: 'U-1001',
    role: 'customer',
    name: 'Priya Nair',
    email: 'priya.nair@clubbloom.in',
    password: 'clubbloom',
    phone: '+91 98450 77219',
    city: 'Bengaluru',
    memberSince: toISODate(addDays(new Date(), -350)),
    avatarSeed: 'PN',
    title: 'Gold Member',
  },
  {
    id: 'U-2001',
    role: 'manager',
    name: 'Vikram Sethi',
    email: 'vikram.sethi@clubbloom.in',
    password: 'clubbloom',
    phone: '+91 98200 11001',
    city: 'Mumbai',
    memberSince: toISODate(addDays(new Date(), -900)),
    avatarSeed: 'VS',
    title: 'Club Manager',
  },
  {
    id: 'U-3001',
    role: 'admin',
    name: 'Anita Bhatt',
    email: 'anita.bhatt@clubbloom.in',
    password: 'clubbloom',
    phone: '+91 98200 11010',
    city: 'Mumbai',
    memberSince: toISODate(addDays(new Date(), -1200)),
    avatarSeed: 'AB',
    title: 'Platform Administrator',
  },
  {
    id: 'U-4001',
    role: 'staff',
    name: 'Simran Kaur',
    email: 'simran.kaur@clubbloom.in',
    password: 'clubbloom',
    phone: '+91 98200 11007',
    city: 'Mumbai',
    memberSince: toISODate(addDays(new Date(), -360)),
    avatarSeed: 'SK',
    title: 'Operations & Front Desk Staff',
    dept: 'Retail & Operations',
  },
];

/**
 * The customer membership record. Set `expiryOffsetDays` to a negative value to
 * demo the withered / sad panda states — everything else derives from it.
 */
export const customerMembership = {
  id: 'MS-7701',
  userId: 'U-1001',
  type: 'gold',
  startDate: toISODate(addDays(new Date(), -346)),
  expiryDate: toISODate(addDays(new Date(), 19)),
  pricePaid: 24999,
  paymentMethod: 'UPI',
  status: 'auto-renew off',
  familyMembers: 1,
};

export const customerProfile = {
  userId: 'U-1001',
  name: 'Priya Nair',
  email: 'priya.nair@clubbloom.in',
  phone: '+91 98450 77219',
  city: 'Bengaluru',
  dob: '1997-04-12',
  gender: 'Female',
  emergencyContact: 'Rajan Nair · +91 98450 77200',
  favouriteSports: ['Tennis', 'Padel', 'Badminton'],
  lockerNo: 'L-114',
  handoverLevel: 'Intermediate',
  preferredSlot: 'Evening (18:00 – 21:00)',
};

export const paymentHistory = [
  { id: 'PY-3001', date: toISODate(addDays(new Date(), -346)), description: 'Gold Membership — 1 Year', amount: 24999, method: 'UPI', status: 'paid', invoice: 'INV-2025-1187' },
  { id: 'PY-3002', date: toISODate(addDays(new Date(), -190)), description: 'Court Booking — Tennis Centre', amount: 1260, method: 'UPI', status: 'paid', invoice: 'INV-2025-2043' },
  { id: 'PY-3003', date: toISODate(addDays(new Date(), -120)), description: 'Shop Order — Bloom Pro Carbon Racket', amount: 8499, method: 'Card', status: 'paid', invoice: 'INV-2025-2911' },
  { id: 'PY-3004', date: toISODate(addDays(new Date(), -62)), description: 'Cafeteria — Post-match dinner', amount: 1240, method: 'UPI', status: 'paid', invoice: 'INV-2025-3402' },
  { id: 'PY-3005', date: toISODate(addDays(new Date(), -21)), description: 'Personal Coaching — 4 sessions', amount: 4800, method: 'Card', status: 'paid', invoice: 'INV-2025-3890' },
  { id: 'PY-3006', date: toISODate(addDays(new Date(), -2)), description: 'Cafeteria — Court View 3', amount: 894, method: 'UPI', status: 'pending', invoice: 'INV-2025-4127' },
];

export const customerStats = {
  totalSessions: 41,
  sessionsThisMonth: 9,
  hoursPlayed: 41,
  favouriteSport: 'Tennis',
  winRate: 62,
  streakWeeks: 7,
  guestPassesLeft: 2,
  loyaltyPoints: 4820,
};
