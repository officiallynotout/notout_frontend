import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Card } from '@/components/ui';
import { Header } from '@/components/common';
import { colors, spacing } from '@/constants';
import { createBookingApi, releaseSlotApi } from '@/api';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import { useHaptics } from '@/hooks';
import type { AppStackParamList } from '@/navigation/types';

type Route = NativeStackScreenProps<AppStackParamList, 'BookingConfirm'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList>;

const LOCK_SECS = 10 * 60;

export const BookingConfirmScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const { success: hapticSuccess } = useHaptics();

  const { turfName, date, startTime, endTime, price, slotId } = route.params;

  const [confirming, setConfirming] = useState(false);
  const [remaining, setRemaining]   = useState(LOCK_SECS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          Alert.alert(
            'Slot Expired',
            'Your slot hold has expired. Please select again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Tabs', undefined) }],
          );
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current!); };
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await createBookingApi({ turfName, date, startTime, endTime });
      hapticSuccess();
      clearInterval(timerRef.current!);
      navigation.replace('BookingSuccess', {
        bookingId: res.data.data._id,
        turfName,
        date,
        startTime,
        endTime,
      });
    } catch (err: any) {
      Alert.alert('Booking Failed', err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Release Slot?',
      'This will cancel your hold and free the slot for others.',
      [
        { text: 'Keep Hold', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try { await releaseSlotApi(slotId); } catch {}
            navigation.navigate('Tabs', undefined);
          },
        },
      ],
    );
  };

  const timerColor = remaining < 120 ? colors.status.error : colors.status.warning;

  return (
    <View style={styles.container}>
      <Header title="Confirm Booking" showBack={false} />

      <View style={[styles.body, { paddingBottom: insets.bottom + 100 }]}>
        {/* Countdown timer */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={[styles.timerBox, { borderColor: `${timerColor}40` }]}
        >
          <Ionicons name="hourglass-outline" size={18} color={timerColor} />
          <AppText size="base" weight="bold" color={timerColor} style={styles.timerText}>
            {formatCountdown(remaining)}
          </AppText>
          <AppText size="xs" color={timerColor}>
            slot hold remaining
          </AppText>
        </MotiView>

        {/* Booking details */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
        >
          <AppText size="sm" color={colors.text.tertiary} uppercase tracking="wider" style={styles.sectionLabel}>
            Booking Details
          </AppText>

          <Card style={styles.detailCard}>
            <AppText size="xl" weight="bold" style={styles.turfName}>
              {turfName}
            </AppText>

            {[
              { icon: 'calendar-outline' as const, label: 'Date',      value: formatDate(date) },
              { icon: 'time-outline'     as const, label: 'Time',      value: `${formatTime(startTime)} – ${formatTime(endTime)}` },
              { icon: 'cash-outline'     as const, label: 'Amount Due', value: formatCurrency(price) },
            ].map(({ icon, label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <View style={styles.rowDivider} />}
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Ionicons name={icon} size={15} color={colors.text.tertiary} />
                    <AppText size="sm" color={colors.text.secondary} style={styles.detailLabel}>
                      {label}
                    </AppText>
                  </View>
                  <AppText size="sm" weight="semiBold">
                    {value}
                  </AppText>
                </View>
              </React.Fragment>
            ))}
          </Card>
        </MotiView>

        {/* Policy note */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.policyNote}
        >
          <Ionicons name="information-circle-outline" size={14} color={colors.text.tertiary} />
          <AppText size="xs" color={colors.text.tertiary} style={styles.policyText}>
            By confirming, you agree to our booking policy. Cancellations are allowed before the match day.
          </AppText>
        </MotiView>
      </View>

      {/* CTAs */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button label="Confirm Booking" onPress={handleConfirm} loading={confirming} />
        <Button label="Release Slot" variant="ghost" onPress={handleCancel} style={styles.cancelBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  body: {
    flex:              1,
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[5],
  },
  timerBox: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing[2],
    backgroundColor: `${colors.status.warning}10`,
    borderWidth:     1.5,
    borderRadius:    12,
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    marginBottom:    spacing[5],
    alignSelf:       'flex-start',
  },
  timerText:    {},
  sectionLabel: { marginBottom: spacing[3] },
  detailCard:   { padding: spacing[5] },
  turfName:     { marginBottom: spacing[4] },
  detailRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  detailLabel:  {},
  rowDivider: {
    height:          1,
    backgroundColor: colors.bg.divider,
  },
  policyNote: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           spacing[2],
    marginTop:     spacing[4],
  },
  policyText: { flex: 1, lineHeight: 18 },
  ctaContainer: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    backgroundColor:   colors.bg.primary,
    borderTopWidth:    1,
    borderTopColor:    colors.bg.divider,
    gap:               spacing[2],
  },
  cancelBtn: {},
});
