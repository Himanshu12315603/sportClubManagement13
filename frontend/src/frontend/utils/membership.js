/**
 * Membership + garden state engine.
 * Single source of truth for tree health, growth stage and garden score.
 * Deterministic: derived from membership validity + club activity — never random.
 */

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRING: 'EXPIRING',
  EXPIRED: 'EXPIRED',
  TRIAL: 'TRIAL',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
};

export const PLANT_STAGES = [
  { key: 'seed', label: 'Seed', level: 1, min: 0, desc: 'A tiny seed sleeps in the soil. Every journey starts here.' },
  { key: 'sprout', label: 'Sprout', level: 2, min: 18, desc: 'A small sprout pushes through — your first sessions are paying off.' },
  { key: 'growing', label: 'Growing Plant', level: 3, min: 40, desc: 'Growing strong. Consistent play is building real momentum.' },
  { key: 'flowering', label: 'Flowering Plant', level: 4, min: 66, desc: 'Your plant is blooming with colour and confidence.' },
  { key: 'magical', label: 'Magical Garden', level: 5, min: 88, desc: 'A fully grown magical garden. You are a ClubBloom legend.' },
];

const PLAN_DAYS = { trial: 14, junior: 180, silver: 365, gold: 365 };

/** Resolve the live status of a membership record. */
export function getMembershipStatus(membership) {
  if (!membership) return MEMBERSHIP_STATUS.EXPIRED;
  const now = Date.now();
  const expiry = new Date(membership.expiryDate).getTime();
  const isTrial = membership.type === 'trial';

  if (Number.isNaN(expiry)) return isTrial ? MEMBERSHIP_STATUS.TRIAL_EXPIRED : MEMBERSHIP_STATUS.EXPIRED;
  if (expiry < now) return isTrial ? MEMBERSHIP_STATUS.TRIAL_EXPIRED : MEMBERSHIP_STATUS.EXPIRED;
  if (isTrial) return MEMBERSHIP_STATUS.TRIAL;

  const remaining = Math.ceil((expiry - now) / 86400000);
  return remaining <= 21 ? MEMBERSHIP_STATUS.EXPIRING : MEMBERSHIP_STATUS.ACTIVE;
}

export function statusMeta(status) {
  switch (status) {
    case MEMBERSHIP_STATUS.ACTIVE:
      return { label: 'Active', tone: 'badge-active' };
    case MEMBERSHIP_STATUS.EXPIRING:
      return { label: 'Expiring Soon', tone: 'badge-warning' };
    case MEMBERSHIP_STATUS.EXPIRED:
      return { label: 'Expired', tone: 'badge-danger' };
    case MEMBERSHIP_STATUS.TRIAL:
      return { label: 'Trial', tone: 'badge-info' };
    case MEMBERSHIP_STATUS.TRIAL_EXPIRED:
      return { label: 'Trial Ended', tone: 'badge-danger' };
    default:
      return { label: 'Unknown', tone: 'badge-neutral' };
  }
}

export function isMembershipAlive(status) {
  return status === MEMBERSHIP_STATUS.ACTIVE || status === MEMBERSHIP_STATUS.EXPIRING || status === MEMBERSHIP_STATUS.TRIAL;
}

export function planDurationDays(planId) {
  return PLAN_DAYS[planId] ?? 365;
}

/**
 * Activity score (0-100) built from real club engagement signals.
 * Used to derive the plant stage so the garden reflects the member.
 */
export function computeActivityScore({ bookings = [], orders = [], status }) {
  const base = isMembershipAlive(status) ? 26 : status === MEMBERSHIP_STATUS.TRIAL_EXPIRED ? 12 : 8;
  const bookingScore = Math.min(bookings.length * 5.5, 34);
  const shopScore = Math.min(orders.filter((o) => o.channel === 'shop').length * 4, 14);
  const cafeScore = Math.min(orders.filter((o) => o.channel === 'cafe').length * 3.5, 12);
  const recency = bookings.length ? 8 : 0;
  const continuity = status === MEMBERSHIP_STATUS.EXPIRING ? 4 : status === MEMBERSHIP_STATUS.ACTIVE ? 10 : 0;
  const raw = base + bookingScore + shopScore + cafeScore + recency + continuity;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Map an activity score to the matching plant stage. */
export function getPlantStage(score, status) {
  const dead = status === MEMBERSHIP_STATUS.EXPIRED || status === MEMBERSHIP_STATUS.TRIAL_EXPIRED;
  const alive = isMembershipAlive(status);
  const effective = alive ? score : Math.min(score, 14);
  const stage = [...PLANT_STAGES].reverse().find((s) => effective >= s.min) || PLANT_STAGES[0];
  return { ...stage, withered: dead, health: effective };
}

export function getGardenState(user, membership, bookings = [], orders = []) {
  const status = getMembershipStatus(membership);
  const meta = statusMeta(status);
  const score = computeActivityScore({ bookings, orders, status });
  const stage = getPlantStage(score, status);
  const totalDays = planDurationDays(membership?.type);
  const remaining = membership ? Math.max(0, Math.ceil((new Date(membership.expiryDate) - Date.now()) / 86400000)) : 0;
  return {
    status,
    statusLabel: meta.label,
    tone: meta.tone,
    score,
    stage,
    remainingDays: remaining,
    totalDays,
    lifespanPct: Math.max(0, Math.min(100, Math.round((remaining / totalDays) * 100))),
    alive: isMembershipAlive(status),
    celebration: score >= 78 && isMembershipAlive(status),
    user,
  };
}
