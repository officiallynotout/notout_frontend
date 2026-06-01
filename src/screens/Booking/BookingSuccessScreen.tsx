import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card } from '@/components/ui';
import { colors, spacing, fontFamily, radius } from '@/constants';
import { formatDate, formatTime } from '@/utils/formatters';
import { useHaptics } from '@/hooks';
import type { AppStackParamList } from '@/navigation/types';
import type { RootStackParamList } from '@/navigation/types';

type Route = NativeStackScreenProps<AppStackParamList, 'BookingSuccess'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList & RootStackParamList>;

// Confetti particle positions for the burst animation
const PARTICLES = [
  { x: -60, y: -80, rotate: '-30deg', color: colors.olive.primary },
  { x:  60, y: -80, rotate:  '30deg', color: colors.olive.light   },
  { x: -90, y: -40, rotate: '-60deg', color: colors.status.success },
  { x:  90, y: -40, rotate:  '60deg', color: colors.olive.dark     },
  { x: -30, y: -100, rotate: '-10deg', color: colors.olive.primary },
  { x:  30, y: -100, rotate:  '10deg', color: colors.olive.light   },
  { x: -110, y:  10, rotate: '-80deg', color: colors.status.success },
  { x:  110, y:  10, rotate:  '80deg', color: colors.olive.dark     },
];

export const BookingSuccessScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const { success: hapticSuccess } = useHaptics();

  const { turfName, date, startTime, endTime } = route.params;

  useEffect(() => {
    hapticSuccess();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background glow */}
      <View style={styles.glow} />

      <View style={styles.content}>
        {/* Animated checkmark with particles */}
        <View style={styles.iconContainer}>
          {PARTICLES.map((p, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0, translateX: 0, translateY: 0 }}
              animate={{ opacity: [1, 0], scale: 1, translateX: p.x, translateY: p.y }}
              transition={{
                type:     'timing',
                duration: 600,
                delay:    300 + i * 40,
                opacity:  { type: 'timing', duration: 800, delay: 400 + i * 40 },
              }}
              style={[styles.particle, { transform: [{ rotate: p.rotate }] }]}
            >
              <View style={[styles.particleBar, { backgroundColor: p.color }]} />
            </MotiView>
          ))}

          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 100 }}
            style={styles.checkCircle}
          >
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 350 }}
            >
              <Ionicons name="checkmark" size={44} color={colors.text.inverse} />
            </MotiView>
          </MotiView>
        </View>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 500 }}
          style={styles.textBlock}
        >
          <AppText size="2xl" weight="bold" align="center" style={styles.heading}>
            Booking{'\n'}Confirmed!
          </AppText>
          <AppText size="base" color={colors.text.secondary} align="center">
            Your slot has been successfully booked.
          </AppText>
        </MotiView>

        {/* Details card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 650 }}
          style={styles.cardWrapper}
        >
          <Card style={styles.detailCard}>
            <AppText size="md" weight="bold" align="center" style={styles.cardTurf}>
              {turfName}
            </AppText>

            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <AppText size="xs" color={colors.text.tertiary} uppercase tracking="wider" align="center">
                  Date
                </AppText>
                <AppText size="sm" weight="semiBold" align="center">
                  {formatDate(date)}
                </AppText>
              </View>
              <View style={styles.cardDividerV} />
              <View style={styles.cardItem}>
                <AppText size="xs" color={colors.text.tertiary} uppercase tracking="wider" align="center">
                  Time
                </AppText>
                <AppText size="sm" weight="semiBold" align="center">
                  {formatTime(startTime)}
                </AppText>
                <AppText size="xs" color={colors.text.secondary} align="center">
                  to {formatTime(endTime)}
                </AppText>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Actions */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 850 }}
          style={styles.actions}
        >
          <Button
            label="View My Bookings"
            onPress={() => {
              navigation.reset({ index: 0, routes: [{ name: 'App' }] });
              // Tab navigator handles deep linking — navigate to MyBookings tab
            }}
          />
          <Button
            label="Back to Home"
            variant="outline"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'App' }] })}
            style={styles.secondaryBtn}
          />
        </MotiView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.bg.primary,
  },
  glow: {
    position:        'absolute',
    top:             -60,
    left:            '50%',
    marginLeft:      -160,
    width:           320,
    height:          320,
    borderRadius:    160,
    backgroundColor: `${colors.olive.primary}10`,
  },
  content: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    width:          120,
    height:         120,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   spacing[8],
    position:       'relative',
  },
  checkCircle: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: colors.olive.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  particle: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },
  particleBar: {
    width:        4,
    height:       12,
    borderRadius: 2,
  },
  textBlock:    { marginBottom: spacing[6], alignItems: 'center' },
  heading:      { marginBottom: spacing[2], lineHeight: 38 },
  cardWrapper:  { width: '100%', marginBottom: spacing[6] },
  detailCard: {
    padding:    spacing[5],
    alignItems: 'center',
  },
  cardTurf:   { marginBottom: spacing[4] },
  cardRow: {
    flexDirection: 'row',
    alignItems:    'center',
    width:         '100%',
  },
  cardItem:      { flex: 1, gap: 4 },
  cardDividerV: {
    width:           1,
    height:          48,
    backgroundColor: colors.bg.divider,
    marginHorizontal: spacing[4],
  },
  actions:      { width: '100%', gap: spacing[3] },
  secondaryBtn: {},
});
