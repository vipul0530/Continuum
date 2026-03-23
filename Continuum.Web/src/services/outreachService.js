import api from './api.js';

export const outreachService = {
  async getHistory(caseId) {
    const { data } = await api.get(`/api/outreach/${caseId}`);
    return data;
  },

  async send(caseId, channel, templateOverride = null) {
    const { data } = await api.post('/api/outreach/send', {
      caseId,
      channel,
      templateOverride,
    });
    return data;
  },
};
