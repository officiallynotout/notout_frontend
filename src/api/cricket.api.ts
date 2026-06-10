import { apiClient } from './client';
import type {
  CreateMatchPayload,
  LogBallPayload,
} from '@/types';

const BASE = '/cricket/matches';

export const createMatchApi = (data: CreateMatchPayload) =>
  apiClient.post(BASE, data);

export const listMatchesApi = (params?: { page?: number; limit?: number }) =>
  apiClient.get(BASE, { params });

export const getMatchApi = (matchId: string) =>
  apiClient.get(`${BASE}/${matchId}`);

export const getMatchByCodeApi = (code: string) =>
  apiClient.get(`${BASE}/code/${code}`);

export const startMatchApi = (
  matchId: string,
  data: { opener1: string; opener2: string; bowler: string },
) => apiClient.post(`${BASE}/${matchId}/start`, data);

export const logBallApi = (matchId: string, data: LogBallPayload) =>
  apiClient.post(`${BASE}/${matchId}/ball`, data);

export const setNextBatsmanApi = (
  matchId: string,
  data: { playerName: string; isOnStrike: boolean },
) => apiClient.post(`${BASE}/${matchId}/next-batsman`, data);

export const setNextBowlerApi = (matchId: string, data: { bowlerName: string }) =>
  apiClient.post(`${BASE}/${matchId}/next-bowler`, data);

export const startInnings2Api = (
  matchId: string,
  data: { opener1: string; opener2: string; bowler: string },
) => apiClient.post(`${BASE}/${matchId}/start-innings2`, data);

export const completeMatchApi = (matchId: string) =>
  apiClient.post(`${BASE}/${matchId}/complete`);
