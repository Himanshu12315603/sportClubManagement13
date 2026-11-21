/** Currency / number / date formatting helpers (INR club context). */

export function formatCurrency(value, compact = false) {
  const n = Number(value) || 0;
  if (compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    return `₹${(n / 1000).toFixed(1)}K`;
  }
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value, compact = false) {
  const n = Number(value) || 0;
  if (compact && n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

export function daysBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  return Math.ceil((b - a) / 86400000);
}

export function daysLeft(expiry) {
  if (!expiry) return 0;
  return daysBetween(new Date(), expiry);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toISODate(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function titleCase(value = '') {
  return String(value).replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
