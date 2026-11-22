import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import {
  demoAccounts,
  customerMembership,
  customerProfile,
  paymentHistory as seedPayments,
} from '../data/currentUser';
import { membershipPlans, planById } from '../data/membershipPlans';
import { products as seedProducts } from '../data/products';
import { members as seedMembers, enquiries as seedEnquiries } from '../data/members';
import { trialRegistrations as seedTrials } from '../data/trials';
import { seedNotifications, notificationKinds } from '../data/notifications';
import { seedBookings, seedShopOrders, seedCafeOrders, kitchenQueue as seedKitchen, shopOrderQueue as seedShopQueue } from '../data/seed';
import { staff as seedStaff, leaveRequests as seedLeave } from '../data/staff';
import { BOOKING_RULES, blockedSlots, sportById, bookableSports } from '../data/courts';
import { getMembershipStatus, planDurationDays, getGardenState } from '../utils/membership';
import { addDays, toISODate, titleCase } from '../utils/format';
import { readStore, writeStore, clearStore } from '../utils/storage';

const AppContext = createContext(null);

const AUTH_KEY = 'clubbloom.auth';

/** Maintenance blocks are generated deterministically for the coming week. */
function buildMaintenance() {
  const out = [];
  blockedSlots.forEach((slot, i) => {
    for (let d = 0; d <= 7; d += 1) {
      if ((d + i) % 3 === 0) {
        out.push({ ...slot, date: toISODate(addDays(new Date(), d)) });
      }
    }
  });
  return out;
}

let toastId = 0;

/** Map a backend product document to the frontend shop product shape. */
function mapApiProduct(p) {
  const categoryName = (p.category && p.category.name) || '';
  const n = categoryName.toLowerCase();
  let category = 'accessories';
  if (n.includes('racket')) category = 'rackets';
  else if (n.includes('ball') || n.includes('equipment')) category = 'balls';
  else if (n.includes('shoe')) category = 'shoes';
  else if (n.includes('apparel')) category = 'apparel';
  return {
    id: p._id,
    name: p.name,
    brand: p.brand || 'ClubBloom',
    category,
    price: p.price,
    mrp: p.mrp && p.mrp > p.price ? p.mrp : p.price,
    stock: typeof p.stock === 'number' ? p.stock : 0,
    rating: p.rating || 4.5,
    sport: p.sport || 'Multi',
    image: (Array.isArray(p.images) && p.images[0]) || '',
    description: p.description || '',
    sku: p.sku,
  };
}

/** Collapse a backend order status into the frontend shop status vocabulary. */
function mapOrderStatus(status) {
  if (status === 'ready') return 'ready';
  if (status === 'dispatched') return 'dispatched';
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled' || status === 'returned') return 'cancelled';
  return 'packing';
}

/** Backend order -> customer "my orders" row. */
function mapApiOrderToCustomerOrder(o) {
  return {
    id: o.orderNumber || o._id,
    orderId: o._id,
    rawStatus: o.status,
    channel: 'shop',
    date: o.createdAt,
    items: (o.items || []).map((i) => ({
      id: (i.product && (i.product._id || i.product)) || i.productName,
      name: i.productName,
      qty: i.quantity,
      price: i.unitPrice,
    })),
    subtotal: o.subtotal,
    discount: o.discountTotal || 0,
    deliveryFee: o.deliveryFee || 0,
    total: o.total,
    fulfilment: o.orderType === 'click_and_collect' ? 'pickup' : 'delivery',
    status: mapOrderStatus(o.status),
    paymentMethod: o.paymentMethod,
    paid: o.paymentStatus === 'paid',
  };
}

function mapApiCafeMenuItem(item) {
  const category = item.category === 'beverages' ? 'drinks' : item.category === 'food' ? 'mains' : item.category;
  return {
    id: item._id,
    name: item.name,
    category,
    price: item.price,
    prepMins: item.preparationTimeMinutes || 10,
    veg: item.tags?.includes('vegetarian') ?? true,
    rating: 4.5,
    image: item.image || '',
    description: item.description || '',
  };
}

function mapApiCafeOrder(order) {
  const statusMap = { created: 'received', confirmed: 'received', preparing: 'preparing', ready: 'ready', served: 'served', paid: 'completed', cancelled: 'cancelled' };
  return {
    id: order.orderNumber || order._id,
    orderId: order._id,
    userId: order.customer?._id || order.customer,
    channel: 'cafe',
    date: order.createdAt,
    table: order.table?.tableNumber || order.notes?.replace(/^Table /, '') || 'Counter',
    items: (order.items || []).map((item) => ({
      id: item.menuItem?._id || item.menuItem,
      name: item.itemName,
      qty: item.quantity,
      price: item.unitPrice,
    })),
    subtotal: order.subtotal,
    discount: order.discount || 0,
    total: order.total,
    status: statusMap[order.status] || order.status,
    paymentMethod: order.paymentMethod,
    paid: order.paymentStatus === 'paid',
  };
}

/** Backend order -> manager fulfilment queue row. */
function mapApiOrderToQueueRow(o) {
  return {
    id: o.orderNumber || o._id,
    orderId: o._id,
    rawStatus: o.status,
    customer: (o.customer && o.customer.name) || 'Member',
    items: (o.items || []).reduce((n, i) => n + i.quantity, 0),
    total: o.total,
    fulfilment: o.orderType === 'click_and_collect' ? 'pickup' : 'delivery',
    status: mapOrderStatus(o.status),
    placed: o.createdAt,
  };
}

/** Club operates on India Standard Time; all booking times are wall-clock in this zone. */
const CLUB_TIMEZONE = 'Asia/Kolkata';

/** "HH:MM" (club time) from a stored timestamp. */
function clock(date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLUB_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(date));
}

