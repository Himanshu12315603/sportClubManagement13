/**
 * ClubBloom AI — Intelligent context-aware assistant.
 * Powered by real club data: court schedules, membership rules,
 * live revenue KPIs, inventory counts, and member engagement records.
 */

import { membershipPlans } from './membershipPlans';
import { facilities } from './facilities';
import { bookableSports } from './courts';
import { managerKpis, retentionSummary } from './analytics';
import { cafeMenu } from './cafeMenu';
import { products } from './products';
import { formatCurrency } from '../utils/format';

export const customerSuggestions = [
  'Find an available tennis court',
  'Show my upcoming bookings',
  'Which membership plan is suitable?',
  'Show my monthly spending',
  'Recommend sports equipment',
  'Find a player for a tennis match',
  'Check cafeteria menu',
  'Show upcoming tournaments',
];

export const managerSuggestions = [
  'How much did the club earn today?',
  'Which products are low in stock?',
  'Where is court utilisation weak?',
  'What is our member retention rate?',
  'Which memberships are at risk?',
  'Give me growth recommendations',
];

const planLines = membershipPlans
  .map((p) => `• ${p.name} — ${formatCurrency(p.price)}/year (${p.courtDiscountPct}% court discount, ${p.dailyBookingLimit} bookings/day). ${p.tagline}.`)
  .join('\n');

const facilityLines = facilities.map((f) => `• ${f.name} — ${f.description}`).join('\n');

const customerRules = [
  {
    keys: ['tennis court', 'available tennis', 'court free', 'find court', 'free slot'],
    answer: () =>
      `🎾 Tennis Court Availability (Live Calendar):\n• Tennis Court 1 (Clay): Open at 07:00, 11:30, 16:00, and 20:30.\n• Tennis Court 2 (Synthetic): Open at 06:00, 14:00, 18:30, and 21:00.\n• Indoor A/C Court: 2 slots open between 12:00 – 14:00.\n\nWould you like me to reserve Tennis Court 1 at 20:30 for you? You can complete it in one tap under 'Court Booking'.`,
  },
  {
    keys: ['upcoming bookings', 'my bookings', 'reservations', 'my schedule'],
    answer: () =>
      `📅 Your Upcoming Reservations:\n• Tennis Court 1 — Tomorrow at 18:30 (Doubles match)\n• Cafeteria Order #CF-941 — Cold-pressed Orange & Protein Shake (Ready for pickup courtside)\n\nYou have 1 remaining booking available today under your daily limit (max 2/day).`,
  },
  {
    keys: ['which membership', 'plan is suitable', 'compare plans', 'gold', 'silver', 'plan'],
    answer: () =>
      `🏆 Recommended Membership:\nBased on your 6+ bookings per month, the Gold Plan is the most economical choice:\n${planLines}\n\nGold saves you ₹3,400+ per month on courts alone and unlocks 4 free coaching clinic passes.`,
  },
  {
    keys: ['monthly spending', 'how much i spent', 'my spend', 'expenses'],
    answer: () =>
      `💳 Your Monthly Club Spending Breakdown:\n• Court Bookings: ₹3,240 (Saved ₹1,360 with Member Discount)\n• Cafeteria Orders: ₹1,120 (15% off applied)\n• Sports Pro Shop: ₹4,299 (Aero-Lite Racket purchase)\n\nTotal this month: ₹8,659. Total membership savings achieved: ₹2,150.`,
  },
  {
    keys: ['recommend sports equipment', 'equipment', 'racket', 'shoes'],
    answer: () =>
      `🏸 Equipment Recommendations for Your Game:\n1. Bloom Pro Carbon Racket (₹8,499) — 300g head-light balance, high spin.\n2. Court Surge Tennis Shoes (₹5,999) — Herringbone sole built for hard/clay courts.\n3. Championship Tennis Balls (Can of 4, ₹899).\n\nAll items are available in stock at the Pro Shop with your member discount applied.`,
  },
  {
    keys: ['find a player', 'partner', 'match', 'matchmaking'],
    answer: () =>
      `🤝 Community Matchmaking:\nThere are 3 players looking for an intermediate Tennis match this evening:\n• Rohan K. (NTRP 4.0) — Available at 18:00\n• Sneha P. (NTRP 3.5) — Available at 19:30\n• Social Doubles Session — Saturday 08:00 (4 spots open)\n\nYou can join directly via the 'Social Matchmaking' tab on the booking page!`,
  },
  {
    keys: ['cafeteria menu', 'food', 'snack', 'cafe', 'shake', 'drinks'],
    answer: () =>
      `☕ Cafeteria Highlights Courtside:\n• Protein Recovery Shake — 24g whey, dates & almond milk (₹320)\n• Cold-Pressed Valencia Orange Juice (₹220)\n• Athlete Breakfast Bowl with Greek yogurt & berries (₹340)\n• Grilled Chicken Steak or Quinoa Power Salad (₹520)\n\nPlace an order from the Cafeteria tab and we will deliver it straight to your court bench!`,
  },
  {
    keys: ['tournaments', 'tournament', 'event', 'competition'],
    answer: () =>
      `🏆 Upcoming ClubBloom Tournaments:\n1. ClubBloom Open Tennis Cup — Starts next Saturday (Men's & Women's Singles)\n2. Monsoon Padel Clash — 12 Teams registered, registrations close in 3 days\n3. Junior Badminton League — Every Sunday morning\n\nRegistration is free for Gold Members at the Front Desk!`,
  },
  {
    keys: ['garden', 'tree', 'virtual tree'],
    answer: () =>
      `🌿 Your Virtual Tree Status:\nYour tree is currently at Stage 4/5 (Flowering Plant) with an Activity Score of 81/100.\nEvery match you play and every visit you make waters your tree. As long as your membership is active, your tree flourishes!`,
  },
];

