import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { createStore } from 'zustand/vanilla';
import { SyncQueueService } from './syncQueue';

export type NetworkStatus = 'ONLINE' | 'OFFLINE' | 'RECONNECTING';

interface NetworkState {
  status: NetworkStatus;
  isConnected: boolean;
  isInternetReachable: boolean | null;
  setStatus: (status: NetworkStatus) => void;
  updateFromNetInfo: (state: NetInfoState) => void;
}

export const networkStore = createStore<NetworkState>((set) => ({
  status: 'ONLINE',
  isConnected: true,
  isInternetReachable: true,
  setStatus: (status) => set({ status }),
  updateFromNetInfo: (state) => {
    const isOnline = state.isConnected && state.isInternetReachable !== false;
    set((prev) => {
      let newStatus: NetworkStatus = isOnline ? 'ONLINE' : 'OFFLINE';
      
      // Basic heuristic for reconnecting state
      if (prev.status === 'OFFLINE' && isOnline) {
         newStatus = 'RECONNECTING';
         // Flush any queued offline mutations now that connectivity is back.
         void SyncQueueService.sync();
         // Switch back to ONLINE after a short settle delay.
         setTimeout(() => {
           networkStore.getState().setStatus('ONLINE');
         }, 3000);
      }

      return {
        isConnected: !!state.isConnected,
        isInternetReachable: state.isInternetReachable,
        status: newStatus,
      };
    });
  },
}));

let unsubscribeNetInfo: (() => void) | null = null;

export const NetworkService = {
  initialize: () => {
    if (unsubscribeNetInfo) return;
    
    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      networkStore.getState().updateFromNetInfo(state);
    });
  },

  teardown: () => {
    if (unsubscribeNetInfo) {
      unsubscribeNetInfo();
      unsubscribeNetInfo = null;
    }
  },

  isOnline: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return !!(state.isConnected && state.isInternetReachable !== false);
  }
};
