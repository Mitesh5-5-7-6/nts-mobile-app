import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import apiClient from './client';
import { useAuthStore } from '../../store/auth.store';
import { AuthService } from './auth.service';
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

      // Never try to refresh the refresh call itself (avoids an infinite loop).
      const isRefreshCall = originalRequest?.url?.includes('/mobile/auth/refresh');

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isRefreshCall
      ) {
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
          // The refresh token is an HTTP-only cookie sent automatically; no
          // token is passed in the body.
          const { accessToken } = await AuthService.refresh();

          useAuthStore.getState().setAccessToken(accessToken);

          processQueue(null, accessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Refresh failed (cookie missing/expired). Log the user out.
          await useAuthStore.getState().logout();
          return Promise.reject(handleApiError(refreshError));
        }
      }

      return Promise.reject(apiError);
    }
  );
};
