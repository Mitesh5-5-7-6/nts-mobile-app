import { createMMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// 1. MMKV Instance for standard fast synchronous storage (e.g., state persistence, user settings)
export const appStorage = createMMKV({
  id: 'nts-app-storage',
});

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
