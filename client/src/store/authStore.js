import { create } from 'zustand';
import { authAPI } from '../api/services';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const { data } = await authAPI.getMe();
      set({ user: data });
    } catch {
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
