import { toISODate, addDays } from '../utils/format';

/**
 * Analytics + finance data. Deterministic mock numbers used across the manager
 * and admin dashboards. No randomness — safe to compare across screens.
 */

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const revenueTrend = [
  { month: 'Dec', court: 412000, membership: 386000, shop: 148000, cafe: 129000, expenses: 402000 },
  { month: 'Jan', court: 448000, membership: 412000, shop: 162000, cafe: 141000, expenses: 418000 },
  { month: 'Feb', court: 462000, membership: 438000, shop: 171000, cafe: 148000, expenses: 424000 },
  { month: 'Mar', court: 495000, membership: 452000, shop: 186000, cafe: 159000, expenses: 441000 },
  { month: 'Apr', court: 521000, membership: 468000, shop: 194000, cafe: 168000, expenses: 452000 },
  { month: 'May', court: 538000, membership: 486000, shop: 188000, cafe: 172000, expenses: 461000 },
  { month: 'Jun', court: 556000, membership: 512000, shop: 205000, cafe: 181000, expenses: 478000 },
  { month: 'Jul', court: 604000, membership: 548000, shop: 219000, cafe: 196000, expenses: 502000 },
  { month: 'Aug', court: 628000, membership: 561000, shop: 231000, cafe: 203000, expenses: 519000 },
  { month: 'Sep', court: 611000, membership: 574000, shop: 226000, cafe: 198000, expenses: 526000 },
  { month: 'Oct', court: 664000, membership: 602000, shop: 244000, cafe: 214000, expenses: 548000 },
  { month: 'Nov', court: 692000, membership: 631000, shop: 258000, cafe: 227000, expenses: 562000 },
].map((m) => ({
  ...m,
  total: m.court + m.membership + m.shop + m.cafe,
  profit: m.court + m.membership + m.shop + m.cafe - m.expenses,
}));

export const monthlyNewMembers = months.map((month, i) => ({
  month,
  gold: [12, 14, 11, 17, 15, 13, 19, 22, 18, 24, 21, 26][i],
  silver: [18, 21, 19, 24, 22, 20, 26, 29, 25, 31, 28, 33][i],
  junior: [9, 11, 10, 13, 12, 14, 15, 18, 16, 19, 17, 21][i],
  churn: [6, 5, 7, 6, 8, 5, 6, 7, 9, 6, 5, 7][i],
}));

export const bookingsBySport = [
  { sport: 'Tennis', bookings: 482, revenue: 396000 },
  { sport: 'Badminton', bookings: 736, revenue: 312000 },
  { sport: 'Padel', bookings: 398, revenue: 328000 },
  { sport: 'Cricket', bookings: 214, revenue: 268000 },
  { sport: 'Fitness', bookings: 612, revenue: 122000 },
];

export const bookingsByHour = [
  { hour: '06:00', weekday: 22, weekend: 31 },
  { hour: '08:00', weekday: 34, weekend: 46 },
  { hour: '10:00', weekday: 18, weekend: 38 },
  { hour: '12:00', weekday: 14, weekend: 29 },
  { hour: '14:00', weekday: 16, weekend: 33 },
  { hour: '16:00', weekday: 28, weekend: 41 },
  { hour: '18:00', weekday: 47, weekend: 44 },
  { hour: '20:00', weekday: 41, weekend: 36 },
  { hour: '22:00', weekday: 19, weekend: 22 },
];

export const membershipDistribution = [
  { name: 'Gold', value: 486, color: '#fbbf24' },
  { name: 'Silver', value: 624, color: '#cbd5e1' },
  { name: 'Junior', value: 318, color: '#38bdf8' },
  { name: 'Trial', value: 142, color: '#00a3ff' },
];

export const channelSplit = [
  { name: 'Courts', value: 692000, color: '#00a3ff' },
  { name: 'Memberships', value: 631000, color: '#2563eb' },
  { name: 'Shop', value: 258000, color: '#38bdf8' },
  { name: 'Cafeteria', value: 227000, color: '#ff1744' },
];

export const paymentSplit = [
  { name: 'UPI', value: 58, color: '#22c55e' },
  { name: 'Card', value: 31, color: '#00a3ff' },
  { name: 'Cash', value: 11, color: '#f59e0b' },
];

