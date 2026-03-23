import api from './api.js';

export const reportService = {
  async getSummary(countyId) {
    const { data } = await api.get('/api/reports/summary', {
      params: countyId ? { countyId } : {},
    });
    return data;
  },
};
