import { storage } from './index';

/**
 * Minimal synchronous storage interface expected by TanStack Query's
 * sync-storage persister ({@link https://tanstack.com/query} ).
 * Defined locally because the package does not export this type.
 */
interface SyncStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * MMKV-backed implementation of the persister's storage contract.
 */
export const queryCacheStorage: SyncStorage = {
  setItem: (key: string, value: string) => {
    storage.set(`query_cache_${key}`, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(`query_cache_${key}`);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.remove(`query_cache_${key}`);
  },
};
