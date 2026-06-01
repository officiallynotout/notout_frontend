import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import authReducer, { type AuthState } from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import { authPersistConfig } from './persistConfig';

const rootReducer = combineReducers({
  auth:    persistReducer<AuthState>(authPersistConfig, authReducer),
  booking: bookingReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState   = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch              = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
