import { apiClient } from './client';
import type { ApiResponse, Booking, CreateBookingPayload } from '@/types';

const BASE = '/bookings';

export const createBookingApi = (payload: CreateBookingPayload) =>
  apiClient.post<ApiResponse<Booking>>(BASE, payload);

export const getMyBookingsApi = () =>
  apiClient.get<ApiResponse<Booking[]>>(BASE);

export const getBookingByIdApi = (id: string) =>
  apiClient.get<ApiResponse<Booking>>(`${BASE}/${id}`);

export const cancelBookingApi = (id: string) =>
  apiClient.delete<ApiResponse<Booking>>(`${BASE}/${id}/cancel`);
