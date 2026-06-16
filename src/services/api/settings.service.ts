import apiClient from './client';

export const SettingsService = {
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  }
};
