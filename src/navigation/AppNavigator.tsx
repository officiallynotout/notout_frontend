import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { TurfDetailScreen }    from '@/screens/TurfDetail/TurfDetailScreen';
import { DateSlotScreen }      from '@/screens/Booking/DateSlotScreen';
import { SlotLockScreen }      from '@/screens/Booking/SlotLockScreen';
import { BookingConfirmScreen } from '@/screens/Booking/BookingConfirmScreen';
import { BookingSuccessScreen } from '@/screens/Booking/BookingSuccessScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs"           component={TabNavigator}          options={{ animation: 'fade' }} />
    <Stack.Screen name="TurfDetail"     component={TurfDetailScreen}      options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="DateSlot"       component={DateSlotScreen}        options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="SlotLock"       component={SlotLockScreen}        options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen}  options={{ animation: 'slide_from_right' }} />
    <Stack.Screen
      name="BookingSuccess"
      component={BookingSuccessScreen}
      options={{ animation: 'fade', gestureEnabled: false }}
    />
  </Stack.Navigator>
);
