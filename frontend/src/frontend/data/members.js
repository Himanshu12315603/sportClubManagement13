import { addDays, toISODate } from '../utils/format';

/**
 * Club member directory (mock). `expiryOffsetDays` keeps the demo realistic:
 * positive = still valid, negative = already expired.
 */
const raw = [
  { id: 'MB-1001', name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '+91 98200 41102', plan: 'gold', age: 31, city: 'Mumbai', joinedOffset: -420, expiryOffset: 268, sessions: 34, spent: 68400, lastVisitOffset: -1 },
  { id: 'MB-1002', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98450 77219', plan: 'gold', age: 28, city: 'Bengaluru', joinedOffset: -350, expiryOffset: 15, sessions: 41, spent: 91200, lastVisitOffset: 0 },
  { id: 'MB-1003', name: 'Rohan Kapoor', email: 'rohan.kapoor@example.com', phone: '+91 99100 33218', plan: 'silver', age: 35, city: 'Delhi', joinedOffset: -300, expiryOffset: -12, sessions: 12, spent: 24850, lastVisitOffset: -46 },
  { id: 'MB-1004', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91 90040 88190', plan: 'silver', age: 24, city: 'Chennai', joinedOffset: -190, expiryOffset: 122, sessions: 27, spent: 39600, lastVisitOffset: -3 },
  { id: 'MB-1005', name: 'Kabir Singh', email: 'kabir.singh@example.com', phone: '+91 98111 65540', plan: 'gold', age: 39, city: 'Gurugram', joinedOffset: -510, expiryOffset: 9, sessions: 52, spent: 128900, lastVisitOffset: -1 },
  { id: 'MB-1006', name: 'Meera Desai', email: 'meera.desai@example.com', phone: '+91 99870 22134', plan: 'junior', age: 13, city: 'Ahmedabad', joinedOffset: -140, expiryOffset: 40, sessions: 22, spent: 14200, lastVisitOffset: -2 },
  { id: 'MB-1007', name: 'Vihaan Rao', email: 'vihaan.rao@example.com', phone: '+91 97310 55621', plan: 'junior', age: 11, city: 'Hyderabad', joinedOffset: -95, expiryOffset: 85, sessions: 18, spent: 11950, lastVisitOffset: -4 },
  { id: 'MB-1008', name: 'Ishita Bansal', email: 'ishita.bansal@example.com', phone: '+91 98990 40087', plan: 'silver', age: 30, city: 'Pune', joinedOffset: -260, expiryOffset: -3, sessions: 9, spent: 18700, lastVisitOffset: -31 },
  { id: 'MB-1009', name: 'Arjun Verma', email: 'arjun.verma@example.com', phone: '+91 98330 77190', plan: 'gold', age: 33, city: 'Mumbai', joinedOffset: -600, expiryOffset: 200, sessions: 47, spent: 104300, lastVisitOffset: 0 },
  { id: 'MB-1010', name: 'Sara Khan', email: 'sara.khan@example.com', phone: '+91 90000 11234', plan: 'trial', age: 26, city: 'Lucknow', joinedOffset: -6, expiryOffset: 8, sessions: 3, spent: 0, lastVisitOffset: -1 },
  { id: 'MB-1011', name: 'Devansh Joshi', email: 'devansh.joshi@example.com', phone: '+91 91520 33478', plan: 'trial', age: 22, city: 'Indore', joinedOffset: -2, expiryOffset: 12, sessions: 1, spent: 0, lastVisitOffset: -2 },
  { id: 'MB-1012', name: 'Nisha Reddy', email: 'nisha.reddy@example.com', phone: '+91 99490 66201', plan: 'trial', age: 29, city: 'Vizag', joinedOffset: -20, expiryOffset: -6, sessions: 4, spent: 900, lastVisitOffset: -8 },
  { id: 'MB-1013', name: 'Aditya Ghosh', email: 'aditya.ghosh@example.com', phone: '+91 98304 22890', plan: 'silver', age: 41, city: 'Kolkata', joinedOffset: -430, expiryOffset: 61, sessions: 30, spent: 52300, lastVisitOffset: -2 },
  { id: 'MB-1014', name: 'Tara Menon', email: 'tara.menon@example.com', phone: '+91 98860 90112', plan: 'gold', age: 27, city: 'Kochi', joinedOffset: -210, expiryOffset: 19, sessions: 38, spent: 79800, lastVisitOffset: 0 },
  { id: 'MB-1015', name: 'Yash Patel', email: 'yash.patel@example.com', phone: '+91 97270 45612', plan: 'silver', age: 36, city: 'Surat', joinedOffset: -150, expiryOffset: 210, sessions: 21, spent: 31200, lastVisitOffset: -5 },
  { id: 'MB-1016', name: 'Kritika Sharma', email: 'kritika.sharma@example.com', phone: '+91 90400 78834', plan: 'junior', age: 15, city: 'Jaipur', joinedOffset: -75, expiryOffset: 110, sessions: 25, spent: 16400, lastVisitOffset: -1 },
  { id: 'MB-1017', name: 'Nikhil Bhat', email: 'nikhil.bhat@example.com', phone: '+91 99000 23110', plan: 'gold', age: 45, city: 'Bengaluru', joinedOffset: -720, expiryOffset: -22, sessions: 6, spent: 41200, lastVisitOffset: -58 },
  { id: 'MB-1018', name: 'Zara Sheikh', email: 'zara.sheikh@example.com', phone: '+91 98200 77451', plan: 'silver', age: 23, city: 'Mumbai', joinedOffset: -110, expiryOffset: 4, sessions: 19, spent: 27400, lastVisitOffset: 0 },
];

export const members = raw.map((m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  plan: m.plan,
  age: m.age,
  city: m.city,
  joined: toISODate(addDays(new Date(), m.joinedOffset)),
  expiryDate: toISODate(addDays(new Date(), m.expiryOffset)),
  sessionsThisMonth: m.sessions,
  totalSpent: m.spent,
  lastVisit: toISODate(addDays(new Date(), m.lastVisitOffset)),
  suspended: false,
}));

export const membershipTypeFilters = [
  { id: 'all', label: 'All Members' },
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
  { id: 'junior', label: 'Junior' },
  { id: 'trial', label: 'Trial' },
];

/** Member enquiries captured from the public website. */
export const enquiries = [
  { id: 'EN-401', name: 'Rahul Bose', email: 'rahul.bose@example.com', phone: '+91 98300 11290', interest: 'Gold', source: 'Website', createdOffset: 0, status: 'new', note: 'Asked about corporate team membership for 12 employees.' },
  { id: 'EN-402', name: 'Sneha Pillai', email: 'sneha.pillai@example.com', phone: '+91 90120 44321', interest: 'Junior', source: 'Walk-in', createdOffset: -1, status: 'contacted', note: 'Wants weekend badminton coaching for her 9-year-old.' },
  { id: 'EN-403', name: 'Imran Qureshi', email: 'imran.q@example.com', phone: '+91 99451 77621', interest: 'Silver', source: 'Instagram', createdOffset: -2, status: 'new', note: 'Interested in padel social mixers.' },
  { id: 'EN-404', name: 'Divya Krishnan', email: 'divya.k@example.com', phone: '+91 98840 33912', interest: 'Gold', source: 'Referral', createdOffset: -3, status: 'converted', note: 'Referred by Aarav Mehta. Converted to Gold.' },
  { id: 'EN-405', name: 'Manav Shetty', email: 'manav.shetty@example.com', phone: '+91 97220 66109', interest: 'Trial', source: 'Website', createdOffset: -4, status: 'contacted', note: 'Requested a cricket trial on Saturday morning.' },
];

export const memberSummary = (member) => ({
  ...member,
  daysToExpiry: Math.ceil((new Date(member.expiryDate) - new Date()) / 86400000),
});
