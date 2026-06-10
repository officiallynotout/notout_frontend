import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store';
import type { CricketMatch } from '@/types';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_BASE_URL
  ? process.env.EXPO_PUBLIC_API_BASE_URL.replace('/mobile/v1', '')
  : 'http://10.0.2.2:3000';

interface UseCricketSocketOptions {
  matchId?:   string;
  shareCode?: string;
  enabled:    boolean;
}

export const useCricketSocket = ({ matchId, shareCode, enabled }: UseCricketSocketOptions) => {
  const token      = useAppSelector((s) => s.auth.accessToken);
  const socketRef  = useRef<Socket | null>(null);
  const [liveData, setLiveData] = useState<CricketMatch | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !token) return;

    const socket = io(SOCKET_URL, {
      auth:            { token },
      transports:      ['websocket'],
      reconnection:    true,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      socket.emit('join:match', matchId ? { matchId } : { shareCode });
    });

    socket.on('match:joined', () => {
      // successfully joined room
    });

    socket.on('match:update', (data: CricketMatch) => {
      setLiveData(data);
    });

    socket.on('match:error', ({ message }: { message: string }) => {
      setError(message);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => {
      setConnected(false);
      setError('Connection failed');
    });

    return () => {
      if (matchId) socket.emit('leave:match', { matchId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, token, matchId, shareCode]);

  return { liveData, connected, error };
};
