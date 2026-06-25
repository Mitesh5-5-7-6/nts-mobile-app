import axios from 'axios';

// Base URL is injected from .env via Expo. Only EXPO_PUBLIC_* vars are inlined
// into the app bundle, so the variable MUST keep that prefix.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

if (!API_BASE_URL && __DEV__) {
  // Surface misconfiguration early instead of silently failing every request.
  console.warn(
    '[api] EXPO_PUBLIC_API_URL is not set. Add it to .env, e.g. ' +
      'EXPO_PUBLIC_API_URL=https://neelkanth-tiffin-dashboard.vercel.app/api',
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiClient;
