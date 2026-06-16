import apiClient from './client';

export const ReportService = {
  getDailyReport: async (date: string) => {
    const response = await apiClient.get('/reports/daily', { params: { date } });
    return response.data;
  },
  getMonthlyReport: async (month: string, year: string) => {
    const response = await apiClient.get('/reports/monthly', { params: { month, year } });
    return response.data;
  }
};
