import { apiClient } from './client';
import type {
  ApiResponse,
  AuthTokens,
  FirebaseLoginPayload,
  LoginPayload,
  OtpResponse,
  RefreshTokenPayload,
  RegisterPayload,
  User,
  VerifyOtpPayload,
} from '@/types';

const BASE = '/auth';

export const registerApi = (payload: RegisterPayload) =>
  apiClient.post<ApiResponse<OtpResponse>>(`${BASE}/register`, payload);

export const loginApi = (payload: LoginPayload) =>
  apiClient.post<ApiResponse<OtpResponse>>(`${BASE}/login`, payload);

export const verifyOtpApi = (payload: VerifyOtpPayload) =>
  apiClient.post<ApiResponse<AuthTokens>>(`${BASE}/verify-otp`, payload);

export const firebaseLoginApi = (payload: FirebaseLoginPayload) =>
  apiClient.post<ApiResponse<AuthTokens>>(`${BASE}/firebase`, payload);

export const getMeApi = () =>
  apiClient.get<ApiResponse<User>>(`${BASE}/me`);

export const refreshTokenApi = (refreshToken: string) =>
  apiClient.post<ApiResponse<{ accessToken: string }>>(`${BASE}/refresh`, {
    refreshToken,
  } satisfies RefreshTokenPayload);

export const logoutApi = () =>
  apiClient.post<ApiResponse<null>>(`${BASE}/logout`);
