import { createStorageHelper } from './index';

const biometricStorage = createStorageHelper('biometric');

const KEYS = {
  ENABLED: 'enabled',
  TIMEOUT_MINUTES: 'timeoutMinutes',
  LAST_BACKGROUND_TIME: 'lastBackgroundTime',
};

export const getIsBiometricEnabled = (): boolean => {
  return biometricStorage.getBoolean(KEYS.ENABLED) ?? false;
};

export const setIsBiometricEnabled = (enabled: boolean) => {
  biometricStorage.set(KEYS.ENABLED, enabled);
};

export const getBiometricTimeoutMinutes = (): number => {
  return biometricStorage.getNumber(KEYS.TIMEOUT_MINUTES) ?? 0; // 0 = Immediately
};

export const setBiometricTimeoutMinutes = (minutes: number) => {
  biometricStorage.set(KEYS.TIMEOUT_MINUTES, minutes);
};

export const getLastBackgroundTime = (): number | null => {
  const time = biometricStorage.getNumber(KEYS.LAST_BACKGROUND_TIME);
  return time ? time : null;
};

export const setLastBackgroundTime = (timestamp: number) => {
  biometricStorage.set(KEYS.LAST_BACKGROUND_TIME, timestamp);
};

export const clearLastBackgroundTime = () => {
  biometricStorage.delete(KEYS.LAST_BACKGROUND_TIME);
};
