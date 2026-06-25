import { createMMKV, type MMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * MMKV must not be instantiated or accessed on the server. Expo Router
 * prerenders web routes in Node (no `window`), and react-native-mmkv v4 throws
 * "Tried to access storage on the server. Did you forget to call this in
 * useEffect?" the moment an instance is created or read. We therefore use an
 * in-memory fallback on the server and lazily create the real instance on the
 * client (first access happens after hydration, in effects/handlers).
 */
type AppMMKV = Pick<
  MMKV,
  'set' | 'getString' | 'getNumber' | 'getBoolean' | 'remove' | 'contains' | 'clearAll'
>;

function createMemoryStorage(): AppMMKV {
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
  } as AppMMKV;
}

let mmkvInstance: AppMMKV | null = null;

function getAppStorage(): AppMMKV {
  if (mmkvInstance) return mmkvInstance;
  mmkvInstance =
    typeof window === 'undefined'
      ? createMemoryStorage()
      : createMMKV({ id: 'nts-app-storage' });
  return mmkvInstance;
}

// 1. MMKV instance for standard fast synchronous storage (state persistence,
//    user settings). Lazy proxy so importing this module never touches native
//    storage during SSR/prerender.
export const appStorage: AppMMKV = {
  set: (key, value) => getAppStorage().set(key, value),
  getString: (key) => getAppStorage().getString(key),
  getNumber: (key) => getAppStorage().getNumber(key),
  getBoolean: (key) => getAppStorage().getBoolean(key),
  remove: (key) => getAppStorage().remove(key),
  contains: (key) => getAppStorage().contains(key),
  clearAll: () => getAppStorage().clearAll(),
};

// Helper wrapper for mmkv
export const storage = {
  set: (key: string, value: string | number | boolean | ArrayBuffer) => {
    appStorage.set(key, value);
  },
  getString: (key: string) => {
    return appStorage.getString(key);
  },
  getNumber: (key: string) => {
    return appStorage.getNumber(key);
  },
  getBoolean: (key: string) => {
    return appStorage.getBoolean(key);
  },
  delete: (key: string) => {
    appStorage.remove(key);
  },
  clearAll: () => {
    appStorage.clearAll();
  },
};

// 2. Expo Secure Store helper for sensitive credentials (e.g., JWT Auth tokens)
export const secureStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to set secure item:', error);
      throw error;
    }
  },
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Failed to get secure item:', error);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to delete secure item:', error);
    }
  },
};

// 3. Local Authentication (Biometrics) utility
export const biometrics = {
  /**
   * Check if hardware supports biometrics and has enrolled records
   */
  isAvailable: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  /**
   * Perform authentication using FaceID / TouchID / Fingerprint / Passcode
   */
  authenticate: async (promptMessage: string = 'Authenticate to continue'): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  },
};
