import api from './api.js';

export const sarService = {
  async getForm(token) {
    const { data } = await api.get(`/sar/${token}`);
    return data;
  },

  async submit(token, formData) {
    const { data } = await api.post(`/sar/${token}/submit`, formData);
    return data;
  },
};
