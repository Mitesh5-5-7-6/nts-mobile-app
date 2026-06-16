import apiClient from './client';

export const ExpenseService = {
  getAll: async () => {
    const response = await apiClient.get('/expenses');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/expenses', data);
    return response.data;
  }
};
