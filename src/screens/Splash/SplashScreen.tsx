import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MotiView } from 'moti';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AxiosError } from 'axios';
import { colors } from '@/constants';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCredentials, clearAuth } from '@/store/slices/authSlice';
import { refreshTokenApi } from '@/api/auth.api';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

ExpoSplashScreen.preventAutoHideAsync();

interface Props {
  onDone: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onDone }) => {
  const dispatch = useAppDispatch();
  const accessToken     = useAppSelector((s) => s.auth.accessToken);
  const refreshToken    = useAppSelector((s) => s.auth.refreshToken);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // Keep a ref so the effect closure always calls the latest onDone
  // without needing it as a dependency (which would restart the timer on every re-render)
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    ExpoSplashScreen.hideAsync();

    // Snapshot auth state at mount — we only validate once on cold start
    const _accessToken     = accessToken;
    const _refreshToken    = refreshToken;
    const _isAuthenticated = isAuthenticated;

    const minSplashDelay = new Promise<void>((resolve) => setTimeout(resolve, 2400));

    const validateSession = async () => {
      if (!_isAuthenticated || !_refreshToken) return;

      // Skip refresh if access token is still valid
      if (_accessToken && !isTokenExpired(_accessToken)) return;

      try {
        const result = await refreshTokenApi(_refreshToken);
        dispatch(setCredentials({ accessToken: result.data.data.accessToken }));
      } catch (err) {
        // Only log out on explicit auth rejection — not network/server errors
        const status = (err as AxiosError)?.response?.status;
        if (status === 401) dispatch(clearAuth());
      }
    };

    Promise.all([minSplashDelay, validateSession()]).then(() => onDoneRef.current());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 160, delay: 200 }}
        style={styles.logoMark}
      >
        <Image
          source={require('../../../assets/notout_logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.bg.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoMark: {
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoImage: {
    width:           140,
    height:          140,
  },
});
