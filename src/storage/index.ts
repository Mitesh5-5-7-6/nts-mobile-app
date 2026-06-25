import { createMMKV } from 'react-native-mmkv';

/**
 * Global shared MMKV instance.
 * Avoid creating multiple instances unless required for specific encryption needs.
 *
 * NOTE: react-native-mmkv v4 exposes `MMKV` as a type only — instances are
 * created via the `createMMKV()` factory (no `new MMKV()`).
 */
export const storage = createMMKV({
  id: 'tiffin-track-storage',
  // encryptionKey: 'secure-key' // Optional: encrypt the whole storage
});

// Helper for type-safe getters/setters
export const createStorageHelper = (prefix: string) => ({
  set: (key: string, value: string | number | boolean | ArrayBuffer) => {
    storage.set(`${prefix}_${key}`, value);
  },
  getString: (key: string) => storage.getString(`${prefix}_${key}`),
  getNumber: (key: string) => storage.getNumber(`${prefix}_${key}`),
  getBoolean: (key: string) => storage.getBoolean(`${prefix}_${key}`),
  // v4 renamed `delete` -> `remove`; the helper keeps `delete` for callers.
  delete: (key: string) => storage.remove(`${prefix}_${key}`),
  contains: (key: string) => storage.contains(`${prefix}_${key}`),
});
