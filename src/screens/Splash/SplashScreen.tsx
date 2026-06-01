import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView, MotiText } from 'moti';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { colors, fontFamily } from '@/constants';

ExpoSplashScreen.preventAutoHideAsync();

interface Props {
  onDone: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onDone }) => {
  useEffect(() => {
    ExpoSplashScreen.hideAsync();
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 160, delay: 200 }}
        style={styles.logoMark}
      >
        <View style={styles.logoInner} />
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 600 }}
      >
        <MotiText style={styles.brandName}>NOTOUT</MotiText>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 900 }}
      >
        <MotiText style={styles.tagline}>Book. Play. Win.</MotiText>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 1400 }}
        style={styles.dotsRow}
      >
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 1400 + i * 120 }}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.bg.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoMark: {
    width:           72,
    height:          72,
    borderRadius:    20,
    backgroundColor: colors.olive.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    28,
  },
  logoInner: {
    width:        36,
    height:       36,
    borderRadius: 8,
    borderWidth:  3,
    borderColor:  colors.text.inverse,
  },
  brandName: {
    fontFamily:    fontFamily.bold,
    fontSize:      36,
    color:         colors.text.primary,
    letterSpacing: 8,
    textAlign:     'center',
  },
  tagline: {
    fontFamily:    fontFamily.medium,
    fontSize:      14,
    color:         colors.text.secondary,
    letterSpacing: 3,
    marginTop:     8,
    textAlign:     'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap:           8,
    position:      'absolute',
    bottom:        60,
  },
  dot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: colors.text.disabled,
  },
  dotActive: {
    backgroundColor: colors.olive.primary,
    width:           18,
    borderRadius:    3,
  },
});
