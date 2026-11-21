/** Membership plans. Prices, benefits and discounts are fully configurable here. */

export const membershipPlans = [
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'The full ClubBloom experience',
    price: 24999,
    period: 'year',
    badge: 'badge-gold',
    accent: '#fbbf24',
    popular: true,
    discountPct: 30,
    courtDiscountPct: 30,
    shopDiscountPct: 20,
    cafeDiscountPct: 15,
    dailyBookingLimit: 2,
    advanceBookingDays: 14,
    perks: [
      'Premium access to every facility',
      'Priority court bookings (14-day window)',
      'Maximum applicable discounts — 30% on courts',
      'Complimentary monthly coaching session',
      'Free guest passes (4 per month)',
      'Exclusive members-only tournaments',
      'Dedicated locker + towel service',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Everything you need to play regularly',
    price: 14999,
    period: 'year',
    badge: 'badge-silver',
    accent: '#cbd5e1',
    popular: false,
    discountPct: 15,
    courtDiscountPct: 15,
    shopDiscountPct: 10,
    cafeDiscountPct: 8,
    dailyBookingLimit: 2,
    advanceBookingDays: 7,
    perks: [
      'Standard access to all facilities',
      'Regular booking benefits (7-day window)',
      'Standard discounts — 15% on courts',
      '2 guest passes per month',
      'Access to club social leagues',
      'Member pricing at the cafeteria',
    ],
  },
  {
    id: 'junior',
    name: 'Junior',
    tagline: 'Grow the game early',
    price: 7999,
    period: 'year',
    badge: 'badge-junior',
    accent: '#38bdf8',
    popular: false,
    discountPct: 20,
    courtDiscountPct: 20,
    shopDiscountPct: 15,
    cafeDiscountPct: 10,
    dailyBookingLimit: 1,
    advanceBookingDays: 7,
    ageGroup: '6 – 16 years',
    perks: [
      'Special discounted junior membership',
      'Age-appropriate facilities and coaching',
      'Junior academy + weekend activities',
      '20% off courts during junior hours',
      'Structured skill-level progression',
      'Free junior club kit',
    ],
  },
];

export const trialPlan = {
  id: 'trial',
  name: 'Trial',
  tagline: 'Try ClubBloom free for 14 days',
  price: 0,
  period: '14 days',
  days: 14,
  badge: 'badge-info',
  accent: '#00a3ff',
  perks: [
    'Access to two sports of your choice',
    '2 trial sessions per sport',
    'Guided facility tour',
    'Preview of membership benefits',
    'Full access to the ClubBloom app',
  ],
};

export const paymentMethods = [
  { id: 'upi', label: 'UPI', hint: 'GPay / PhonePe / Paytm', icon: 'Smartphone' },
  { id: 'card', label: 'Card', hint: 'Credit or debit card', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash', hint: 'Pay at the club counter', icon: 'Banknote' },
];

export const planById = (id) => membershipPlans.find((p) => p.id === id) || null;

export const planName = (id) => (id === 'trial' ? 'Trial' : planById(id)?.name || 'Member');
