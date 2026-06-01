import { apiClient } from './client';
import type { ApiResponse, Turf, TurfsQuery } from '@/types';

const BASE = '/turfs';

export const getTurfsApi = (params?: TurfsQuery) =>
  apiClient.get<ApiResponse<Turf[]>>(BASE, { params });

export const getTurfByIdApi = (id: string) =>
  apiClient.get<ApiResponse<Turf>>(`${BASE}/${id}`);
