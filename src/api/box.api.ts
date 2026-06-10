import { apiClient } from './client';
import type { ApiResponse, Box } from '@/types';

export const getBoxesApi = (turfId: string) =>
  apiClient.get<ApiResponse<Box[]>>(`/turfs/${turfId}/boxes`);
