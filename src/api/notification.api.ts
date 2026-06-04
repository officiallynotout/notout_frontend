import { apiClient } from './client';
import type { ApiResponse } from '@/types';

const BASE = '/notifications';

export const registerPushTokenApi = (token: string) =>
  apiClient.post<ApiResponse<null>>(`${BASE}/register-token`, { token });

export const removePushTokenApi = () =>
  apiClient.delete<ApiResponse<null>>(`${BASE}/register-token`);
