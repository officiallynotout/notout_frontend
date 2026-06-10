import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AppText } from '@/components/ui';
import { colors } from '@/constants';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => (
  <MotiView
    from={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={styles.overlay}
  >
    <View style={styles.box}>
      <ActivityIndicator size="large" color={colors.olive.primary} />
      {message ? (
        <AppText size="sm" color={colors.text.secondary} align="center" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  </MotiView>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  box: {
    backgroundColor: colors.bg.secondary,
    borderRadius:    16,
    padding:         32,
    alignItems:      'center',
    gap:             16,
    minWidth:        140,
  },
  message: { marginTop: 4 },
});
