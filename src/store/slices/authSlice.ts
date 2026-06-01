import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

export interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user:            null,
  accessToken:     null,
  refreshToken:    null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user            = action.payload.user;
      state.accessToken     = action.payload.accessToken;
      state.refreshToken    = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuth: (state) => {
      state.user            = null;
      state.accessToken     = null;
      state.refreshToken    = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, setCredentials, updateUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
