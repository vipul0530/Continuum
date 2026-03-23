import api from './api.js';

export const caseService = {
  async getCases(params = {}) {
    const { data } = await api.get('/api/cases', { params });
    return data;
  },

  async getCase(id) {
    const { data } = await api.get(`/api/cases/${id}`);
    return data;
  },

  async importCases(file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/cases/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
