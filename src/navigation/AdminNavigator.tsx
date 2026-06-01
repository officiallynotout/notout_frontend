import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AdminStackParamList } from './types';
import { AdminTabNavigator }   from './AdminTabNavigator';
import { AdminTurfFormScreen } from '@/screens/Admin/AdminTurfFormScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs"     component={AdminTabNavigator}   options={{ animation: 'fade' }} />
    <Stack.Screen name="AdminTurfForm" component={AdminTurfFormScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator>
);
