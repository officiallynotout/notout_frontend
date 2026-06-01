import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setAuth, clearAuth, updateUser } from '@/store/slices/authSlice';
import { logoutApi } from '@/api';
import type { AuthTokens, UpdateProfilePayload, User } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth     = useAppSelector((state) => state.auth);

  const login = useCallback(
    (tokens: AuthTokens) => {
      dispatch(
        setAuth({
          user:         tokens.user,
          accessToken:  tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      );
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore — always clear local state
    } finally {
      dispatch(clearAuth());
    }
  }, [dispatch]);

  const patchUser = useCallback(
    (updates: UpdateProfilePayload) => {
      dispatch(updateUser(updates as Partial<User>));
    },
    [dispatch],
  );

  return {
    user:            auth.user,
    isAuthenticated: auth.isAuthenticated,
    login,
    logout,
    patchUser,
  };
};
