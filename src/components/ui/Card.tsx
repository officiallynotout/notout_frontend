import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants';

interface CardProps extends ViewProps {
  padding?: number;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding  = spacing[4],
  elevated = false,
  style,
  ...rest
}) => (
  <View
    style={[
      styles.card,
      { padding },
      elevated && styles.elevated,
      style,
    ]}
    {...rest}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.bg.border,
  },
  elevated: {
    shadowColor:   colors.black,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  8,
    elevation:     6,
  },
});
