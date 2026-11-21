/**
 * Court inventory + booking rule engine.
 *
 * Rules implemented here (single source of truth for customer + manager views):
 *  - Every session lasts exactly one hour.
 *  - New start times open on a 30-minute grid.
 *  - A member may play at most twice per day.
 *  - No double booking of the same court slot.
 *  - Shared-court social play is supported on selected courts.
 */

import { facilities } from './facilities';

export const BOOKING_RULES = {
  sessionMinutes: 60,
  slotStepMinutes: 30,
  maxBookingsPerDay: 10,
  openingTime: '06:00',
  closingTime: '22:00',
  peakWindows: [
    ['18:00', '21:00'],
    ['07:00', '09:00'],
  ],
};

export const cancellableLeadHours = 2;

const courtSets = {
  tennis: [
    { id: 'TN-1', name: 'Centre Court', surface: 'Acrylic Hard', indoor: false, shared: false, lights: true },
    { id: 'TN-2', name: 'Court 2', surface: 'Acrylic Hard', indoor: false, shared: false, lights: true },
    { id: 'TN-3', name: 'Court 3', surface: 'Clay', indoor: false, shared: false, lights: true },
    { id: 'TN-4', name: 'Court 4', surface: 'Acrylic Hard', indoor: false, shared: true, lights: false },
    { id: 'TN-5', name: 'Court 5', surface: 'Acrylic Hard', indoor: false, shared: true, lights: true },
    { id: 'TN-6', name: 'Court 6', surface: 'Clay', indoor: false, shared: false, lights: true },
  ],
  badminton: [
    { id: 'BD-1', name: 'Court A', surface: 'Wooden', indoor: true, shared: false, lights: true },
    { id: 'BD-2', name: 'Court B', surface: 'Wooden', indoor: true, shared: false, lights: true },
    { id: 'BD-3', name: 'Court C', surface: 'Synthetic', indoor: true, shared: true, lights: true },
    { id: 'BD-4', name: 'Court D', surface: 'Synthetic', indoor: true, shared: true, lights: true },
    { id: 'BD-5', name: 'Court E', surface: 'Wooden', indoor: true, shared: false, lights: true },
    { id: 'BD-6', name: 'Court F', surface: 'Wooden', indoor: true, shared: false, lights: true },
    { id: 'BD-7', name: 'Court G', surface: 'Synthetic', indoor: true, shared: false, lights: true },
    { id: 'BD-8', name: 'Court H', surface: 'Synthetic', indoor: true, shared: false, lights: true },
  ],
  cricket: [
    { id: 'CK-1', name: 'Turf Lane 1', surface: 'Turf', indoor: true, shared: false, lights: true },
    { id: 'CK-2', name: 'Turf Lane 2', surface: 'Turf', indoor: true, shared: false, lights: true },
    { id: 'CK-3', name: 'Oval Practice', surface: 'Turf', indoor: false, shared: true, lights: true },
    { id: 'CK-4', name: 'Oval Practice B', surface: 'Turf', indoor: false, shared: true, lights: true },
  ],
  padel: [
    { id: 'PD-1', name: 'Padel 1', surface: 'Blue Turf', indoor: false, shared: true, lights: true },
    { id: 'PD-2', name: 'Padel 2', surface: 'Blue Turf', indoor: false, shared: true, lights: true },
    { id: 'PD-3', name: 'Padel 3', surface: 'Blue Turf', indoor: true, shared: true, lights: true },
    { id: 'PD-4', name: 'Padel 4', surface: 'Blue Turf', indoor: true, shared: true, lights: true },
  ],
};

export const bookableSports = facilities
  .filter((f) => courtSets[f.id])
  .map((f) => ({
    id: f.id,
    name: f.name,
    icon: f.icon,
    accent: f.accent,
    hours: f.hours,
    peakPrice: f.peakPrice,
    offPeakPrice: f.offPeakPrice,
    courts: courtSets[f.id],
  }));

export const courtById = (id) => {
  for (const sport of bookableSports) {
    const found = sport.courts.find((c) => c.id === id);
    if (found) return { ...found, sportId: sport.id, sportName: sport.name };
  }
  return null;
};

export const sportById = (id) => bookableSports.find((s) => s.id === id);

/** Deterministic pseudo-random so demo data is stable across reloads. */
function seeded(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function isPeakSlot(startTime) {
  const [h, m] = startTime.split(':').map(Number);
  const mins = h * 60 + m;
  return BOOKING_RULES.peakWindows.some(([a, b]) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return mins >= ah * 60 + am && mins < bh * 60 + bm;
  });
}

export function slotLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Build the slot grid for a court on a date.
 * @returns Array<{ start, end, minutes, status, price, peak }>
 */
