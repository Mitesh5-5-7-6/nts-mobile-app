import { create } from 'zustand';
import {
  getAccessToken,
  setAccessToken,
  getStoredUser,
  setStoredUser,
  clearAuthSession,
} from '../storage/auth.storage';
import { AuthService, type AuthUser } from '../services/api/auth.service';
import { logger } from '../services/monitoring/logger';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;

  // Actions
  login: (data: { user: AuthUser; accessToken: string }) => void;
  logout: () => Promise<void>;
  /** Persist a freshly minted access token (called by the refresh interceptor). */
  setAccessToken: (accessToken: string) => void;
  /**
   * Auto-login on launch: read the cached session for instant UI, then exchange
   * the HTTP-only refresh cookie for a new access token. Logs out if the cookie
   * is missing/expired.
   */
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  accessToken: null,

  login: ({ user, accessToken }) => {
    setAccessToken(accessToken);
    setStoredUser(user);

    set({
      isAuthenticated: true,
      user,
      accessToken,
    });
  },

  logout: async () => {
    await AuthService.logout();
    clearAuthSession();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
    });
  },

  setAccessToken: (accessToken) => {
    setAccessToken(accessToken);
    set({ accessToken });
  },

  hydrate: async () => {
    const cachedToken = getAccessToken();
    const cachedUser = getStoredUser();

    // Optimistically restore the cached session so the UI does not flash login
    // while the refresh call is in flight.
    if (cachedToken && cachedUser) {
      set({ isAuthenticated: true, user: cachedUser, accessToken: cachedToken });
    }

    try {
      // Auto-login: the refresh cookie is sent automatically (withCredentials).
      const { accessToken, user } = await AuthService.refresh();
      setAccessToken(accessToken);
      setStoredUser(user);
      set({
        isAuthenticated: true,
        user,
        accessToken,
        isHydrated: true,
      });
    } catch (error) {
      // No valid refresh cookie -> session cannot be continued. Require login.
      logger.debug('Auto-login refresh failed; clearing session', error);
      clearAuthSession();
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        isHydrated: true,
      });
    }
  },
}));
