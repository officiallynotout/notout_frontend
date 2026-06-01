import { apiClient } from './client';
import type { ApiResponse, UpdateProfilePayload, User } from '@/types';

const BASE = '/users';

export const getProfileApi = () =>
  apiClient.get<ApiResponse<User>>(`${BASE}/profile`);

export const updateProfileApi = (payload: UpdateProfilePayload) =>
  apiClient.put<ApiResponse<User>>(`${BASE}/profile`, payload);