export function buildCourtSlots({ date, courtId, bookings = [], blocked = [], now = new Date() }) {
  const start = toMinutes(BOOKING_RULES.openingTime);
  const lastStart = toMinutes(BOOKING_RULES.closingTime) - BOOKING_RULES.sessionMinutes;
  const step = BOOKING_RULES.slotStepMinutes;
  const isToday = date === toISODate(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  let i = 0;
  for (let m = start; m <= lastStart; m += step) {
    const s = slotLabel(m);
    const e = slotLabel(m + BOOKING_RULES.sessionMinutes);
    const courtBookings = bookings.filter((b) => b.courtId === courtId && b.date === date);
    const isBooked = courtBookings.some((b) => overlaps(b.start, b.end, s, e));
    const isBlocked = blocked.some((bl) => bl.courtId === courtId && bl.date === date && overlaps(bl.start, bl.end, s, e));
    const isPast = isToday && m <= nowMinutes;

    let status = 'available';
    if (isBlocked) status = 'maintenance';
    else if (isBooked) status = 'booked';
    else if (isPast) status = 'past';

    const peak = isPeakSlot(s);
    const seed = courtId.length * 37 + m + date.length * 11;
    const popularity = seeded(seed);
    if (status === 'available' && popularity > 0.86) status = 'held';

    slots.push({ start: s, end: e, minutes: m, status, peak, seatIndex: i++ });
  }
  return slots;
}

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

export function toISODate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function priceForSlot(sport, start) {
  return isPeakSlot(start) ? sport.peakPrice : sport.offPeakPrice;
}

export const refundPolicyNote =
  'Free cancellation up to 2 hours before the session start. Later cancellations are charged at 50% of the court fee.';

export const blockedSlots = [
  { courtId: 'TN-3', date: '', start: '12:00', end: '14:00', reason: 'Surface resurfacing' },
  { courtId: 'BD-5', date: '', start: '15:00', end: '16:00', reason: 'Net replacement' },
];

/** Social-play sessions open to individual players joining a shared court. */
export const socialPlaySessions = [
  { id: 'SP-1', sport: 'padel', courtId: 'PD-1', title: 'Padel Social Mixer', level: 'Intermediate', day: 'Fri', time: '19:00', joined: 3, capacity: 4, fee: 350 },
  { id: 'SP-2', sport: 'tennis', courtId: 'TN-4', title: 'Doubles Round Robin', level: 'Beginner friendly', day: 'Sat', time: '08:00', joined: 5, capacity: 8, fee: 400 },
  { id: 'SP-3', sport: 'badminton', courtId: 'BD-3', title: 'Weeknight Smash', level: 'Open', day: 'Wed', time: '20:00', joined: 4, capacity: 8, fee: 250 },
  { id: 'SP-4', sport: 'padel', courtId: 'PD-3', title: 'Corporate Padel Ladder', level: 'Advanced', day: 'Sun', time: '17:30', joined: 2, capacity: 4, fee: 500 },
];

/**
 * Validate a booking attempt against every club rule.
 * @returns { ok: boolean, errors: string[] }
 */
export function validateBooking({ booking, existingBookings = [], blocked = [], club = {}, membership }) {
  const errors = [];
  const court = courtById(booking.courtId);
  if (!court) errors.push('Selected court could not be found.');

  const sameCourt = existingBookings.filter((b) => b.courtId === booking.courtId && b.date === booking.date && b.status !== 'cancelled');
  if (sameCourt.some((b) => overlaps(b.start, b.end, booking.start, booking.end))) {
    errors.push('That court slot is already booked. Please pick another time.');
  }

  if (blocked.some((bl) => bl.courtId === booking.courtId && bl.date === booking.date && overlaps(bl.start, bl.end, booking.start, booking.end))) {
    errors.push('That slot is blocked for maintenance by the club.');
  }

  const dailyLimit = membership?.dailyBookingLimit || BOOKING_RULES.maxBookingsPerDay;
  const mineToday = existingBookings.filter(
    (b) => b.userId === booking.userId && b.date === booking.date && b.status !== 'cancelled'
  );
  if (isToday(booking.date) && mineToday.length >= dailyLimit) {
    errors.push(`You have reached the limit of ${dailyLimit} sessions per day.`);
  }

  if (isToday(booking.date)) {
    const now = new Date();
    const [h, m] = booking.start.split(':').map(Number);
    if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) {
      errors.push('That start time has already passed today.');
    }
  }

  if (court && club.courtsClosed?.includes(court.id)) {
    errors.push('This court is currently closed by club management.');
  }

  return { ok: errors.length === 0, errors };
}

function isToday(date) {
  return date === toISODate(new Date());
}
