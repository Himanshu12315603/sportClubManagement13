/**
 * ClubBloom AI — local, rule-based assistant.
 *
 * IMPORTANT: this is a front-end demo. There is no model call and no backend
 * request; every answer is composed from the club's own data. Replace
 * `resolveAnswer` with a real API call when the backend is ready.
 */

import { membershipPlans } from './membershipPlans';
import { facilities } from './facilities';
import { bookableSports } from './courts';
import { managerKpis, retentionSummary } from './analytics';
import { formatCurrency } from '../utils/format';

export const customerSuggestions = [
  'Which sport suits me best?',
  'Are there courts free tonight?',
  'Explain the membership plans',
  'Should I renew my membership?',
  'How do I book a court?',
  'What facilities does ClubBloom have?',
];

export const managerSuggestions = [
  'How is revenue trending?',
  'Which memberships are at risk?',
  'Where is court utilisation weak?',
  'What is our retention rate?',
  'What should I restock first?',
  'Give me growth recommendations',
];

const planLines = membershipPlans
  .map((p) => `• ${p.name} — ${formatCurrency(p.price)}/year, ${p.courtDiscountPct}% off courts, up to ${p.dailyBookingLimit} sessions/day. ${p.tagline}.`)
  .join('\n');

const facilityLines = facilities.map((f) => `• ${f.name} — ${f.description}`).join('\n');

const sportLines = bookableSports.map((s) => `• ${s.name} — ${s.courts.length} courts, ${s.hours}`).join('\n');

const customerRules = [
  {
    keys: ['sport', 'recommend', 'suits me', 'which sport'],
    answer: () =>
      `Here is how I would choose for you:\n• Want fast social fun → Padel (highest demand, easy to learn).\n• Want a long-term technical game → Tennis.\n• Want the fastest, most explosive workout → Badminton.\n• Want team energy and net practice → Cricket lanes.\n\nYou currently play Tennis most often, so I would add one padel social session a week to keep things fresh.`,
  },
  {
    keys: ['free', 'available', 'tonight', 'slot', 'empty'],
    answer: () =>
      `Tonight's best availability:\n• Tennis — Court 4 and Court 6 are open after 20:30.\n• Badminton — Courts E, F and H have 21:00 starts.\n• Padel — fully booked until 22:00 (popular!).\n\nTip: new slots open on a 30-minute grid, so checking back at :00 and :30 works best.`,
  },
  {
    keys: ['plan', 'plans', 'membership', 'gold', 'silver', 'junior', 'price', 'cost'],
    answer: () => `Our three plans:\n${planLines}\n\nGold pays for itself after roughly 5 bookings a month because of the 30% court discount.`,
  },
  {
    keys: ['renew', 'expire', 'expiry', 'extend'],
    answer: () =>
      `Your Gold membership expires in 19 days. Renewing now keeps your priority 14-day booking window and your tree keeps blooming — renewal replays the healthy growth animation instead of letting the tree wither.`,
  },
  {
    keys: ['book', 'booking', 'reserve', 'cancel'],
    answer: () =>
      `Booking takes three taps:\n1. Bookings → pick a sport.\n2. Choose a court, date and one of the 30-minute-aligned slots.\n3. Confirm — a 1-hour session, maximum 2 per day.\n\nYou can cancel free of charge up to 2 hours before the start time.`,
  },
  {
    keys: ['facility', 'facilities', 'what do you have', 'club have'],
    answer: () => `ClubBloom facilities:\n${facilityLines}`,
  },
  {
    keys: ['garden', 'tree', 'plant', 'sapling'],
    answer: () =>
      `Your 3D virtual tree mirrors your membership:\n• Every completed session, shop order and cafe visit grows your tree.\n• Active and engaged → a lush green, thriving tree.\n• Expiring → leaves fade and fall as the membership runs out.\n• Expired → only bare branches remain, withered through a gradual transition, never a sudden disappear.\n\nYou are currently at stage 4 of 5 — a Flowering Tree.`,
  },
  {
    keys: ['coach', 'training', 'lesson'],
    answer: () =>
      `Coaching options: private 1-to-1 (₹1,200/session), 4-session packs (₹4,800) and free group clinics for Gold members every Saturday at 08:00.`,
  },
  {
    keys: ['discount', 'offer', 'benefit'],
    answer: () =>
      `Your Gold benefits: 30% off courts, 20% off the pro shop, 15% off the cafeteria, 4 guest passes a month and 4 complimentary coaching sessions per year.`,
  },
];

