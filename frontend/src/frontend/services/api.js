/**
 * Front-end service layer - Connected to backend API
 */

export const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000');

export const integrationNotes = [
  'Connected to Champions Club REST API at /api/v1',
  'All authentication tokens stored via secure HTTP cookies and bearer tokens',
  'Real-time operations synchronized with MongoDB',
];

async function request(path, options = {}) {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  health: () => request('/api/v1/health'),

  login: (email, password) =>
    request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, phone, password) =>
    request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, role: 'member' }),
    }),

  logout: () =>
    request('/api/v1/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/api/v1/auth/me'),

  getAllUsers: () => request('/api/v1/auth/users'),

  listMembers: () => request('/api/v1/members'),

  getMyMembership: () => request('/api/v1/members/my-membership'),

  getPlans: () => request('/api/v1/members/plans'),

  subscribeMembership: (planId, paymentMethod = 'card') =>
    request('/api/v1/members/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    }),

  listBookings: () => request('/api/v1/bookings'),

  getMyBookings: () => request('/api/v1/bookings/my-bookings'),

  createBooking: (payload) =>
    request('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCourts: () => request('/api/v1/courts'),

  listProducts: () => request('/api/v1/products'),

  getCafeMenu: () => request('/api/v1/cafe/menu'),

  registerTrial: (payload) =>
    request('/api/v1/trials/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default api;
