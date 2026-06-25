import { createMMKV, type MMKV } from 'react-native-mmkv';

/**
 * MMKV cannot be instantiated or accessed on the server. Expo Router
 * server-renders (prerenders) web routes in a Node environment where
 * `window` is undefined, and react-native-mmkv v4 throws
 * "Tried to access storage on the server. Did you forget to call this in
 * useEffect?" the moment an instance is created or read.
 *
 * To keep module load side-effect free on the server we:
 *   1. Detect a non-browser environment and use an in-memory fallback.
 *   2. Otherwise lazily create the real MMKV instance on first access
 *      (which on web happens after hydration, inside effects/handlers).
 */
const isServer = typeof window === 'undefined';

/**
 * Minimal subset of the MMKV API the app relies on. Used to type both the
 * real instance and the in-memory fallback.
 */
type AppStorage = Pick<
  MMKV,
  'set' | 'getString' | 'getNumber' | 'getBoolean' | 'remove' | 'contains' | 'clearAll'
>;

/**
 * In-memory, server-safe stand-in for MMKV. Values do not persist; it only
 * exists so SSR/prerender does not crash. Real reads/writes happen on the
 * client against the lazily-created MMKV instance below.
 */
function createMemoryStorage(): AppStorage {
  const map = new Map<string, string | number | boolean | ArrayBuffer>();
  return {
    set: (key, value) => {
      map.set(key, value);
    },
    getString: (key) => {
      const v = map.get(key);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber: (key) => {
      const v = map.get(key);
      return typeof v === 'number' ? v : undefined;
    },
    getBoolean: (key) => {
      const v = map.get(key);
      return typeof v === 'boolean' ? v : undefined;
    },
    remove: (key) => map.delete(key),
    contains: (key) => map.has(key),
    clearAll: () => {
      map.clear();
    },
  } as AppStorage;
}

let instance: AppStorage | null = null;

/**
 * Returns the storage backend, creating it lazily on first use.
 * On the server this is always the in-memory fallback; on the client it is
 * a real MMKV instance created on demand.
 */
function getStorage(): AppStorage {
  if (instance) return instance;
  instance = isServer
    ? createMemoryStorage()
    : createMMKV({
        id: 'tiffin-track-storage',
        // encryptionKey: 'secure-key' // Optional: encrypt the whole storage
      });
  return instance;
}

/**
 * Global shared storage instance.
 *
 * This is a lazy proxy: methods are only invoked against the underlying
 * backend when called, so importing this module never touches native
 * storage. Use the same `MMKV`-style API as before.
 */
export const storage: AppStorage = {
  set: (key, value) => getStorage().set(key, value),
  getString: (key) => getStorage().getString(key),
  getNumber: (key) => getStorage().getNumber(key),
  getBoolean: (key) => getStorage().getBoolean(key),
  remove: (key) => getStorage().remove(key),
  contains: (key) => getStorage().contains(key),
  clearAll: () => getStorage().clearAll(),
};

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