const managerRules = [
  {
    keys: ['revenue', 'trend', 'sales', 'profit'],
    answer: () =>
      `Revenue trend:\n• This month: ${formatCurrency(managerKpis.monthlyRevenue, true)} total, ${formatCurrency(managerKpis.monthlyRevenue - managerKpis.monthlyExpenses, true)} profit.\n• Courts are the largest channel followed by memberships.\n• Growth is +4.2% MoM, led by padel and the cafeteria attach-rate.\n\nWatch item: ${formatCurrency(managerKpis.pendingPayments, true)} is sitting in pending payments.`,
  },
  {
    keys: ['risk', 'at risk', 'churn', 'lapsing', 'retention'],
    answer: () =>
      `Retention snapshot:\n• Renewal rate ${retentionSummary.renewalRate}%, churn ${retentionSummary.churnRate}%.\n• 37 members are flagged at-risk (no visit in 21+ days).\n• Members who skip two straight weeks are 4.3x more likely to lapse.\n\nSuggested action: auto-offer a free social-play seat to every at-risk member.`,
  },
  {
    keys: ['utilisation', 'utilization', 'occupancy', 'court'],
    answer: () =>
      `Court utilisation:\n• Padel PD-1 and PD-2 are above 90% — a fifth court is justified.\n• Tennis TN-3 and badminton BD-5 are below 40%.\n• Weekday 12:00–15:00 is the largest idle window.\n\nMove a coaching clinic into those hours to lift off-peak occupancy.`,
  },
  {
    keys: ['retention rate', 'nps'],
    answer: () => `Renewal rate is ${retentionSummary.renewalRate}%, churn ${retentionSummary.churnRate}%, average membership length ${retentionSummary.avgMembershipMonths} months and NPS ${retentionSummary.nps}.`,
  },
  {
    keys: ['restock', 'stock', 'inventory', 'low'],
    answer: () =>
      `Restock priority:\n1. Leather Cricket Ball (Red) — 3 left vs weekly demand of 14.\n2. Runway Trainer — 4 left.\n3. All-Weather Track Jacket — 7 left, winter league is coming.\n\nSuggested reorder value: ₹86,400 across four SKUs.`,
  },
  {
    keys: ['growth', 'recommend', 'improve', 'suggestion'],
    answer: () =>
      `Three highest-return actions:\n1. Launch a 6-week beginner padel course at ₹3,500/head — padel is at 93% peak utilisation.\n2. Bundle a junior membership with a shop voucher to lift retail attach rate.\n3. Make cafeteria ordering app-only during peak hours to cut queue time and raise throughput.`,
  },
  {
    keys: ['member', 'membership trend', 'trend'],
    answer: () =>
      `Membership base is ${managerKpis.totalMembers} members: ${managerKpis.activeMemberships} active, ${managerKpis.expiredMemberships} expired, ${managerKpis.trialUsers} on trial. Gold is growing fastest at +21% QoQ.`,
  },
];

function pick(rules, message) {
  const text = message.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const rule of rules) {
    const score = rule.keys.reduce((acc, k) => (text.includes(k) ? acc + k.length : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }
  return bestScore > 0 ? best : null;
}

export const fallbackAnswer = {
  customer:
    "I can help with sports recommendations, court availability, membership plans, renewals, bookings and the virtual garden. Try asking about any of those — or tap a suggested question.",
  manager:
    'I can help with revenue, retention, court utilisation, inventory and growth planning. Try asking one of the suggested questions.',
};

/** @param {{ message: string, mode?: 'customer' | 'manager' }} args */
export function resolveAnswer({ message, mode = 'customer' }) {
  const rules = mode === 'manager' ? managerRules : customerRules;
  const rule = pick(rules, message);
  return rule ? rule.answer() : fallbackAnswer[mode];
}

export const aiDisclosure =
  'ClubBloom AI is running in offline demo mode. Answers are generated locally from club data — no external model or backend is connected yet.';
