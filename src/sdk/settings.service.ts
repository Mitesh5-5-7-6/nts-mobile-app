import type { ApiResponseEnvelope, LoginResponse } from '../types/api';
import { apiClient, unwrap } from './client';
import './interceptors';

/**
 * SettingsService
 *
 * The API_DOCUMENTATION.md does not define a dedicated /settings endpoint.
 * This service exposes user-session and profile data retrieved from the
 * NextAuth session endpoint. Extend this service when backend settings
 * endpoints are added to API_DOCUMENTATION.md.
 */
class SettingsService {
  /**
   * Fetch the authenticated user's session / profile data.
   * GET /api/auth/session
   */
  async getUserProfile(): Promise<LoginResponse | null> {
    try {
      const response = await apiClient.get<ApiResponseEnvelope<LoginResponse>>('/auth/session');
      return unwrap(response.data);
    } catch {
      return null;
    }
  }
}

export const settingsService = new SettingsService();
