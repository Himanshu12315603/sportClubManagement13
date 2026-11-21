import { addDays, toISODate } from '../utils/format';

/** Seed records for the demo customer: bookings, shop orders and cafe orders. */

export const seedBookings = [
  { id: 'BK-8001', userId: 'U-1001', sportId: 'tennis', sportName: 'Tennis', courtId: 'TN-1', courtName: 'Centre Court', date: toISODate(addDays(new Date(), 2)), start: '18:00', end: '19:00', price: 900, discount: 270, payable: 630, status: 'confirmed', paid: true, paymentMethod: 'UPI', players: 'Doubles', partner: 'Sneha P.', createdAt: toISODate(addDays(new Date(), -1)) },
  { id: 'BK-8002', userId: 'U-1001', sportId: 'padel', sportName: 'Padel', courtId: 'PD-1', courtName: 'Padel 1', date: toISODate(addDays(new Date(), 4)), start: '19:00', end: '20:00', price: 1000, discount: 300, payable: 700, status: 'confirmed', paid: true, paymentMethod: 'UPI', players: 'Doubles', partner: 'Aarav M.', createdAt: toISODate(new Date()) },
  { id: 'BK-8003', userId: 'U-1001', sportId: 'badminton', sportName: 'Badminton', courtId: 'BD-2', courtName: 'Court B', date: toISODate(addDays(new Date(), -4)), start: '20:00', end: '21:00', price: 500, discount: 150, payable: 350, status: 'completed', paid: true, paymentMethod: 'UPI', players: 'Singles', partner: '—', createdAt: toISODate(addDays(new Date(), -8)) },
  { id: 'BK-8004', userId: 'U-1001', sportId: 'tennis', sportName: 'Tennis', courtId: 'TN-3', courtName: 'Court 3', date: toISODate(addDays(new Date(), -11)), start: '07:00', end: '08:00', price: 550, discount: 165, payable: 385, status: 'completed', paid: true, paymentMethod: 'Card', players: 'Singles', partner: '—', createdAt: toISODate(addDays(new Date(), -14)) },
  { id: 'BK-8005', userId: 'U-1001', sportId: 'padel', sportName: 'Padel', courtId: 'PD-3', courtName: 'Padel 3', date: toISODate(addDays(new Date(), -18)), start: '18:30', end: '19:30', price: 1000, discount: 300, payable: 700, status: 'cancelled', paid: false, paymentMethod: '—', players: 'Doubles', partner: 'Tara M.', createdAt: toISODate(addDays(new Date(), -20)) },
  { id: 'BK-8006', userId: 'U-1001', sportId: 'cricket', sportName: 'Cricket', courtId: 'CK-1', courtName: 'Turf Lane 1', date: toISODate(addDays(new Date(), -25)), start: '09:00', end: '10:00', price: 1200, discount: 360, payable: 840, status: 'completed', paid: true, paymentMethod: 'UPI', players: 'Net practice', partner: 'Coach Vikram', createdAt: toISODate(addDays(new Date(), -28)) },
];

export const seedShopOrders = [
  { id: 'SH-1140', userId: 'U-1001', channel: 'shop', date: toISODate(addDays(new Date(), -2)), items: [{ id: 'P-1001', name: 'Bloom Pro Carbon Racket', qty: 1, price: 8499 }], subtotal: 8499, discount: 1700, deliveryFee: 0, total: 6799, fulfilment: 'pickup', status: 'packing', paymentMethod: 'Card', paid: true },
  { id: 'SH-1098', userId: 'U-1001', channel: 'shop', date: toISODate(addDays(new Date(), -34)), items: [{ id: 'P-4001', name: 'Performance Grip Tape (3 Pack)', qty: 2, price: 399 }, { id: 'P-3001', name: 'Championship Tennis Balls (4)', qty: 3, price: 899 }], subtotal: 3495, discount: 700, deliveryFee: 149, total: 2944, fulfilment: 'delivery', status: 'delivered', paymentMethod: 'UPI', paid: true },
];

