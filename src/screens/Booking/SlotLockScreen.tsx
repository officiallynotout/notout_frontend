import React, { useEffect, useState } from 'react';
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
import { colors, spacing, radius } from '@/constants';
import { lockSlotApi } from '@/api';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import type { AppStackParamList } from '@/navigation/types';

type Route = NativeStackScreenProps<AppStackParamList, 'SlotLock'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList>;

const LOCK_DURATION_SECS = 10 * 60; // 10 minutes

export const SlotLockScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const { turfId, turfName, boxName, slotId, date, startTime, endTime, price } = route.params;

  const handleLockSlot = async () => {
    setLoading(true);
    try {
      await lockSlotApi({ slotId });
      navigation.navigate('BookingConfirm', {
        turfName,
        boxName,
        date,
        startTime,
        endTime,
        price,
        slotId,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not hold this slot. It may have been taken.';
      Alert.alert('Slot Unavailable', msg, [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const InfoRow: React.FC<{ icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }> = ({
    icon, label, value,
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={16} color={colors.olive.primary} />
      </View>
      <View style={styles.infoContent}>
        <AppText size="xs" color={colors.text.tertiary} uppercase tracking="wider">
          {label}
        </AppText>
        <AppText size="base" weight="semiBold">
          {value}
        </AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Hold Slot" subtitle="Review before locking" showBack />

      <View style={[styles.body, { paddingBottom: insets.bottom + 100 }]}>
        {/* Turf info card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <AppText size="sm" color={colors.text.tertiary} uppercase tracking="wider" style={styles.sectionLabel}>
            Booking Summary
          </AppText>

          <Card style={styles.summaryCard}>
            <AppText size="xl" weight="bold" style={styles.turfName}>
              {turfName}
            </AppText>

            <View style={styles.infoList}>
              <InfoRow icon="cube-outline"     label="Box"         value={boxName} />
              <View style={styles.separator} />
              <InfoRow icon="calendar-outline" label="Date"        value={formatDate(date)} />
              <View style={styles.separator} />
              <InfoRow icon="time-outline"     label="Time Slot"   value={`${formatTime(startTime)} – ${formatTime(endTime)}`} />
              <View style={styles.separator} />
              <InfoRow icon="cash-outline"     label="Amount"      value={formatCurrency(price)} />
            </View>
          </Card>
        </MotiView>

        {/* Lock notice */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
          style={styles.noticeBox}
        >
          <Ionicons name="lock-closed-outline" size={16} color={colors.status.warning} />
          <AppText size="sm" color={colors.status.warning} style={styles.noticeText}>
            This slot will be held for <AppText size="sm" weight="bold" color={colors.status.warning}>10 minutes</AppText> after locking. Complete your booking before time runs out.
          </AppText>
        </MotiView>
      </View>

      {/* CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button label="Hold This Slot" onPress={handleLockSlot} loading={loading} />
        <Button
          label="Choose Different Slot"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
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
  sectionLabel: { marginBottom: spacing[3] },
  summaryCard:  { padding: spacing[5] },
  turfName:     { marginBottom: spacing[4] },
  infoList:     { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical: spacing[3],
    gap:           spacing[3],
  },
  infoIconWrapper: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: `${colors.olive.primary}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  infoContent: { flex: 1, gap: 2 },
  separator: {
    height:          1,
    backgroundColor: colors.bg.divider,
  },
  noticeBox: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: `${colors.status.warning}12`,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     `${colors.status.warning}30`,
    padding:         spacing[4],
    marginTop:       spacing[5],
    gap:             spacing[2],
  },
  noticeText: { flex: 1, lineHeight: 20 },
  ctaContainer: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    backgroundColor:   colors.bg.primary,
    borderTopWidth:    1,
    borderTopColor:    colors.bg.divider,
    gap:               spacing[2],
  },
  backBtn: { marginTop: spacing[1] },
});
