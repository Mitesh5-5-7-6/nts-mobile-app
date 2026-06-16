import { storage } from './index';
import type { Storage } from '@tanstack/query-sync-storage-persister';

/**
 * MMKV implementation of the Storage interface required by TanStack Query Sync Storage Persister.
 */
export const queryCacheStorage: Storage = {
  setItem: (key, value) => {
    storage.set(`query_cache_${key}`, value);
  },
  getItem: (key) => {
    const value = storage.getString(`query_cache_${key}`);
    return value === undefined ? null : value;
  },
  removeItem: (key) => {
    storage.delete(`query_cache_${key}`);
  },
};
