import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  demoAccounts,
  customerMembership,
  customerProfile,
  paymentHistory as seedPayments,
  customerStats,
} from '../data/currentUser';
import { membershipPlans, planById } from '../data/membershipPlans';
import { products as seedProducts } from '../data/products';
import { members as seedMembers, enquiries as seedEnquiries } from '../data/members';
import { trialRegistrations as seedTrials } from '../data/trials';
import { seedNotifications, notificationKinds } from '../data/notifications';
import { seedBookings, seedShopOrders, seedCafeOrders, kitchenQueue as seedKitchen, shopOrderQueue as seedShopQueue } from '../data/seed';
import { staff as seedStaff, leaveRequests as seedLeave } from '../data/staff';
import { BOOKING_RULES, blockedSlots, sportById, priceForSlot, validateBooking, courtById } from '../data/courts';
import { getMembershipStatus, planDurationDays, getGardenState } from '../utils/membership';
import { addDays, toISODate } from '../utils/format';
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

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readStore(AUTH_KEY, null));
  const [membership, setMembership] = useState(customerMembership);
  const [profile, setProfile] = useState(customerProfile);
  const [payments, setPayments] = useState(seedPayments);
  const [bookings, setBookings] = useState(seedBookings);
  const [shopOrders, setShopOrders] = useState(seedShopOrders);
  const [cafeOrders, setCafeOrders] = useState(seedCafeOrders);
  const [cart, setCart] = useState({ items: [], channel: 'shop' });
  const [notifications, setNotifications] = useState(seedNotifications);
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

  useEffect(() => {
    writeStore(AUTH_KEY, user);
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

  const pushNotification = useCallback((kind, message, audience = 'customer') => {
    const meta = notificationKinds[kind] || {};
    setNotifications((prev) => [
      {
        id: `N-${Date.now()}-${Math.round(Math.random() * 999)}`,
        kind,
        audience,
        message,
        at: new Date().toISOString(),
        read: false,
        title: meta.title,
        tone: meta.tone,
      },
      ...prev,
    ]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /* --------------------------------- auth -------------------------------- */

  const login = useCallback(
    (email, password) => {
      const cleaned = String(email).trim().toLowerCase();
      const account = demoAccounts.find(
        (a) =>
          a.email.toLowerCase() === cleaned ||
          (a.role === 'staff' && (cleaned === 'staff@clubbloom.in' || cleaned === 'staff')) ||
          (a.role === 'admin' && (cleaned === 'admin@clubbloom.in' || cleaned === 'admin')) ||
          (a.role === 'manager' && (cleaned === 'manager@clubbloom.in' || cleaned === 'manager'))
      );
      if (!account) return { ok: false, error: 'No ClubBloom account found for that email.' };
      if (account.password !== password) return { ok: false, error: 'Incorrect password. Please try again.' };
      setUser(account);
      toast(`Welcome back, ${account.name.split(' ')[0]}`, `Signed in as ${account.title}.`, 'success');
      return { ok: true, account };
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
    (payload) => {
      const account = {
        id: `U-${Date.now()}`,
        role: 'customer',
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city || '—',
        memberSince: toISODate(new Date()),
        avatarSeed: payload.name.slice(0, 2).toUpperCase(),
        title: 'New Member',
      };
      setUser(account);
      toast('Account created', 'Your ClubBloom journey has started — a welcome seed is in your garden.', 'success');
      pushNotification('garden_milestone', 'A seed was planted in your garden. Book a session to help it grow!', 'customer');
      return { ok: true, account };
    },
    [toast, pushNotification]
  );

  const logout = useCallback(() => {
    setUser(null);
    clearStore(AUTH_KEY);
    setCart({ items: [], channel: 'shop' });
    toast('Signed out', 'You have been signed out successfully.', 'info');
  }, [toast]);

  /* ------------------------------- bookings ------------------------------ */

  const createBooking = useCallback(
    (payload) => {
      const sport = sportById(payload.sportId);
      if (!sport) return { ok: false, errors: ['Please choose a sport.'] };
      const court = courtById(payload.courtId);
      const price = priceForSlot(sport, payload.start);
      const plan = planById(membership?.type);
      const discountPct = plan?.courtDiscountPct ?? 0;
      const discount = Math.round((price * discountPct) / 100);

      const draft = {
        id: `BK-${Date.now()}`,
        userId: user?.id || 'U-1001',
        sportId: sport.id,
        sportName: sport.name,
        courtId: payload.courtId,
        courtName: court?.name || 'Court',
        date: payload.date,
        start: payload.start,
        end: payload.end,
        price,
        discount,
        payable: price - discount,
        status: 'confirmed',
        paid: true,
        paymentMethod: payload.paymentMethod || 'UPI',
        players: payload.players || 'Singles',
        partner: payload.partner || '—',
        createdAt: toISODate(new Date()),
      };

      const check = validateBooking({
        booking: draft,
        existingBookings: bookings,
        blocked: maintenance,
        membership: plan,
        club: clubConfig,
      });
      if (!check.ok) return { ok: false, errors: check.errors };

      setBookings((prev) => [draft, ...prev]);
      setPayments((prev) => [
        {
          id: `PY-${Date.now()}`,
          date: draft.date,
          description: `Court Booking — ${draft.sportName} ${draft.courtName}`,
          amount: draft.payable,
          method: draft.paymentMethod,
          status: 'paid',
          invoice: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        },
        ...prev,
      ]);
      pushNotification('booking_confirmed', `${draft.sportName} · ${draft.courtName} on ${draft.date} at ${draft.start} is confirmed.`, 'customer');
      toast('Booking confirmed', `${draft.sportName} · ${draft.courtName} · ${draft.start}`, 'success');
      return { ok: true, booking: draft };
    },
    [bookings, maintenance, clubConfig, membership, user, toast, pushNotification]
  );

  const cancelBooking = useCallback(
    (id, reason = 'Cancelled by member') => {
      const target = bookings.find((b) => b.id === id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
      if (target) {
        pushNotification('booking_cancelled', `${target.sportName} · ${target.courtName} on ${target.date} was cancelled. ${reason}`, 'customer');
      }
      toast('Booking cancelled', 'Your slot has been released back to the club.', 'info');
      return { ok: true };
    },
    [bookings, toast, pushNotification]
  );

  const updateBookingStatus = useCallback(
    (id, status, notes = '') => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, notes: notes || b.notes } : b)));
      const label = status === 'completed' ? 'Session Completed' : status === 'confirmed' ? 'Reservation Confirmed' : 'Booking Updated';
      toast(label, `Booking ${id} is now ${status}.`, 'success');
      return { ok: true };
    },
    [toast]
  );

  /* ------------------------------ membership ----------------------------- */

  const membershipStatus = useMemo(() => getMembershipStatus(membership), [membership]);

  const gardenState = useMemo(
    () => getGardenState(user || profile, membership, bookings.filter((b) => b.status !== 'cancelled'), [...shopOrders, ...cafeOrders]),
    [user, profile, membership, bookings, shopOrders, cafeOrders]
  );

  const renewMembership = useCallback(
    ({ planId, method = 'UPI', autoRenew = false }) => {
      const plan = planById(planId);
      if (!plan) return { ok: false, error: 'Unknown plan.' };
      const updated = {
        ...membership,
        type: plan.id,
        startDate: toISODate(new Date()),
        expiryDate: toISODate(addDays(new Date(), planDurationDays(plan.id))),
        pricePaid: plan.price,
        paymentMethod: method,
        status: autoRenew ? 'auto-renew on' : 'auto-renew off',
      };
      setMembership(updated);
      setPayments((prev) => [
        {
          id: `PY-${Date.now()}`,
          date: toISODate(new Date()),
          description: `${plan.name} Membership Renewal`,
          amount: plan.price,
          method,
          status: 'paid',
          invoice: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        },
        ...prev,
      ]);
      pushNotification('payment_success', `${plan.name} membership activated for 12 months. Welcome back to full bloom!`, 'customer');
      toast('Membership renewed', `Your garden is recovering — ${plan.name} benefits are live.`, 'success');
      return { ok: true, membership: updated };
    },
    [membership, toast, pushNotification]
  );

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
    ({ fulfilment, paymentMethod, deliveryFee = 0 }) => {
      if (!cart.items.length) return { ok: false, error: 'Your cart is empty.' };
      const order = {
        id: `SH-${Math.floor(Math.random() * 9000 + 1200)}`,
        userId: user?.id || 'U-1001',
        channel: 'shop',
        date: toISODate(new Date()),
        items: cart.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        subtotal: cartTotals.subtotal,
        discount: cartTotals.discount,
        deliveryFee,
        total: cartTotals.total + deliveryFee,
        fulfilment,
        status: fulfilment === 'pickup' ? 'ready' : 'packing',
        paymentMethod,
        paid: true,
      };
      setShopOrders((prev) => [order, ...prev]);
      setShopQueue((prev) => [
        { id: order.id, customer: profile.name, items: order.items.length, total: order.total, fulfilment, status: order.status, placed: order.date },
        ...prev,
      ]);
      setProductList((prev) =>
        prev.map((p) => {
          const line = order.items.find((i) => i.id === p.id);
          return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
        })
      );
      clearCart('shop');
      pushNotification('order_received', `Shop order ${order.id} received. ${fulfilment === 'pickup' ? 'Ready for club pickup in 2 hours.' : 'Out for delivery in 2–4 days.'}`, 'customer');
      toast('Order placed', `Shop order ${order.id} confirmed — ₹${order.total.toLocaleString('en-IN')}`, 'success');
      return { ok: true, order };
    },
    [cart, cartTotals, user, profile, clearCart, toast, pushNotification]
  );

  const placeCafeOrder = useCallback(
    ({ table, paymentMethod }) => {
      if (!cart.items.length) return { ok: false, error: 'Your cart is empty.' };
      const order = {
        id: `CF-${Math.floor(Math.random() * 9000 + 2300)}`,
        userId: user?.id || 'U-1001',
        channel: 'cafe',
        date: toISODate(new Date()),
        table,
        items: cart.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        subtotal: cartTotals.subtotal,
        discount: cartTotals.discount,
        deliveryFee: 0,
        total: cartTotals.total,
        status: 'received',
        paymentMethod,
        paid: true,
      };
      setCafeOrders((prev) => [order, ...prev]);
      setKitchen((prev) => [
        {
          id: order.id,
          table,
          items: order.items.map((i) => `${i.qty} × ${i.name}`).join(', '),
          placedMinsAgo: 0,
          status: 'received',
          amount: order.total,
          method: paymentMethod,
        },
        ...prev,
      ]);
      clearCart('cafe');
      pushNotification('order_received', `Cafeteria order ${order.id} received at table ${table}. We will bring it over shortly.`, 'customer');
      toast('Order sent to kitchen', `Table ${table} · ₹${order.total.toLocaleString('en-IN')}`, 'success');
      return { ok: true, order };
    },
    [cart, cartTotals, user, clearCart, toast, pushNotification]
  );

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

  const advanceShopOrder = useCallback((id) => {
    const flow = ['packing', 'ready', 'dispatched', 'delivered'];
    setShopQueue((prev) => {
      const order = prev.find((o) => o.id === id);
      if (!order) return prev;
      const start = order.fulfilment === 'pickup' ? ['ready', 'delivered'] : flow;
      const next = start[Math.min(start.indexOf(order.status) + 1, start.length - 1)] || order.status;
      return prev.map((o) => (o.id === id ? { ...o, status: next } : o));
    });
  }, []);

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
    (payload) => {
      const product = {
        id: `P-${Math.floor(Math.random() * 9000 + 1100)}`,
        name: payload.name,
        brand: payload.brand || 'ClubBloom',
        category: payload.category,
        price: Number(payload.price) || 0,
        mrp: Number(payload.mrp) || Number(payload.price) || 0,
        stock: Number(payload.stock) || 0,
        rating: 4.5,
        sport: payload.sport || 'Multi',
        image: payload.image || '',
        description: payload.description || '',
      };
      setProductList((prev) => [product, ...prev]);
      toast('Product added', `${product.name} is now in the shop.`, 'success');
    },
    [toast]
  );

  const updateProduct = useCallback((id, patch) => {
    setProductList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

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
      renewMembership,
      gardenState,
      payments,
      stats: customerStats,
      bookings,
      createBooking,
      cancelBooking,
      updateBookingStatus,
      shopOrders,
      cafeOrders,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      cart,
      cartTotals,
      placeShopOrder,
      placeCafeOrder,

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
      profile, updateProfile, membership, membershipStatus, renewMembership, gardenState, payments,
      bookings, createBooking, cancelBooking, updateBookingStatus, shopOrders, cafeOrders,
      addToCart, setCartQty, removeFromCart, clearCart, cart, cartTotals, placeShopOrder, placeCafeOrder,
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
