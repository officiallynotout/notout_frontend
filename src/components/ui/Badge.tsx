import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/constants';
import type { BookingStatus, SlotStatus } from '@/types';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'olive';

interface BadgeProps {
  label:     string;
  variant?:  BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: `${colors.status.success}22`, text: colors.status.success },
  error:   { bg: `${colors.status.error}22`,   text: colors.status.error   },
  warning: { bg: `${colors.status.warning}22`, text: colors.status.warning },
  info:    { bg: `${colors.status.info}22`,    text: colors.status.info    },
  olive:   { bg: `${colors.olive.primary}22`,  text: colors.olive.primary  },
  default: { bg: colors.bg.tertiary,           text: colors.text.secondary },
};

export const bookingStatusVariant = (status: BookingStatus): BadgeVariant => {
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'error';
  return 'warning';
};

export const slotStatusVariant = (status: SlotStatus): BadgeVariant => {
  if (status === 'available') return 'olive';
  if (status === 'locked')    return 'warning';
  return 'default';
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const { bg, text } = variantMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <AppText size="xs" weight="semiBold" color={text} uppercase tracking="wider">
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf:       'flex-start',
    paddingHorizontal: spacing[2],
    paddingVertical:   3,
    borderRadius:    radius.full,
  },
});
