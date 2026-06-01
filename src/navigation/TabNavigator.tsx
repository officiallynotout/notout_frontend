import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { HomeScreen } from '@/screens/Home/HomeScreen';
import { MyBookingsScreen } from '@/screens/MyBookings/MyBookingsScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';
import { colors, radius, spacing } from '@/constants';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  keyof TabParamList,
  { icon: TabIconName; activeIcon: TabIconName; label: string }
> = {
  Home:       { icon: 'grid-outline',     activeIcon: 'grid',        label: 'Explore'   },
  MyBookings: { icon: 'calendar-outline', activeIcon: 'calendar',    label: 'Bookings'  },
  Profile:    { icon: 'person-outline',   activeIcon: 'person',      label: 'Profile'   },
};

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as keyof TabParamList];
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            { paddingBottom: insets.bottom + spacing[2], height: 64 + insets.bottom },
          ],
          tabBarIcon: ({ focused, size }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? config.activeIcon : config.icon}
                size={22}
                color={focused ? colors.olive.primary : colors.text.tertiary}
              />
              <AppText
                size="xs"
                color={focused ? colors.olive.primary : colors.text.tertiary}
                weight={focused ? 'semiBold' : 'regular'}
                style={styles.label}
              >
                {config.label}
              </AppText>
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home"       component={HomeScreen}       />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen}    />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg.secondary,
    borderTopWidth:  1,
    borderTopColor:  colors.bg.border,
    elevation:       0,
    shadowOpacity:   0,
  },
  iconWrapper: {
    alignItems:  'center',
    gap:          3,
    paddingTop:   6,
  },
  label: { letterSpacing: 0 },
});
