import { create } from "zustand";
import { AuthService, type AuthUser } from "../services/api/auth.service";
import { logger } from "../services/monitoring/logger";
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "../storage/auth.storage";

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

    if (cachedToken && cachedUser) {
      set({
        isAuthenticated: true,
        user: cachedUser,
        accessToken: cachedToken,
      });
    }

    try {
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
      logger.debug("Auto-login refresh failed", error);

      // Only clear state if we weren't already authenticated by a fresh login
      // that happened in parallel. Otherwise just mark hydration complete.
      const current = get();
      if (!current.isAuthenticated) {
        clearAuthSession();
        set({
          user: null,
          accessToken: null,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    }
  },
}));
