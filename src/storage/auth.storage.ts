import { createStorageHelper } from './index';

const authStorage = createStorageHelper('auth');

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_METADATA: 'sessionMetadata', // Stores user info, expiresAt, etc.
};

export const getAccessToken = () => authStorage.getString(KEYS.ACCESS_TOKEN);
export const setAccessToken = (token: string) => authStorage.set(KEYS.ACCESS_TOKEN, token);
export const removeAccessToken = () => authStorage.delete(KEYS.ACCESS_TOKEN);

export const getRefreshToken = () => authStorage.getString(KEYS.REFRESH_TOKEN);
export const setRefreshToken = (token: string) => authStorage.set(KEYS.REFRESH_TOKEN, token);
export const removeRefreshToken = () => authStorage.delete(KEYS.REFRESH_TOKEN);

export const getSessionMetadata = <T>(): T | null => {
  const data = authStorage.getString(KEYS.SESSION_METADATA);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

export const setSessionMetadata = <T>(metadata: T) => {
  authStorage.set(KEYS.SESSION_METADATA, JSON.stringify(metadata));
};

export const clearAuthSession = () => {
  authStorage.delete(KEYS.ACCESS_TOKEN);
  authStorage.delete(KEYS.REFRESH_TOKEN);
  authStorage.delete(KEYS.SESSION_METADATA);
};