export const courtUtilization = [
  { court: 'TN-1', sport: 'Tennis', utilization: 92, sessions: 214 },
  { court: 'TN-2', sport: 'Tennis', utilization: 78, sessions: 182 },
  { court: 'TN-3', sport: 'Tennis', utilization: 41, sessions: 96 },
  { court: 'BD-1', sport: 'Badminton', utilization: 88, sessions: 206 },
  { court: 'BD-2', sport: 'Badminton', utilization: 84, sessions: 196 },
  { court: 'BD-5', sport: 'Badminton', utilization: 37, sessions: 88 },
  { court: 'PD-1', sport: 'Padel', utilization: 95, sessions: 222 },
  { court: 'PD-2', sport: 'Padel', utilization: 91, sessions: 212 },
  { court: 'PD-3', sport: 'Padel', utilization: 72, sessions: 168 },
  { court: 'CK-1', sport: 'Cricket', utilization: 64, sessions: 150 },
  { court: 'CK-2', sport: 'Cricket', utilization: 58, sessions: 136 },
];

export const retentionCohorts = [
  { cohort: 'Jun', size: 96, m1: 92, m2: 87, m3: 81, m4: 76 },
  { cohort: 'Jul', size: 108, m1: 94, m2: 89, m3: 84, m4: 79 },
  { cohort: 'Aug', size: 102, m1: 91, m2: 86, m3: 80, m4: 74 },
  { cohort: 'Sep', size: 121, m1: 93, m2: 88, m3: 83, m4: 0 },
  { cohort: 'Oct', size: 129, m1: 95, m2: 90, m3: 0, m4: 0 },
  { cohort: 'Nov', size: 118, m1: 96, m2: 0, m3: 0, m4: 0 },
];

export const topMembers = [
  { name: 'Kabir Singh', plan: 'Gold', sessions: 52, spent: 128900 },
  { name: 'Arjun Verma', plan: 'Gold', sessions: 47, spent: 104300 },
  { name: 'Priya Nair', plan: 'Gold', sessions: 41, spent: 91200 },
  { name: 'Tara Menon', plan: 'Gold', sessions: 38, spent: 79800 },
  { name: 'Aditya Ghosh', plan: 'Silver', sessions: 30, spent: 52300 },
];

export const financeTransactions = [
  { id: 'TX-9001', date: toISODate(addDays(new Date(), 0)), party: 'Priya Nair', channel: 'Court Booking', method: 'UPI', amount: 1260, status: 'paid' },
  { id: 'TX-9002', date: toISODate(addDays(new Date(), 0)), party: 'Arjun Verma', channel: 'Cafeteria', method: 'Card', amount: 894, status: 'paid' },
  { id: 'TX-9003', date: toISODate(addDays(new Date(), 0)), party: 'Kabir Singh', channel: 'Shop Order', method: 'UPI', amount: 8499, status: 'paid' },
  { id: 'TX-9004', date: toISODate(addDays(new Date(), -1)), party: 'Meera Desai', channel: 'Membership Renewal', method: 'Card', amount: 7999, status: 'paid' },
  { id: 'TX-9005', date: toISODate(addDays(new Date(), -1)), party: 'Yash Patel', channel: 'Court Booking', method: 'Cash', amount: 1800, status: 'pending' },
  { id: 'TX-9006', date: toISODate(addDays(new Date(), -2)), party: 'Ishita Bansal', channel: 'Membership Renewal', method: 'UPI', amount: 14999, status: 'refunded' },
  { id: 'TX-9007', date: toISODate(addDays(new Date(), -2)), party: 'Nisha Reddy', channel: 'Cafeteria', method: 'UPI', amount: 640, status: 'paid' },
  { id: 'TX-9008', date: toISODate(addDays(new Date(), -3)), party: 'Rohan Kapoor', channel: 'Shop Order', method: 'Card', amount: 3899, status: 'pending' },
  { id: 'TX-9009', date: toISODate(addDays(new Date(), -3)), party: 'Tara Menon', channel: 'Court Booking', method: 'UPI', amount: 2400, status: 'paid' },
  { id: 'TX-9010', date: toISODate(addDays(new Date(), -4)), party: 'Vikram Sethi', channel: 'Payroll', method: 'Bank', amount: 92000, status: 'paid' },
  { id: 'TX-9011', date: toISODate(addDays(new Date(), -5)), party: 'Facility Services', channel: 'Expense', method: 'Bank', amount: 46000, status: 'paid' },
  { id: 'TX-9012', date: toISODate(addDays(new Date(), -6)), party: 'Ananya Iyer', channel: 'Membership Renewal', method: 'Card', amount: 14999, status: 'paid' },
];

