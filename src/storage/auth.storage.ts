import { createStorageHelper } from './index';
import type { AuthUser } from '../services/api/auth.service';

/**
 * Auth persistence.
 *
 * Per the auth spec the access token lives in MMKV (fast, synchronous). The
 * refresh token is an HTTP-only cookie managed by the networking layer, so it
 * is intentionally NOT stored here — JS cannot read it. Auto-login works by
 * calling /auth/refresh on launch; the cookie is sent automatically.
 */
const authStorage = createStorageHelper('auth');

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
};

export const getAccessToken = () => authStorage.getString(KEYS.ACCESS_TOKEN);
export const setAccessToken = (token: string) => authStorage.set(KEYS.ACCESS_TOKEN, token);
export const removeAccessToken = () => authStorage.delete(KEYS.ACCESS_TOKEN);

export const getStoredUser = (): AuthUser | null => {
  const data = authStorage.getString(KEYS.USER);
  if (!data) return null;
  try {
    return JSON.parse(data) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser) => {
  authStorage.set(KEYS.USER, JSON.stringify(user));
};

export const clearAuthSession = () => {
  authStorage.delete(KEYS.ACCESS_TOKEN);
  authStorage.delete(KEYS.USER);
};
