import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import apiClient from './client';
import { useAuthStore } from '../../store/auth.store';
import { handleApiError } from '../../lib/api-error';

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(handleApiError(error));
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Standardize error format
      const apiError = handleApiError(error);

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          try {
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Directly use axios to avoid interceptor loops
          const { data } = await apiClient.post('/auth/refresh', { refreshToken }, {
            // Avoid interceptor logic for this specific call if needed, or rely on normal base client
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken || refreshToken; // In case they do rotation
          
          useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

          processQueue(null, newAccessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Refresh token failed. Logout.
          useAuthStore.getState().logout();
          return Promise.reject(handleApiError(refreshError));
        }
      }

      return Promise.reject(apiError);
    }
  );
};
