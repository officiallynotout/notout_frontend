import { apiClient } from './client';
import type {
  ApiResponse,
  AdminBooking,
  AdminStats,
  CreateTurfPayload,
  UpdateTurfPayload,
  GenerateSlotsPayload,
  Turf,
  Slot,
} from '@/types';

export const getAdminStatsApi = () =>
  apiClient.get<ApiResponse<AdminStats>>('/bookings/admin/stats');

export const getAllBookingsApi = () =>
  apiClient.get<ApiResponse<AdminBooking[]>>('/bookings/admin/all');

export const getAllTurfsAdminApi = () =>
  apiClient.get<ApiResponse<Turf[]>>('/turfs', { params: { isActive: 'all' } });

export const createTurfApi = (payload: CreateTurfPayload) =>
  apiClient.post<ApiResponse<Turf>>('/turfs', payload);

export const updateTurfApi = (id: string, payload: UpdateTurfPayload) =>
  apiClient.put<ApiResponse<Turf>>(`/turfs/${id}`, payload);

export const deleteTurfApi = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/turfs/${id}`);

export const generateSlotsApi = (payload: GenerateSlotsPayload) =>
  apiClient.post<ApiResponse<Slot[]>>('/slots/generate', payload);
