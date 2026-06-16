import { MMKV } from 'react-native-mmkv';

/**
 * Global shared MMKV instance.
 * Avoid creating multiple instances unless required for specific encryption needs.
 */
export const storage = new MMKV({
  id: 'tiffin-track-storage',
  // encryptionKey: 'secure-key' // Optional: encrypt the whole storage
});

// Helper for type-safe getters/setters
export const createStorageHelper = (prefix: string) => ({
  set: (key: string, value: string | number | boolean | Uint8Array) => {
    storage.set(`${prefix}_${key}`, value);
  },
  getString: (key: string) => storage.getString(`${prefix}_${key}`),
  getNumber: (key: string) => storage.getNumber(`${prefix}_${key}`),
  getBoolean: (key: string) => storage.getBoolean(`${prefix}_${key}`),
  delete: (key: string) => storage.delete(`${prefix}_${key}`),
  contains: (key: string) => storage.contains(`${prefix}_${key}`),
});
