import api from './api.js';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  async getMe() {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};
