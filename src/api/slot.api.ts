import { apiClient } from './client';
import type { ApiResponse, LockSlotPayload, LockSlotResponse, Slot, SlotsQuery } from '@/types';

const BASE = '/slots';

export const getSlotsApi = (params: SlotsQuery) =>
  apiClient.get<ApiResponse<Slot[]>>(BASE, { params });

export const lockSlotApi = (payload: LockSlotPayload) =>
  apiClient.post<ApiResponse<LockSlotResponse>>(`${BASE}/lock`, payload);

export const releaseSlotApi = (slotId: string) =>
  apiClient.delete<ApiResponse<null>>(`${BASE}/${slotId}/release`);
