import React from 'react';
import { View, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { colors, radius } from '@/constants';

interface SkeletonProps {
  width?:       number | `${number}%`;
  height?:      number;
  borderRadius?: number;
  style?:       ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width        = '100%',
  height       = 16,
  borderRadius = radius.sm,
  style,
}) => (
  <MotiView
    from={{ opacity: 0.4 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 700, loop: true }}
    style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: colors.bg.tertiary,
      },
      style,
    ]}
  />
);

export const TurfCardSkeleton = () => (
  <View style={{ marginBottom: 12, padding: 16, backgroundColor: colors.bg.secondary, borderRadius: radius.lg }}>
    <Skeleton height={140} borderRadius={radius.md} style={{ marginBottom: 12 }} />
    <Skeleton height={18} width="70%" style={{ marginBottom: 8 }} />
    <Skeleton height={14} width="50%" style={{ marginBottom: 12 }} />
    <Skeleton height={14} width="40%" />
  </View>
);
