import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { AdminDashboardScreen } from '@/screens/Admin/AdminDashboardScreen';
import { AdminTurfsScreen }     from '@/screens/Admin/AdminTurfsScreen';
import { AdminSlotGenerateScreen } from '@/screens/Admin/AdminSlotGenerateScreen';
import { AdminBookingsScreen }  from '@/screens/Admin/AdminBookingsScreen';
import { colors, radius, spacing } from '@/constants';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  keyof AdminTabParamList,
  { icon: TabIconName; activeIcon: TabIconName; label: string }
> = {
  AdminDashboard: { icon: 'stats-chart-outline', activeIcon: 'stats-chart',  label: 'Dashboard' },
  AdminTurfs:     { icon: 'location-outline',    activeIcon: 'location',     label: 'Turfs'     },
  AdminSlots:     { icon: 'calendar-outline',    activeIcon: 'calendar',     label: 'Slots'     },
  AdminBookings:  { icon: 'receipt-outline',     activeIcon: 'receipt',      label: 'Bookings'  },
};

export const AdminTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as keyof AdminTabParamList];
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            { paddingBottom: insets.bottom + spacing[2], height: 64 + insets.bottom },
          ],
          tabBarIcon: ({ focused }) => (
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
                numberOfLines={1}
              >
                {config.label}
              </AppText>
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="AdminTurfs"     component={AdminTurfsScreen}     />
      <Tab.Screen name="AdminSlots"     component={AdminSlotGenerateScreen} />
      <Tab.Screen name="AdminBookings"  component={AdminBookingsScreen}  />
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
    alignItems: 'center',
    gap:         3,
    paddingTop:  12,
    minWidth:    56,
  },
  label: { letterSpacing: 0 },
});
