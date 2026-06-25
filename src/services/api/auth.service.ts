import apiClient from './client';
import type { ApiResponse } from '../../types/api.types';
import { ApiError } from '../../lib/api-error';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Shape of the `data` field returned by `/auth/login` and `/auth/refresh`.
 *
 * NOTE: The refresh token is delivered as an HTTP-only cookie and is never
 * present in the JSON body — the client cannot read it. Only the short-lived
 * (`expiresIn` seconds) access token and the user are returned here.
 */
export interface AuthPayload {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export const AuthService = {
  /**
   * Email + password login. On success the backend also sets an HTTP-only
   * refresh-token cookie (sent automatically on subsequent requests because
   * the client is configured with `withCredentials`).
   */
  login: async (email: string, password: string): Promise<AuthPayload> => {
    const response = await apiClient.post<ApiResponse<AuthPayload>>('/mobile/auth/login', {
      email,
      password,
    });
    const payload = response.data?.data;
    // Guard against an empty/204 body (e.g. hitting a cookie-only auth route):
    // fail loudly instead of silently leaving the user unauthenticated.
    if (!payload?.accessToken) {
      throw new ApiError(
        'Login did not return an access token.',
        'INVALID_LOGIN_RESPONSE',
      );
    }
    return payload;
  },

  /**
   * Exchange the HTTP-only refresh cookie for a fresh access token.
   * No token is sent in the body — the cookie carries the refresh credential.
   */
  refresh: async (): Promise<AuthPayload> => {
    const response = await apiClient.post<ApiResponse<AuthPayload>>('/mobile/auth/refresh', {});
    return response.data.data;
  },

  /**
   * Invalidate the session server-side (clears the refresh cookie). Best-effort.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/mobile/auth/logout', {});
    } catch {
      // Ignore network/logout errors — local session is cleared regardless.
    }
  },
};