export const seedCafeOrders = [
  { id: 'CF-2204', userId: 'U-1001', channel: 'cafe', date: toISODate(addDays(new Date(), -1)), table: 'T3', items: [{ id: 'C-501', name: 'Quinoa Power Bowl', qty: 1, price: 420 }, { id: 'C-102', name: 'Protein Recovery Shake', qty: 1, price: 320 }, { id: 'C-601', name: 'Dark Chocolate Brownie', qty: 1, price: 250 }], subtotal: 990, discount: 96, deliveryFee: 0, total: 894, status: 'served', paymentMethod: 'UPI', paid: false },
  { id: 'CF-2150', userId: 'U-1001', channel: 'cafe', date: toISODate(addDays(new Date(), -9)), table: 'T6', items: [{ id: 'C-301', name: 'Grilled Chicken Steak', qty: 2, price: 520 }, { id: 'C-104', name: 'Fresh Lime Soda', qty: 2, price: 140 }], subtotal: 1320, discount: 198, deliveryFee: 0, total: 1122, status: 'served', paymentMethod: 'Card', paid: true },
];

/** Live cafe order board for the manager screen. */
export const kitchenQueue = [
  { id: 'CF-2310', table: 'T1', items: '2 × Peri-Peri Fries, 1 × Masala Chai', placedMinsAgo: 4, status: 'received', amount: 610, method: 'UPI' },
  { id: 'CF-2311', table: 'T5', items: '1 × Grilled Salmon Salad, 1 × Cold-Pressed Orange', placedMinsAgo: 7, status: 'preparing', amount: 840, method: 'Card' },
  { id: 'CF-2312', table: 'T2', items: '3 × Masala Cheese Toast, 3 × Fresh Lime Soda', placedMinsAgo: 12, status: 'preparing', amount: 1050, method: 'Cash' },
  { id: 'CF-2313', table: 'T7', items: '1 × Padel Power Pasta', placedMinsAgo: 16, status: 'ready', amount: 440, method: 'UPI' },
  { id: 'CF-2314', table: 'T8', items: '2 × Hummus & Pita, 1 × Mango Cheesecake', placedMinsAgo: 22, status: 'ready', amount: 840, method: 'UPI' },
];

export const shopOrderQueue = [
  { id: 'SH-1152', customer: 'Kabir Singh', items: 2, total: 12998, fulfilment: 'pickup', status: 'packing', placed: toISODate(new Date()) },
  { id: 'SH-1151', customer: 'Ishita Bansal', items: 1, total: 5999, fulfilment: 'delivery', status: 'dispatched', placed: toISODate(addDays(new Date(), -1)) },
  { id: 'SH-1150', customer: 'Aditya Ghosh', items: 4, total: 7420, fulfilment: 'pickup', status: 'ready', placed: toISODate(addDays(new Date(), -1)) },
  { id: 'SH-1149', customer: 'Tara Menon', items: 1, total: 3899, fulfilment: 'delivery', status: 'delivered', placed: toISODate(addDays(new Date(), -3)) },
  { id: 'SH-1148', customer: 'Yash Patel', items: 3, total: 5247, fulfilment: 'pickup', status: 'delivered', placed: toISODate(addDays(new Date(), -4)) },
];

/** Weekday availability heat for the manager booking calendar. */
export const bookingHeatmap = [
  { day: 'Mon', slots: [3, 5, 7, 4, 2, 1, 2, 6, 9, 8, 3] },
  { day: 'Tue', slots: [2, 6, 8, 5, 3, 2, 3, 7, 8, 7, 2] },
  { day: 'Wed', slots: [4, 7, 9, 6, 4, 2, 4, 8, 9, 8, 4] },
  { day: 'Thu', slots: [3, 6, 8, 5, 3, 3, 5, 9, 9, 7, 3] },
  { day: 'Fri', slots: [5, 8, 9, 6, 4, 3, 6, 10, 10, 9, 6] },
  { day: 'Sat', slots: [8, 10, 10, 9, 8, 6, 8, 10, 9, 8, 7] },
  { day: 'Sun', slots: [7, 9, 9, 8, 7, 5, 7, 9, 8, 6, 5] },
];

export const heatmapHours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:00', '20:00', '21:00', '22:00'];
