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

  getMyActivities: (limit = 50) => request(`/api/v1/activities/my?limit=${limit}`),

  listNotifications: () => request('/api/v1/notifications'),

  markNotificationReadById: (id) =>
    request(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsReadApi: () =>
    request('/api/v1/notifications/read-all', { method: 'POST' }),

  getAllActivities: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    return request(`/api/v1/activities/all?${params.toString()}`);
  },

  listMembers: (page = 1) => request(`/api/v1/members?page=${page}&limit=100`),

  createMemberDirect: (payload) =>
    request('/api/v1/members/direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMemberById: (id, payload) =>
    request(`/api/v1/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  renewMemberById: (id, payload) =>
    request(`/api/v1/members/${id}/renew`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyMembership: () => request('/api/v1/members/my-membership'),

  getPlans: () => request('/api/v1/members/plans'),

  getAllPlans: () => request('/api/v1/members/plans?all=true'),

  updatePlanById: (id, payload) =>
    request(`/api/v1/members/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  subscribeMembership: (planId, paymentMethod = 'card') =>
    request('/api/v1/members/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    }),

  listTrials: () => request('/api/v1/trials?limit=100'),

  updateTrialStatus: (id, status) =>
    request(`/api/v1/trials/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  listEnquiries: () => request('/api/v1/enquiries?limit=100'),

  updateEnquiryById: (id, payload) =>
    request(`/api/v1/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  listEmployees: () => request('/api/v1/employees?limit=100'),

  createEmployee: (payload) =>
    request('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateEmployeeById: (id, payload) =>
    request(`/api/v1/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  listLeaveRequests: () => request('/api/v1/employees/leave/all'),

  processLeaveById: (id, status) =>
    request(`/api/v1/employees/leave/${id}/process`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  listCafeOrders: () => request('/api/v1/cafe/orders?limit=100'),

  createCafeOrder: (payload) =>
    request('/api/v1/cafe/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyCafeOrders: () => request('/api/v1/cafe/orders/my'),

  updateCafeOrderStatus: (id, status) =>
    request(`/api/v1/cafe/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getCafeTables: () => request('/api/v1/cafe/tables'),

  updateMenuItemById: (id, payload) =>
    request(`/api/v1/cafe/menu/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getFinanceSummary: (period = 'month') => request(`/api/v1/finance/summary?period=${period}`),

  getFinanceTransactions: () => request('/api/v1/finance/transactions?limit=100'),

  getFinanceExpenses: () => request('/api/v1/finance/expenses?limit=100'),

  listBookings: () => request('/api/v1/bookings'),

  getMyBookings: () => request('/api/v1/bookings/my'),

  createBooking: (payload) =>
    request('/api/v1/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelBooking: (id, reason = 'Cancelled by member') =>
    request(`/api/v1/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  updateBookingStatusById: (id, status) =>
    request(`/api/v1/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  placeOrder: (payload) =>
    request('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyOrders: () => request('/api/v1/orders/my'),

  getAllOrders: () => request('/api/v1/orders'),

  updateOrderStatus: (id, status) =>
    request(`/api/v1/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  createProduct: (payload) =>
    request('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProductById: (id, payload) =>
    request(`/api/v1/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getCategories: () => request('/api/v1/categories'),

  createCategory: (payload) =>
    request('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createPaymentOrder: (payload) =>
    request('/api/v1/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyPayments: () => request('/api/v1/payments/my'),

  verifyPayment: (payload) =>
    request('/api/v1/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelPayment: (payload) =>
    request('/api/v1/payments/cancel', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCourts: () => request('/api/v1/courts'),

  listProducts: () => request('/api/v1/products?limit=100'),

  getCafeMenu: () => request('/api/v1/cafe/menu'),

  registerTrial: (payload) =>
    request('/api/v1/trials/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default api;
