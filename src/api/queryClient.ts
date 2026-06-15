import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { appStorage } from '../utils/storage';

// 1. Create a query client with custom default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set garbage collection (cache) time to 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Refetch on mount/reconnect only if stale
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 2,
    },
  },
});

// 2. Create synchronous storage persister using MMKV
export const clientPersister = createSyncStoragePersister({
  storage: {
    setItem: (key, value) => {
      appStorage.set(key, value);
    },
    getItem: (key) => {
      const value = appStorage.getString(key);
      return value === undefined ? null : value;
    },
    removeItem: (key) => {
      appStorage.remove(key);
    },
  },
});
export type QueryClientType = typeof queryClient;
