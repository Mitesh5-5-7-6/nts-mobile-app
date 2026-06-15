import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { secureStorage } from '../utils/storage';
import { ApiError, handleApiError } from '../lib/api-error';

// Token storage keys
export const TOKEN_KEYS = {
  accessToken: 'nts_access_token',
  user: 'nts_user',
} as const;

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Inject Authorization header from SecureStore if a token exists.
// NextAuth uses HTTP-only cookies, so this is a no-op for cookie-based sessions
// but kept here for future JWT header support.
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getItem(TOKEN_KEYS.accessToken);
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // Non-fatal — continue without token
    }
    return config;
  },
  (error: unknown) => Promise.reject(handleApiError(error))
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 1. On success, pass through (envelope unwrapping is done in each service).
// 2. On 401, clear stored tokens (logout).
// 3. On every error, convert to a standard ApiError.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear any stored credentials on auth failure
      await Promise.allSettled([
        secureStorage.removeItem(TOKEN_KEYS.accessToken),
        secureStorage.removeItem(TOKEN_KEYS.user),
      ]);
    }

    const standardError = handleApiError(error);
    return Promise.reject(
      new ApiError(standardError.message, standardError.code, standardError.details)
    );
  }
);

export { apiClient };
