import apiClient from './client';

export const PaymentService = {
  getAll: async () => {
    const response = await apiClient.get('/payments');
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post('/payments', data);
    return response.data;
  }
};
