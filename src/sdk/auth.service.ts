import { apiClient, unwrap } from './client';
import './interceptors';
import type { LoginRequest, LoginResponse, ApiResponseEnvelope } from '../types/api';

class AuthService {
  /**
   * Authenticate using email + password.
   * POST /api/auth/[...nextauth]
   *
   * Uses NextAuth credentials provider. On success, a JWT is issued
   * as an HTTP-only cookie (no manual token storage needed for web-based flow).
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponseEnvelope<LoginResponse>>(
      '/auth/callback/credentials',
      {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
        callbackUrl: '/',
        json: true,
      }
    );
    return unwrap(response.data);
  }

  /**
   * Sign out the current session.
   * POST /api/auth/signout
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/signout', { callbackUrl: '/' });
  }

  /**
   * Fetch the current session / user.
   * GET /api/auth/session
   */
  async getSession(): Promise<LoginResponse | null> {
    const response = await apiClient.get<ApiResponseEnvelope<LoginResponse>>('/auth/session');
    return unwrap(response.data);
  }
}

export const authService = new AuthService();
