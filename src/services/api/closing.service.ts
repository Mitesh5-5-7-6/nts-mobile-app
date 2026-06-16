import apiClient from './client';

export const ClosingService = {
  getDailyClosing: async (date: string) => {
    const response = await apiClient.get('/closing/daily', { params: { date } });
    return response.data;
  },
  submitClosing: async (data: any) => {
    const response = await apiClient.post('/closing', data);
    return response.data;
  }
};
