import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistConfig } from 'redux-persist';
import type { AuthState } from './slices/authSlice';

export const authPersistConfig: PersistConfig<AuthState> = {
  key:      'auth',
  storage:  AsyncStorage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
};
