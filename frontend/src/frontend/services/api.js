/**
 * Front-end service layer.
 *
 * Every function below returns a Promise so the UI already behaves like it is
 * talking to a network. When the Express backend is connected, swap the mock
 * bodies for `request()` calls — the shape of the returned data stays the same.
 *
 * The backend currently exposes only `GET /` (see backend/src/server.ts), so all
 * endpoints here are clearly marked as pending integration.
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000';

const MOCK_LATENCY = 320;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY));
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  /** INTEGRATION REQUIRED: backend `GET /api/health` does not exist yet. */
  health: () => delay({ status: 'ok', source: 'mock', baseUrl: API_BASE_URL }),

  /** INTEGRATION REQUIRED: `POST /api/auth/login` */
  login: (email, password) =>
    delay({ token: `demo-token-${Date.now()}`, email, password: password ? 'accepted' : 'missing' }),

  /** INTEGRATION REQUIRED: `GET /api/members` */
  listMembers: () => delay([]),

  /** INTEGRATION REQUIRED: `GET /api/bookings?userId=` */
  listBookings: () => delay([]),

  /** INTEGRATION REQUIRED: `POST /api/bookings` */
  createBooking: (payload) => delay({ ...payload, id: `BK-${Date.now()}` }),

  /** INTEGRATION REQUIRED: `GET /api/products` */
  listProducts: () => delay([]),
};

export const integrationNotes = [
  'Auth: replace demoAccounts lookup with POST /api/auth/login and persist the JWT.',
  'Bookings: move the rule engine in data/courts.js to the server so double-booking is enforced atomically.',
  'Payments: no gateway is connected — checkout only records a mock transaction.',
  'AI: ClubBloom AI runs fully offline in the browser; wire it to your model endpoint when ready.',
];

export default api;
