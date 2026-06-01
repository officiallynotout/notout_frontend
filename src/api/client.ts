import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { Store } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { setCredentials, clearAuth } from '@/store/slices/authSlice';
import { refreshTokenApi } from './auth.api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:3000/mobile/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true', // skips localtunnel browser confirmation page
  },
});

let storeRef: Store<RootState> | null = null;

export const injectStore = (store: Store<RootState>) => {
  storeRef = store;
};

// Attach Bearer token from Redux store to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storeRef?.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 → refresh token → retry
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = storeRef?.getState().auth.refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const result = await refreshTokenApi(refreshToken);
      const newAccessToken = result.data.data.accessToken;

      storeRef?.dispatch(setCredentials({ accessToken: newAccessToken }));
      apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      storeRef?.dispatch(clearAuth());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