/** "YYYY-MM-DD" (club time) from a stored timestamp. */
function clubDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

/** Compose an explicit-offset ISO datetime (club time) the backend can parse unambiguously. */
function buildStartTime(date, start) {
  return `${date}T${start}:00+05:30`;
}

/** Backend booking document -> frontend booking row. */
function mapApiBooking(b) {
  const court = b.court || {};
  const sport = sportById(court.type);
  const bookedBy = b.bookedBy || {};
  const memberUser = b.memberUserId || bookedBy;
  const ownerId = bookedBy._id || memberUser._id;
  return {
    id: b._id,
    userId: ownerId ? String(ownerId) : '',
    memberName: bookedBy.name || memberUser.name || 'Member',
    sportId: court.type || '',
    sportName: sport?.name || (court.type ? court.type.charAt(0).toUpperCase() + court.type.slice(1) : 'Court'),
    courtId: court.code || (court._id ? String(court._id) : ''),
    courtName: court.name || 'Court',
    date: clubDate(b.startTime),
    start: clock(b.startTime),
    end: clock(b.endTime),
    price: b.price || 0,
    discount: 0,
    payable: b.price || 0,
    status: b.status,
    paid: b.paymentStatus === 'paid',
    paymentMethod: String(b.paymentMethod || 'upi').toUpperCase(),
    players: b.notes || 'Singles',
    partner: (Array.isArray(b.participants) && b.participants[0] && b.participants[0].name) || '—',
    bookingType: b.bookingType,
    notes: b.notes,
    createdAt: b.createdAt,
  };
}

/* ------------------------- manager data mappers ------------------------- */

const PLAN_META = {
  gold: { name: 'Gold', badge: 'gold', accent: '#fbbf24', popular: true, period: 'year', tagline: 'The full ClubBloom experience' },
  silver: { name: 'Silver', badge: 'silver', accent: '#cbd5e1', popular: false, period: 'year', tagline: 'Everything you need to play regularly' },
  junior: { name: 'Junior', badge: 'junior', accent: '#38bdf8', popular: false, period: 'year', tagline: 'Grow the game early' },
  trial: { name: 'Trial', badge: 'info', accent: '#00a3ff', popular: false, period: '14 days', tagline: 'Try ClubBloom free for 14 days' },
};

/** Backend membership plan document -> frontend plan card shape. */
function mapApiPlan(p) {
  const meta = PLAN_META[p.tier] || {};
  return {
    id: p.tier,
    _id: p._id,
    name: p.name || meta.name || titleCase(p.tier),
    tagline: p.description || meta.tagline || '',
    price: p.price ?? 0,
    period: p.durationDays ? `${p.durationDays} days` : p.durationMonths ? `${p.durationMonths} months` : meta.period,
    badge: meta.badge || 'neutral',
    accent: meta.accent || '#00a3ff',
    popular: p.tier === 'gold',
    discountPct: p.discountPercentage ?? 0,
    courtDiscountPct: p.courtBookingDiscount ?? 0,
    shopDiscountPct: p.shopDiscount ?? 0,
    cafeDiscountPct: p.cafeDiscount ?? 0,
    dailyBookingLimit: p.maxBookingsPerDay ?? 2,
    advanceBookingDays: p.tier === 'gold' ? 14 : 7,
    perks: p.benefits || [],
    isActive: p.isActive !== false,
  };
}

/** Registered user (+ optional membership doc) -> frontend member row. */
function mapMemberRow(user, member) {
  const tier = member?.tier || member?.membershipPlan?.tier || 'trial';
  const joinedSrc = member?.createdAt || user?.createdAt || Date.now();
  const expirySrc = member?.endDate || user?.createdAt || Date.now();
  return {
    id: member?.memberId || (user?._id ? String(user._id) : ''),
    _id: member?._id || null,
    userId: String(user?._id || member?.userId?._id || member?.userId || ''),
    name: user?.name || member?.userId?.name || 'Member',
    email: user?.email || member?.userId?.email || '—',
    phone: user?.phone || member?.userId?.phone || '—',
    plan: tier,
    age: '—',
    city: '—',
    joined: toISODate(new Date(joinedSrc)),
    expiryDate: toISODate(new Date(expirySrc)),
    sessionsThisMonth: 0,
    totalSpent: member?.amountPaid || 0,
    lastVisit: user?.lastLogin || user?.createdAt || joinedSrc,
    suspended: member ? member.status === 'suspended' : user?.isActive === false,
    memberStatus: member?.status || (user?.isActive === false ? 'suspended' : 'pending'),
  };
}

const TRIAL_FROM_API = { registered: 'requested', confirmed: 'scheduled', attended: 'completed', cancelled: 'declined', converted: 'converted' };
const TRIAL_TO_API = { requested: 'registered', scheduled: 'confirmed', completed: 'attended', declined: 'cancelled', converted: 'converted' };

/** Backend trial document -> frontend trial row. */
function mapApiTrial(t) {
  return {
    id: t._id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    sport: t.sport,
    date: toISODate(new Date(t.preferredDate)),
    slot: t.preferredTimeSlot,
    status: TRIAL_FROM_API[t.status] || 'requested',
    rawStatus: t.status,
    source: 'Website',
    createdAt: t.createdAt,
  };
}

/** Backend enquiry document -> frontend enquiry row. */
function mapApiEnquiry(e) {
  const createdOffset = Math.round((new Date(e.createdAt).getTime() - Date.now()) / 86400000);
  return {
    id: e._id,
    name: e.name,
    email: e.email,
    phone: e.phone || '—',
    interest: e.interestedIn || e.subject || 'General',
    source: titleCase(e.source || 'website'),
    createdOffset,
    status: e.status,
    note: e.message,
    notes: e.message,
    raw: e,
  };
}

