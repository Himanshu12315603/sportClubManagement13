/** Tiny localStorage helpers — safe in SSR / private mode. */

export function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearStore(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
