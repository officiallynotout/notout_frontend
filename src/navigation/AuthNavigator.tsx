import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { PhoneEntryScreen } from '@/screens/Auth/PhoneEntryScreen';
import { OTPVerifyScreen } from '@/screens/Auth/OTPVerifyScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
    <Stack.Screen name="OTPVerify"  component={OTPVerifyScreen}  />
  </Stack.Navigator>
);