/** Backend employee document -> frontend staff row. */
function mapApiEmployee(emp) {
  return {
    id: emp.employeeId || String(emp._id),
    _id: emp._id,
    userId: emp.userId?._id ? String(emp.userId._id) : String(emp.userId || ''),
    name: emp.userId?.name || emp.designation || 'Employee',
    role: emp.designation || emp.userId?.role || 'Staff',
    dept: emp.department || '—',
    shift: '—',
    salary: emp.salary || 0,
    attendance: emp.isActive === false ? 0 : 100,
    rating: 4.5,
    phone: emp.userId?.phone || '—',
    email: emp.userId?.email || '—',
    joined: toISODate(new Date(emp.joiningDate || emp.createdAt || Date.now())),
    leaveBalance: 0,
  };
}

/** Backend leave request -> frontend leave row. */
function mapApiLeave(l) {
  const emp = l.employee || {};
  const start = l.startDate ? new Date(l.startDate) : new Date();
  const end = l.endDate ? new Date(l.endDate) : start;
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  return {
    id: l._id,
    staffId: emp.employeeId || '',
    name: emp.userId?.name || emp.designation || 'Employee',
    type: `${titleCase(l.leaveType || 'casual')} Leave`,
    from: toISODate(start),
    to: toISODate(end),
    days,
    status: l.status,
    reason: l.reason || '',
  };
}

const CAFE_STATUS_FROM_API = { created: 'received', confirmed: 'received', preparing: 'preparing', ready: 'ready', served: 'served', paid: 'completed' };

/** Backend cafe order -> frontend kitchen board row. */
function mapApiKitchenOrder(o) {
  return {
    id: o._id,
    orderId: o._id,
    code: o.orderNumber,
    rawStatus: o.status,
    table: o.table?.tableNumber || '—',
    customer: o.customer?.name || 'Guest',
    items: (o.items || []).map((i) => `${i.quantity} × ${i.itemName}`).join(', '),
    placedMinsAgo: Math.max(0, Math.round((Date.now() - new Date(o.createdAt).getTime()) / 60000)),
    status: CAFE_STATUS_FROM_API[o.status] || 'received',
    amount: o.total || 0,
    method: o.paymentMethod || '—',
  };
}

/** Backend menu item -> frontend cafeteria menu row. */
function mapApiMenuItem(m) {
  return {
    id: m._id,
    name: m.name,
    category: m.category,
    price: m.price,
    memberPrice: m.memberPrice,
    prepMins: m.preparationTimeMinutes || 10,
    veg: true,
    rating: 4.5,
    description: m.description || '',
    available: m.isAvailable !== false,
  };
}

/** Backend table -> frontend cafe table row. */
function mapApiTable(t) {
  return {
    id: t.tableNumber,
    _id: t._id,
    label: t.location || `Table ${t.tableNumber}`,
    seats: t.capacity,
    zone: t.location || 'Indoor',
    status: t.status,
  };
}

/** Backend court document -> frontend court row (grouped by sport). */
function mapApiCourt(c) {
  const sport = sportById(c.type);
  const known = sport?.courts?.find((k) => k.id === c.code);
  return {
    id: c.code || String(c._id),
    _id: c._id,
    name: c.name,
    sportId: c.type,
    sportName: sport?.name || titleCase(c.type),
    icon: sport?.icon || 'MapPin',
    surface: c.description || known?.surface || titleCase(c.type),
    indoor: known?.indoor ?? false,
    shared: known?.shared ?? false,
    lights: known?.lights ?? true,
    status: c.status,
    peakPrice: c.walkInPrice || 0,
    memberPrice: c.memberPrice || 0,
    facilities: c.facilities || [],
  };
}

/** Backend finance transaction -> frontend ledger row. */
function mapApiTransaction(t) {
  return {
    id: t.reference || (t._id ? String(t._id).slice(-6) : `TX-${Math.random().toString(36).slice(2, 8)}`),
    date: t.date,
    party: t.performedBy?.name || t.description || 'Club',
    channel: titleCase(t.source || 'other'),
    method: titleCase(t.paymentMethod || 'online'),
    amount: t.type === 'expense' ? -Math.abs(t.amount) : t.amount,
    status: 'paid',
    type: t.type,
    raw: t,
  };
}

const BACKEND_NOTIF_META = {
  booking_created: { tone: 'success', icon: 'CalendarCheck', title: 'New court booking' },
  order_placed: { tone: 'info', icon: 'ShoppingBag', title: 'New shop order' },
  membership_subscribed: { tone: 'success', icon: 'Crown', title: 'New membership' },
  trial_registered: { tone: 'info', icon: 'Sparkles', title: 'New trial request' },
  enquiry_received: { tone: 'info', icon: 'Mail', title: 'New enquiry' },
  general: { tone: 'info', icon: 'Bell', title: 'Club announcement' },
};

/** Backend notification document -> frontend notification row. */
function mapApiNotification(n) {
  const meta = BACKEND_NOTIF_META[n.kind] || {};
  return {
    id: n._id,
    kind: n.kind,
    audience: n.audience || 'customer',
    title: n.title || meta.title || 'Notification',
    message: n.message,
    at: n.createdAt,
    read: Boolean(n.read),
    tone: meta.tone || 'info',
    icon: meta.icon || 'Bell',
    server: true,
  };
}

function mapApiPayment(payment) {
  const purposeLabels = {
    membership: 'Membership',
    shop_order: 'Shop purchase',
    cafeteria: 'Cafeteria purchase',
  };
  return {
    id: payment.paymentNumber,
    invoice: payment.paymentNumber,
    date: payment.createdAt,
    description: payment.notes || purposeLabels[payment.purpose] || 'Club payment',
    method: payment.gateway === 'razorpay' ? 'Razorpay' : payment.gateway,
    amount: payment.amount,
    status: payment.status === 'captured' ? 'paid' : payment.status,
  };
}

