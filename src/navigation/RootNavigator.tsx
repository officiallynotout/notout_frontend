import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store';
import type { AppStackParamList, AuthStackParamList } from './types';
import { SplashScreen } from '@/screens/Splash/SplashScreen';
import { AuthNavigator }  from './AuthNavigator';
import { AppNavigator }   from './AppNavigator';
import { AdminNavigator } from './AdminNavigator';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack  = createNativeStackNavigator<AppStackParamList>();

export const RootNavigator = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user            = useAppSelector((s) => s.auth.user);
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <AdminNavigator />;
    }
    return <AppNavigator />;
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="PhoneEntry" component={require('@/screens/Auth/PhoneEntryScreen').PhoneEntryScreen} />
      <AuthStack.Screen name="OTPVerify"  component={require('@/screens/Auth/OTPVerifyScreen').OTPVerifyScreen} />
    </AuthStack.Navigator>
  );
};
