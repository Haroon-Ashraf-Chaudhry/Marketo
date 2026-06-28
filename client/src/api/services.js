import api from './axios';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  getMyProducts: () => api.get('/products/vendor/me'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getVendorOrders: () => api.get('/orders/vendor'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  raiseDispute: (id, reason) => api.post(`/orders/${id}/dispute`, { reason }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  resolveDispute: (id, data) => api.patch(`/admin/orders/${id}/dispute`, data),
  getVendorStats: () => api.get('/admin/vendor-stats'),
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatAPI = {
  getOrCreateConversation: (data) => api.post('/chat/conversations', data),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (convId) => api.get(`/chat/conversations/${convId}/messages`),
  sendMessage: (convId, text) => api.post(`/chat/conversations/${convId}/messages`, { text }),
};