/** Backend member document -> frontend membership record. */
function mapApiMembership(m, user) {
  if (!m) return null;
  return {
    id: m.memberId || m._id,
    _id: m._id,
    userId: user?._id || user?.id,
    type: m.tier || 'trial',
    startDate: m.startDate ? toISODate(new Date(m.startDate)) : toISODate(new Date()),
    expiryDate: m.endDate ? toISODate(new Date(m.endDate)) : toISODate(new Date()),
    pricePaid: m.amountPaid || 0,
    paymentMethod: 'UPI',
    status: m.status === 'active' ? 'active' : m.status,
    familyMembers: 0,
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readStore(AUTH_KEY, null));
  const [membership, setMembership] = useState(customerMembership);
  const [profile, setProfile] = useState(customerProfile);
  const [payments, setPayments] = useState(seedPayments);
  const [bookings, setBookings] = useState(seedBookings);
  const [shopOrders, setShopOrders] = useState(seedShopOrders);
  const [cafeOrders, setCafeOrders] = useState(seedCafeOrders);
  const [cart, setCart] = useState({ items: [], channel: 'shop' });
  const [localNotifications, setLocalNotifications] = useState(seedNotifications);
  const [serverNotifications, setServerNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Manager / admin operational state
  const [members, setMembers] = useState(seedMembers);
  const [enquiries, setEnquiries] = useState(seedEnquiries);
  const [trials, setTrials] = useState(seedTrials);
  const [plans, setPlans] = useState(membershipPlans);
  const [productList, setProductList] = useState(seedProducts);
  const [staff, setStaff] = useState(seedStaff);
  const [leaveRequests, setLeaveRequests] = useState(seedLeave);
  const [kitchen, setKitchen] = useState(seedKitchen);
  const [cafeTables, setCafeTables] = useState([]);
  const [cafeMenuList, setCafeMenuList] = useState([]);
  const [courts, setCourts] = useState([]);
  const [finance, setFinance] = useState({ summary: null, transactions: [], expenses: [] });
  const [shopQueue, setShopQueue] = useState(seedShopQueue);
  const [maintenance, setMaintenance] = useState(buildMaintenance);
  const [clubConfig, setClubConfig] = useState({
    clubName: 'ClubBloom Sports Club',
    timezone: 'Asia/Kolkata',
    openTime: BOOKING_RULES.openingTime,
    closeTime: BOOKING_RULES.closingTime,
    maxBookingsPerDay: BOOKING_RULES.maxBookingsPerDay,
    allowSharedPlay: true,
    autoRenewReminder: true,
    trialDays: 14,
    gstPct: 18,
    maintenanceMode: false,
  });

  /* -------------------------- clean slate for real users -------------------------- */

  // Demo personas (quick-login) showcase seeded data; real accounts always start empty.
  const isDemo = Boolean(user) && demoAccounts.some((a) => a.email === user.email || a.id === (user._id || user.id));
  const identityRef = useRef(null);

  useEffect(() => {
    if (!user) {
      identityRef.current = null;
      return;
    }
    const identity = user._id || user.id || user.email;
    if (identity === identityRef.current) return;
    identityRef.current = identity;
    if (isDemo) return;
    // Brand-new (or freshly signed-in) real member → wipe every demo seed.
    setMembership(null);
    setPayments([]);
    setBookings([]);
    setShopOrders([]);
    setCafeOrders([]);
    setLocalNotifications([]);
  }, [user, isDemo]);

  /* --------------------------- backend loaders --------------------------- */

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.listProducts();
      const list = res.data.products || [];
      setProductList(list.map(mapApiProduct));
    } catch (error) {
      console.error('Failed to load shop products:', error);
    }
  }, []);

  const loadCafeMenu = useCallback(async () => {
    try {
      const res = await api.getCafeMenu();
      setCafeMenuList((res.data.items || []).map(mapApiCafeMenuItem));
    } catch (error) {
      console.error('Failed to load cafeteria menu:', error);
      setCafeMenuList([]);
    }
  }, []);

  const loadMyOrders = useCallback(async () => {
    try {
      const res = await api.getMyOrders();
      setShopOrders((res.data.orders || []).map(mapApiOrderToCustomerOrder));
    } catch (error) {
      console.error('Failed to load your orders:', error);
    }
  }, []);

  const loadMyPayments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getMyPayments();
      setPayments((res.data.payments || []).map(mapApiPayment));
    } catch (error) {
      console.error('Failed to load your payments:', error);
    }
  }, [user]);

  const loadMyCafeOrders = useCallback(async () => {
    try {
      const res = await api.getMyCafeOrders();
      setCafeOrders((res.data.orders || []).map(mapApiCafeOrder));
    } catch (error) {
      console.error('Failed to load your cafeteria orders:', error);
    }
  }, []);

  const loadManagerOrders = useCallback(async () => {
    try {
      const res = await api.getAllOrders();
      setShopQueue((res.data.orders || []).map(mapApiOrderToQueueRow));
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    const staffRoles = ['manager', 'super_admin', 'owner', 'admin', 'receptionist', 'accountant', 'shop_staff', 'bar_staff'];
    try {
      const res = staffRoles.includes(user.role) ? await api.listBookings() : await api.getMyBookings();
      setBookings((res.data.bookings || []).map(mapApiBooking));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  }, [user]);

  /** Load the signed-in member's live membership record (null when they have none). */
  const loadMyMembership = useCallback(async () => {
    if (!user || !['member', 'visitor', 'customer'].includes(user.role)) return;
    try {
      const res = await api.getMyMembership();
      setMembership(mapApiMembership(res.data?.member, user));
    } catch (error) {
      setMembership(null);
    }
  }, [user]);

  /** Load live notifications for the signed-in user (manager desk gets club activity). */
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.listNotifications();
      setServerNotifications((res.data.notifications || []).map(mapApiNotification));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [user]);

  /** Load the club's live membership plans from MongoDB. */
  const loadPlans = useCallback(async () => {
    try {
      const res = await api.getPlans();
      const list = res.data.plans || [];
      if (list.length) setPlans(list.map(mapApiPlan));
    } catch (error) {
      console.error('Failed to load membership plans:', error);
    }
  }, []);

  /** Load the live member register (staff view). */
  const loadMembers = useCallback(async () => {
    try {
      const firstPage = await api.listMembers(1);
      const totalPages = firstPage.data.totalPages || 1;
      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) => api.listMembers(index + 2))
      );
      const list = [
        ...(firstPage.data.members || []),
        ...remainingPages.flatMap((res) => res.data.members || []),
      ];
      setMembers(list.map((m) => mapMemberRow(m.userId || {}, m)));
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    if (!user || !['manager', 'super_admin', 'owner', 'admin', 'receptionist', 'accountant'].includes(user.role)) return;
    setMembers([]);
    loadMembers();
  }, [user, loadMembers]);

  // Load the live shop catalogue from MongoDB
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadCafeMenu();
  }, [loadCafeMenu]);

  // Load the signed-in user's orders from MongoDB
  useEffect(() => {
    if (user) loadMyOrders();
  }, [user, loadMyOrders]);

  useEffect(() => {
    if (user) loadMyPayments();
  }, [user, loadMyPayments]);

  useEffect(() => {
    if (user) loadMyCafeOrders();
  }, [user, loadMyCafeOrders]);

  // Load every order for the roles that fulfil shop orders
  useEffect(() => {
    if (user && ['manager', 'super_admin', 'owner', 'admin', 'shop_staff', 'receptionist'].includes(user.role)) {
      loadManagerOrders();
    }
  }, [user, loadManagerOrders]);

  // Load live court bookings (own for members, all for staff)
  useEffect(() => {
    if (user) loadBookings();
  }, [user, loadBookings]);

  // Load the signed-in member's live membership record
  useEffect(() => {
    if (user) loadMyMembership();
  }, [user, loadMyMembership]);

  // Poll live notifications so the manager desk hears about bookings/orders quickly
  useEffect(() => {
    if (!user) return undefined;
    loadNotifications();
    const timer = setInterval(loadNotifications, 25000);
    return () => clearInterval(timer);
  }, [user, loadNotifications]);

  // Load the club's membership plans once so customers can join a plan
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Load the member register for the roles that manage members
  useEffect(() => {
    if (user && ['manager', 'super_admin', 'owner', 'admin', 'receptionist'].includes(user.role)) {
      loadMembers();
    }
  }, [user, loadMembers]);

  useEffect(() => {
    writeStore(AUTH_KEY, user);
    if (user) {
      setProfile((prev) => ({
        ...prev,
        id: user._id || user.id || prev.id,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        city: user.city || prev.city,
      }));
    }
  }, [user]);

  // Fetch activities for current user
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const fetchActivities = async () => {
      if (user) {
        try {
          const response = await api.getMyActivities(20);
          setActivities(response.data.activities || []);
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        }
      }
    };
    fetchActivities();
  }, [user]);

  /* ------------------------------- toasts ------------------------------- */

  const toast = useCallback((title, message = '', type = 'info') => {
    toastId += 1;
    const id = toastId;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  /* ---------------------------- notifications ---------------------------- */

  // Live club notifications (bookings, orders, memberships) merge with any
  // local ones raised in this session so the manager desk sees everything.
  const notifications = useMemo(
    () => [...serverNotifications, ...localNotifications].sort((a, b) => String(b.at).localeCompare(String(a.at))),
    [serverNotifications, localNotifications]
  );

  const pushNotification = useCallback((kind, message, audience = 'customer') => {
    const meta = notificationKinds[kind] || {};
    setLocalNotifications((prev) => [
      {
        id: `N-${Date.now()}-${Math.round(Math.random() * 999)}`,
        kind,
        audience,
        message,
        at: new Date().toISOString(),
        read: false,
        title: meta.title,
        tone: meta.tone,
        icon: meta.icon,
      },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback(
    (id) => {
      if (serverNotifications.some((n) => n.id === id)) {
        setServerNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        api.markNotificationReadById(id).catch(() => {});
      } else {
        setLocalNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    },
    [serverNotifications]
  );

  const markAllNotificationsRead = useCallback(() => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setServerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.markAllNotificationsReadApi().catch(() => {});
  }, []);

  /* --------------------------------- auth -------------------------------- */

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await api.login(email, password);
        const account = response.data.user;
        setUser(account);
        toast(`Welcome back, ${account.name.split(' ')[0]}`, `Signed in successfully.`, 'success');
        return { ok: true, account };
      } catch (error) {
        return { ok: false, error: error.message || 'Login failed. Please check your credentials.' };
      }
    },
    [toast]
  );

  const quickLogin = useCallback(
    (role) => {
      const account = demoAccounts.find((a) => a.role === role);
      if (!account) return { ok: false };
      setUser(account);
      toast(`Signed in as ${account.title}`, `${account.name} · demo account`, 'success');
      return { ok: true, account };
    },
    [toast]
  );

  const register = useCallback(
    async (payload) => {
      try {
        const response = await api.register(payload.name, payload.email, payload.phone, payload.password);
        const account = response.data.user;
        setUser(account);
        toast('Account created', 'Your ClubBloom journey has started — a welcome seed is in your garden.', 'success');
        pushNotification('garden_milestone', 'A seed was planted in your garden. Book a session to help it grow!', 'customer');
        return { ok: true, account };
      } catch (error) {
        return { ok: false, error: error.message || 'Registration failed. Please try again.' };
      }
    },
    [toast, pushNotification]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    clearStore(AUTH_KEY);
    setCart({ items: [], channel: 'shop' });
    toast('Signed out', 'You have been signed out successfully.', 'info');
  }, [toast]);

  /* ------------------------------- bookings ------------------------------ */

  const createBooking = useCallback(
    async (payload) => {
      const sport = sportById(payload.sportId);
      if (!sport) return { ok: false, errors: ['Please choose a sport.'] };
      try {
        const body = {
          courtId: payload.courtId,
          startTime: buildStartTime(payload.date, payload.start),
          bookingType: 'member',
          paymentMethod: String(payload.paymentMethod || 'upi').toLowerCase(),
          notes: payload.players || 'Singles',
        };
        if (payload.partner && payload.partner !== '—') body.participants = [{ name: payload.partner }];

        const res = await api.createBooking(body);
        const booking = mapApiBooking(res.data.booking);
        await loadBookings();

        setPayments((prev) => [
          {
            id: `PY-${Date.now()}`,
            date: booking.date,
            description: `Court Booking — ${booking.sportName} ${booking.courtName}`,
            amount: booking.payable,
            method: booking.paymentMethod,
            status: 'paid',
            invoice: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
          },
          ...prev,
        ]);
        pushNotification('booking_confirmed', `${booking.sportName} · ${booking.courtName} on ${booking.date} at ${booking.start} is confirmed.`, 'customer');
        toast('Booking confirmed', `${booking.sportName} · ${booking.courtName} · ${booking.start}`, 'success');
        return { ok: true, booking };
      } catch (error) {
        return { ok: false, errors: [error.message || 'Booking could not be completed.'] };
      }
    },
    [loadBookings, toast, pushNotification]
  );

  const cancelBooking = useCallback(
    async (id, reason = 'Cancelled by member') => {
      try {
        await api.cancelBooking(id, reason);
        await loadBookings();
        return { ok: true };
      } catch (error) {
        toast('Cancel failed', error.message || 'Could not cancel the booking.', 'error');
        return { ok: false, error: error.message };
      }
    },
    [loadBookings, toast]
  );

  const updateBookingStatus = useCallback(
    async (id, status) => {
      try {
        await api.updateBookingStatusById(id, status);
        await loadBookings();
        const label = status === 'completed' ? 'Session Completed' : 'Reservation Confirmed';
        toast(label, `Booking is now ${status}.`, 'success');
        return { ok: true };
      } catch (error) {
        toast('Update failed', error.message || 'Could not update the booking.', 'error');
        return { ok: false, error: error.message };
      }
    },
    [loadBookings, toast]
  );

  /* ------------------------------ membership ----------------------------- */

  const membershipStatus = useMemo(() => getMembershipStatus(membership), [membership]);

  const gardenState = useMemo(
    () => getGardenState(user || profile, membership, bookings.filter((b) => b.status !== 'cancelled'), [...shopOrders, ...cafeOrders]),
    [user, profile, membership, bookings, shopOrders, cafeOrders]
  );

  // Activity stats derived from the member's own live bookings — a fresh
  // account therefore starts from zero, with nothing pre-seeded.
  const stats = useMemo(() => {
    const live = bookings.filter((b) => b.status !== 'cancelled');
    const month = toISODate(new Date()).slice(0, 7);
    const sessionsThisMonth = live.filter((b) => String(b.date || '').startsWith(month)).length;
    const sportCounts = {};
    live.forEach((b) => {
      if (b.sportName) sportCounts[b.sportName] = (sportCounts[b.sportName] || 0) + 1;
    });
    const favouriteSport = Object.keys(sportCounts).sort((a, b) => sportCounts[b] - sportCounts[a])[0] || '—';
    return {
      totalSessions: live.length,
      sessionsThisMonth,
      hoursPlayed: live.length,
      favouriteSport,
      winRate: 0,
      streakWeeks: 0,
      guestPassesLeft: 0,
      loyaltyPoints: Math.round(live.reduce((sum, b) => sum + (b.payable || 0), 0) / 5),
    };
  }, [bookings]);

  /**
   * Join a plan (first time) or renew the member's current plan. Switching to a
   * different plan while active is rejected by the backend.
   */
  const subscribeMembership = useCallback(
    async (planId, method = 'upi') => {
      try {
        await api.subscribeMembership(planId, String(method).toLowerCase());
        await loadMyMembership();
        toast('Membership activated', 'Your plan is now active. Welcome to the club!', 'success');
        return { ok: true };
      } catch (error) {
        toast('Could not activate plan', error.message || 'Please try again.', 'error');
        return { ok: false, error: error.message || 'Could not activate the plan.' };
      }
    },
    [loadMyMembership, toast]
  );

  const completeMembershipPayment = useCallback(async () => {
    await loadMyMembership();
    await loadMyPayments();
    toast('Membership activated', 'Razorpay verified your payment and activated your plan.', 'success');
  }, [loadMyMembership, loadMyPayments, toast]);

  const updateProfile = useCallback(
    (patch) => {
      setProfile((prev) => ({ ...prev, ...patch }));
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));
      toast('Profile updated', 'Your details have been saved.', 'success');
    },
    [toast]
  );

  /* --------------------------------- cart -------------------------------- */

  const addToCart = useCallback(
    (item, channel = 'shop') => {
      setCart((prev) => {
        const items = [...(prev.channel === channel ? prev.items : [])];
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + (item.qty || 1) };
        else items.push({ id: item.id, name: item.name, price: item.price, qty: item.qty || 1, image: item.image, meta: item.meta || '' });
        return { items, channel };
      });
      toast('Added to cart', `${item.name} added to your ${channel === 'shop' ? 'kit' : 'order'}.`, 'success');
    },
    [toast]
  );

  const setCartQty = useCallback((id, qty) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    }));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }, []);

  const clearCart = useCallback((channel) => {
    setCart((prev) => (prev.channel === channel ? { items: [], channel } : prev));
  }, []);

  const cartTotals = useMemo(() => {
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const plan = planById(membership?.type);
    const pct = cart.channel === 'shop' ? plan?.shopDiscountPct ?? 0 : plan?.cafeDiscountPct ?? 0;
    const discount = Math.round((subtotal * pct) / 100);
    return { subtotal, discount, discountPct: pct, total: subtotal - discount, count: cart.items.reduce((s, i) => s + i.qty, 0) };
  }, [cart, membership]);

  /* -------------------------------- orders ------------------------------- */

  const placeShopOrder = useCallback(
    async ({ fulfilment }) => {
      if (!cart.items.length) return { ok: false, error: 'Your cart is empty.' };
      try {
        const res = await api.placeOrder({
          items: cart.items.map((i) => ({ productId: i.id, quantity: i.qty })),
          orderType: fulfilment === 'pickup' ? 'click_and_collect' : 'online',
          notes: 'Placed via club app',
        });
        const order = res.data.order;
        return { ok: true, order };
      } catch (error) {
        return { ok: false, error: error.message || 'Could not place your order.' };
      }
    },
    [cart]
  );

  const placeCafeOrder = useCallback(
    async ({ table }) => {
      if (!cart.items.length) return { ok: false, error: 'Your cart is empty.' };
      try {
        const res = await api.createCafeOrder({
          items: cart.items.map((item) => ({ menuItemId: item.id, quantity: item.qty })),
          notes: table ? `Table ${table}` : 'Counter pickup',
        });
        return { ok: true, order: res.data.order };
      } catch (error) {
        return { ok: false, error: error.message || 'Could not create cafeteria order.' };
      }
    },
    [cart]
  );

  const completePaidPurchase = useCallback(async (channel, order) => {
    clearCart(channel);
    await loadMyPayments();
    if (channel === 'shop') {
      await Promise.all([loadProducts(), loadMyOrders()]);
      if (user && ['manager', 'super_admin', 'owner', 'admin', 'shop_staff', 'accountant'].includes(user.role)) {
        await loadManagerOrders();
      }
    } else {
      await loadMyCafeOrders();
    }
    toast(
      'Payment successful',
      `${channel === 'shop' ? 'Shop' : 'Cafeteria'} order ${order?.orderNumber || ''} is confirmed.`,
      'success'
    );
  }, [clearCart, loadMyPayments, loadProducts, loadMyOrders, loadManagerOrders, loadMyCafeOrders, user, toast]);

  const advanceKitchenOrder = useCallback(
    (id) => {
      const flow = ['received', 'preparing', 'ready', 'served', 'completed'];
      setKitchen((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const next = flow[Math.min(flow.indexOf(o.status) + 1, flow.length - 1)];
          return { ...o, status: next };
        })
      );
    },
    []
  );

  const advanceShopOrder = useCallback(
    async (id) => {
      const order = shopQueue.find((o) => o.id === id);
      if (!order || !order.orderId) return;
      const transitions = {
        confirmed: 'processing',
        processing: 'ready',
        ready: order.fulfilment === 'pickup' ? 'delivered' : 'dispatched',
        dispatched: 'delivered',
      };
      const next = transitions[order.rawStatus];
      if (!next) return;
      try {
        await api.updateOrderStatus(order.orderId, next);
        await Promise.all([loadManagerOrders(), loadMyOrders()]);
        toast('Order updated', `${order.id} is now ${next}.`, 'success');
      } catch (error) {
        toast('Update failed', error.message || 'Could not update the order.', 'error');
      }
    },
    [shopQueue, loadManagerOrders, loadMyOrders, toast]
  );

  /* -------------------------- manager operations ------------------------- */

  const addMember = useCallback(
    (payload) => {
      const member = {
        id: `MB-${Math.floor(Math.random() * 9000 + 1100)}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        plan: payload.plan,
        age: Number(payload.age) || 25,
        city: payload.city || '—',
        joined: toISODate(new Date()),
        expiryDate: toISODate(addDays(new Date(), planDurationDays(payload.plan))),
        sessionsThisMonth: 0,
        totalSpent: planById(payload.plan)?.price || 0,
        lastVisit: toISODate(new Date()),
        suspended: false,
      };
      setMembers((prev) => [member, ...prev]);
      toast('Member added', `${member.name} joined on the ${member.plan} plan.`, 'success');
      return member;
    },
    [toast]
  );

  const updateMember = useCallback((id, patch) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const suspendMember = useCallback(
    (id) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, suspended: !m.suspended } : m)));
      toast('Membership updated', 'Member status has been changed.', 'info');
    },
    [toast]
  );

  const updateTrial = useCallback(
    (id, status) => {
      setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      const messages = {
        scheduled: 'Your trial has been scheduled. See you at the club!',
        completed: 'Trial completed — your membership upgrade offer is ready.',
        declined: 'That slot was unavailable. Please request another trial slot.',
      };
      if (messages[status]) pushNotification(status === 'declined' ? 'booking_cancelled' : 'trial_approved', messages[status], 'customer');
      toast('Trial updated', `Trial ${id} marked as ${status}.`, status === 'declined' ? 'error' : 'success');
    },
    [toast, pushNotification]
  );

  const updateEnquiry = useCallback((id, status) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const updateStaff = useCallback((id, patch) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addStaff = useCallback(
    (payload) => {
      setStaff((prev) => [
        {
          id: `ST-${prev.length + 1 < 10 ? `0${prev.length + 1}` : prev.length + 1}`,
          name: payload.name,
          role: payload.role,
          dept: payload.dept || 'Operations',
          shift: payload.shift || 'Morning',
          salary: Number(payload.salary) || 30000,
          attendance: 100,
          rating: 4.5,
          phone: payload.phone || '—',
          joined: toISODate(new Date()),
        },
        ...prev,
      ]);
      toast('Employee added', `${payload.name} has been added to the team.`, 'success');
    },
    [toast]
  );

  const decideLeave = useCallback(
    (id, status) => {
      setLeaveRequests((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast(status === 'approved' ? 'Leave approved' : 'Leave rejected', `Request ${id} updated.`, status === 'approved' ? 'success' : 'info');
    },
    [toast]
  );

  const savePlan = useCallback(
    (planId, patch) => {
      setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...patch } : p)));
      toast('Plan updated', `${planId.toUpperCase()} plan saved.`, 'success');
    },
    [toast]
  );

  const addProduct = useCallback(
    async (payload) => {
      try {
        const catsRes = await api.getCategories();
        const categories = catsRes.data.categories || [];
        const wanted = String(payload.category || 'Accessories').trim();
        let category = categories.find((c) => c.name.toLowerCase() === wanted.toLowerCase());
        if (!category) {
          const created = await api.createCategory({ name: wanted });
          category = created.data.category;
        }
        await api.createProduct({
          name: payload.name,
          brand: payload.brand || 'ClubBloom',
          category: category._id,
          sku: `SKU-${Date.now()}`,
          price: Number(payload.price) || 0,
          stock: Number(payload.stock) || 0,
          images: payload.image ? [payload.image] : [],
          description: payload.description || '',
        });
        await loadProducts();
        toast('Product added', `${payload.name} is now in the shop.`, 'success');
        return { ok: true };
      } catch (error) {
        toast('Could not add product', error.message || 'Please try again.', 'error');
        return { ok: false, error: error.message };
      }
    },
    [loadProducts, toast]
  );

  const updateProduct = useCallback(
    async (id, patch) => {
      try {
        const body = {};
        if (patch.price !== undefined) body.price = Number(patch.price) || 0;
        if (patch.stock !== undefined) body.stock = Number(patch.stock) || 0;
        if (patch.name !== undefined) body.name = patch.name;
        if (!Object.keys(body).length) return { ok: true };
        await api.updateProductById(id, body);
        await loadProducts();
        return { ok: true };
      } catch (error) {
        toast('Could not update product', error.message || 'Please try again.', 'error');
        return { ok: false, error: error.message };
      }
    },
    [loadProducts, toast]
  );

  const blockCourt = useCallback(
    (block) => {
      setMaintenance((prev) => [...prev, block]);
      toast('Court blocked', `${block.courtId} reserved for maintenance.`, 'info');
    },
    [toast]
  );

  const unblockCourt = useCallback((index) => {
    setMaintenance((prev) => prev.filter((_, i) => i !== index));
    toast('Block removed', 'The court is bookable again.', 'success');
  }, [toast]);

  const setConfig = useCallback(
    (patch) => {
      setClubConfig((prev) => ({ ...prev, ...patch }));
      toast('Settings saved', 'Club configuration updated.', 'success');
    },
    [toast]
  );

  /* -------------------------------- value -------------------------------- */

  const value = useMemo(
    () => ({
      // auth
      user,
      accounts: demoAccounts,
      login,
      quickLogin,
      register,
      logout,
      isAuthenticated: Boolean(user),
      role: user?.role || 'guest',

      // customer
      profile,
      updateProfile,
      membership,
      membershipStatus,
      completeMembershipPayment,
      subscribeMembership,
      gardenState,
      payments,
      stats,
      bookings,
      createBooking,
      cancelBooking,
      updateBookingStatus,
      shopOrders,
      cafeOrders,
      cafeMenuList,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      cart,
      cartTotals,
      placeShopOrder,
      placeCafeOrder,
      completePaidPurchase,

      // notifications + toasts
      notifications,
      pushNotification,
      markNotificationRead,
      markAllNotificationsRead,
      toasts,
      toast,
      dismissToast,

      // manager / admin
      members,
      addMember,
      updateMember,
      suspendMember,
      enquiries,
      updateEnquiry,
      trials,
      updateTrial,
      plans,
      savePlan,
      productList,
      addProduct,
      updateProduct,
      staff,
      addStaff,
      updateStaff,
      leaveRequests,
      decideLeave,
      kitchen,
      advanceKitchenOrder,
      shopQueue,
      advanceShopOrder,
      maintenance,
      blockCourt,
      unblockCourt,
      clubConfig,
      setConfig,
      rules: BOOKING_RULES,
    }),
    [
      user, login, quickLogin, register, logout,
      profile, updateProfile, membership, membershipStatus, completeMembershipPayment, subscribeMembership, gardenState, payments, stats,
      bookings, createBooking, cancelBooking, updateBookingStatus, shopOrders, cafeOrders, cafeMenuList,
      addToCart, setCartQty, removeFromCart, clearCart, cart, cartTotals, placeShopOrder, placeCafeOrder, completePaidPurchase,
      notifications, pushNotification, markNotificationRead, markAllNotificationsRead, toasts, toast, dismissToast,
      members, addMember, updateMember, suspendMember, enquiries, updateEnquiry, trials, updateTrial,
      plans, savePlan, productList, addProduct, updateProduct, staff, addStaff, updateStaff,
      leaveRequests, decideLeave, kitchen, advanceKitchenOrder, shopQueue, advanceShopOrder,
      maintenance, blockCourt, unblockCourt, clubConfig, setConfig,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export default AppContext;
