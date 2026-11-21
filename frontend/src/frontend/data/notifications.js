import { addDays, toISODate } from '../utils/format';

/**
 * Notification catalogue + seed inbox for the demo user.
 * `kind` maps to the category, `tone` drives the icon colour.
 */
export const notificationKinds = {
  membership_expiring: { tone: 'warning', icon: 'CalendarClock', title: 'Membership expiring soon' },
  membership_expired: { tone: 'danger', icon: 'CalendarX', title: 'Membership expired' },
  booking_confirmed: { tone: 'success', icon: 'CalendarCheck', title: 'Booking confirmed' },
  booking_cancelled: { tone: 'danger', icon: 'CalendarX', title: 'Booking cancelled' },
  trial_approved: { tone: 'success', icon: 'BadgeCheck', title: 'Trial approved' },
  payment_success: { tone: 'success', icon: 'CreditCard', title: 'Payment successful' },
  payment_pending: { tone: 'warning', icon: 'Clock', title: 'Payment pending' },
  order_received: { tone: 'info', icon: 'Package', title: 'Order received' },
  low_stock: { tone: 'warning', icon: 'AlertTriangle', title: 'Low stock alert' },
  leave_request: { tone: 'info', icon: 'UserClock', title: 'Staff leave request' },
  garden_milestone: { tone: 'success', icon: 'Sprout', title: 'Garden milestone' },
};

const t = (offsetDays, hoursAgo) => {
  const d = addDays(new Date(), offsetDays);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

export const seedNotifications = [
  { id: 'N-1', kind: 'membership_expiring', audience: 'customer', message: 'Your Gold membership expires in 19 days. Renew now to keep priority bookings.', at: t(0, 2), read: false },
  { id: 'N-2', kind: 'booking_confirmed', audience: 'customer', message: 'Tennis · Centre Court on Saturday 18:00 is confirmed.', at: t(0, 5), read: false },
  { id: 'N-3', kind: 'garden_milestone', audience: 'customer', message: 'Your garden reached the Flowering Plant stage. Keep playing to bloom fully!', at: t(-1, 3), read: false },
  { id: 'N-4', kind: 'payment_pending', audience: 'customer', message: 'Cafeteria order #CF-2204 of ₹894 is awaiting payment.', at: t(-1, 7), read: true },
  { id: 'N-5', kind: 'order_received', audience: 'customer', message: 'Shop order #SH-1140 (Bloom Pro Carbon Racket) is being packed for club pickup.', at: t(-2, 4), read: true },
  { id: 'N-6', kind: 'trial_approved', audience: 'customer', message: 'Your padel trial on Friday 19:00 has been approved.', at: t(-3, 2), read: true },
  { id: 'N-7', kind: 'low_stock', audience: 'manager', message: 'Leather Cricket Ball (Red) is down to 3 units — reorder recommended.', at: t(0, 1), read: false },
  { id: 'N-8', kind: 'leave_request', audience: 'manager', message: 'Rakesh Yadav requested casual leave for 3 days.', at: t(0, 4), read: false },
  { id: 'N-9', kind: 'payment_pending', audience: 'manager', message: 'Yash Patel has a pending court payment of ₹1,800.', at: t(-1, 6), read: false },
  { id: 'N-10', kind: 'membership_expired', audience: 'manager', message: '3 memberships expired this week and are not yet renewed.', at: t(-2, 8), read: true },
];

export const notificationFilterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'customer', label: 'Customer' },
  { id: 'manager', label: 'Club' },
];