export const expenseBreakdown = [
  { name: 'Salaries', value: 512000, color: '#2563eb' },
  { name: 'Utilities', value: 148000, color: '#00a3ff' },
  { name: 'Maintenance', value: 96000, color: '#38bdf8' },
  { name: 'Inventory', value: 184000, color: '#ff1744' },
  { name: 'Marketing', value: 72000, color: '#f59e0b' },
];

export const lowStockItems = [
  { id: 'P-3003', name: 'Leather Cricket Ball (Red)', stock: 3, threshold: 10, category: 'Balls' },
  { id: 'P-2003', name: 'Runway Trainer', stock: 4, threshold: 12, category: 'Shoes' },
  { id: 'P-5003', name: 'All-Weather Track Jacket', stock: 7, threshold: 15, category: 'Apparel' },
  { id: 'P-1003', name: 'Padel Control Racket', stock: 9, threshold: 12, category: 'Rackets' },
];

export const managerKpis = {
  totalMembers: 1570,
  activeMemberships: 1284,
  expiredMemberships: 144,
  trialUsers: 142,
  todayBookings: 68,
  courtOccupancy: 74,
  dailyRevenue: 486300,
  monthlyRevenue: 1557300,
  monthlyExpenses: 562000,
  pendingPayments: 128400,
  newEnquiries: 9,
  refunds: 24600,
  avgRating: 4.7,
};

export const retentionSummary = {
  renewalRate: 78,
  churnRate: 9,
  avgMembershipMonths: 14.6,
  nps: 62,
};

/** Manager AI insight cards (rule-based, clearly labelled as demo analytics). */
export const managerAiInsights = [
  {
    id: 'ai-rev',
    type: 'revenue',
    title: 'Revenue forecast',
    tone: 'info',
    headline: 'Next month projected at ₹16.2L',
    points: [
      'Court revenue is trending +4.2% month over month, driven by padel demand.',
      'Cafeteria attach-rate improved to 31% after the new healthy bowl menu.',
      'Shop revenue is capped by stock-outs on two high-rotation SKUs.',
    ],
  },
  {
    id: 'ai-renew',
    type: 'renewal',
    title: 'Renewal prediction',
    tone: 'warning',
    headline: '23 memberships expire within 21 days',
    points: [
      '14 of the 23 are high-engagement members — 82% likely to renew.',
      '5 members have not visited in 30+ days: send the win-back offer.',
      'Prioritise Kabir Singh, Priya Nair and Tara Menon for concierge renewal.',
    ],
  },
  {
    id: 'ai-retention',
    type: 'retention',
    title: 'Customer retention',
    tone: 'danger',
    headline: 'At-risk cohort: 37 members',
    points: [
      'Members who skip two consecutive weeks are 4.3x more likely to lapse.',
      'Junior members convert to Silver at 46% when they join a weekend league.',
      'Suggested action: open a free social-play seat to every inactive member.',
    ],
  },
  {
    id: 'ai-court',
    type: 'utilisation',
    title: 'Court utilisation',
    tone: 'info',
    headline: 'Off-peak utilisation is only 38%',
    points: [
      'TN-3 and BD-5 are the least booked courts — consider a coaching clinic there.',
      'Weekday 12:00–15:00 is the biggest revenue gap of the day.',
      'Padel is at 93% peak utilisation — a fifth court would pay back quickly.',
    ],
  },
  {
    id: 'ai-stock',
    type: 'stock',
    title: 'Inventory alerts',
    tone: 'warning',
    headline: '4 SKUs below reorder threshold',
    points: [
      'Cricket ball stock is at 3 units against a weekly demand of 14.',
      'Track jacket will stock out before the winter league starts.',
      'Recommended reorder value: ₹86,400 across four SKUs.',
    ],
  },
  {
    id: 'ai-growth',
    type: 'growth',
    title: 'Growth suggestions',
    tone: 'success',
    headline: 'Three actions worth ₹2.4L/month',
    points: [
      'Launch a 6-week beginner padel course at ₹3,500 per head.',
      'Bundle a junior membership with a gear voucher to lift shop attach rate.',
      'Move cafeteria ordering to in-app only during peak hours to cut queue time.',
    ],
  },
];

export const revenueForecast = months.slice(6).map((month, i) => ({
  month,
  actual: revenueTrend[i + 6].total,
  forecast: Math.round(revenueTrend[i + 6].total * (1 + 0.035 * (i + 1))),
}));
