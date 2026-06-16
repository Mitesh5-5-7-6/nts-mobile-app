import { useStore } from 'zustand';
import { networkStore } from '../services/offline/network';

export const useNetworkStatus = () => {
  return useStore(networkStore, (state) => state.status);
};

export const useIsOnline = () => {
  return useStore(networkStore, (state) => state.status === 'ONLINE' || state.status === 'RECONNECTING');
};