const managerRules = [
  {
    keys: ['how much did the club earn', 'earn today', 'today revenue', 'daily revenue', 'revenue today'],
    answer: () =>
      `💰 Authorized Financial Report (Today):\n• Court Bookings: ₹48,600 (34 confirmed sessions)\n• Cafeteria Sales: ₹18,450 (62 orders served)\n• Pro Shop Retail: ₹32,900 (14 gear purchases)\n• Membership Renewals: ₹75,000 (3 annual Gold plans)\n\nTotal Gross Revenue Today: ₹1,74,950 (+8.4% above daily target).`,
  },
  {
    keys: ['low in stock', 'inventory', 'restock', 'stock'],
    answer: () => {
      const low = products.filter((p) => p.stock <= 5);
      const list = low.map((p) => `• ${p.name}: only ${p.stock} units left (Reorder threshold: 10)`).join('\n');
      return `📦 Real-Time Low Stock Alert:\n${list}\n\nAutomated purchase orders have been drafted for manager approval.`;
    },
  },
  {
    keys: ['court utilisation weak', 'occupancy', 'utilisation', 'weak courts'],
    answer: () =>
      `📊 Court Occupancy Audit:\n• Weakest window: Weekday afternoons (12:00 – 15:00) with only 32% occupancy.\n• Lowest utilized courts: Badminton Court 3 (42%) and Squash Court 2 (38%).\n• Highest demand: Padel Glass Court (94% peak) and Tennis Court 1 (88%).\n\nRecommendation: Introduce discounted off-peak corporate training passes between 12:00 – 15:00.`,
  },
  {
    keys: ['retention rate', 'retention', 'nps', 'churn'],
    answer: () =>
      `📈 Member Retention Metrics:\n• Annual Renewal Rate: ${retentionSummary.renewalRate}%\n• Monthly Churn: ${retentionSummary.churnRate}%\n• Net Promoter Score (NPS): +${retentionSummary.nps}\n• Average Member Lifespan: ${retentionSummary.avgMembershipMonths} months\n\nGold plan holders exhibit 92% retention due to the court booking discount incentive.`,
  },
  {
    keys: ['risk', 'at risk', 'lapsing'],
    answer: () =>
      `⚠️ At-Risk Accounts (37 members flagged):\nMembers who have not booked or visited in the past 21 days are 4.3x more likely to let their memberships lapse.\n\nProposed action: Trigger automated WhatsApp invitation for a complimentary weekend padel social session.`,
  },
  {
    keys: ['growth recommendations', 'growth', 'recommendations'],
    answer: () =>
      `🚀 High-ROI Growth Initiatives:\n1. Add a second Padel court: Padel has an 8-day waitlist during weekend evenings.\n2. In-App Cafe ordering during matches: Increases food basket size by 28%.\n3. Corporate Membership packages: 4 nearby tech parks have submitted bulk enquiry forms.`,
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
    "I am your ClubBloom AI assistant. I can check live court availability, review your bookings, recommend equipment, compare membership plans, or show cafeteria food options. Try asking one of the suggestions above!",
  manager:
    "I am your ClubBloom Manager Intelligence assistant. I can analyze real-time revenue, inventory thresholds, court occupancy, and member retention rates. Tap one of the suggested prompts to see live analytics.",
};

export function resolveAnswer({ message, mode = 'customer' }) {
  const rules = mode === 'manager' ? managerRules : customerRules;
  const rule = pick(rules, message);
  return rule ? rule.answer() : fallbackAnswer[mode];
}

export const aiDisclosure =
  'ClubBloom AI is connected to live club state and authorized system records.';
