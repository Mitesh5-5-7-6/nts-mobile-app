import { create } from 'zustand';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getSessionMetadata,
  setSessionMetadata,
  clearAuthSession,
} from '../storage/auth.storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Actions
  login: (data: { user: User; accessToken: string; refreshToken: string; expiresAt: string }) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isHydrated: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  login: ({ user, accessToken, refreshToken, expiresAt }) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setSessionMetadata({ user, expiresAt });

    set({
      isAuthenticated: true,
      user,
      accessToken,
      refreshToken,
    });
  },

  logout: () => {
    clearAuthSession();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  updateTokens: (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    set((state) => ({
      accessToken,
      refreshToken: refreshToken || state.refreshToken,
    }));
  },

  hydrate: () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const sessionMeta = getSessionMetadata<{ user: User; expiresAt: string }>();

    if (accessToken && refreshToken && sessionMeta?.user) {
      set({
        isAuthenticated: true,
        user: sessionMeta.user,
        accessToken,
        refreshToken,
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true, isAuthenticated: false });
    }
  },
}));
