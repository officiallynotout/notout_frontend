import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Calendar } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { Header, SlotChip, EmptyState } from '@/components/common';
import { colors, spacing, fontFamily, fontSize, radius } from '@/constants';
import { getSlotsApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';
import type { Slot } from '@/types';

type Route = NativeStackScreenProps<AppStackParamList, 'DateSlot'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList>;

const today = new Date().toISOString().split('T')[0];

export const DateSlotScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const { turfId, turfName } = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', turfId, selectedDate],
    queryFn:  () =>
      getSlotsApi({ turfId, date: selectedDate! }).then((r) => r.data.data),
    enabled:  Boolean(selectedDate),
    staleTime: 0,
  });

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
  };

  const handleSlotPress = (slot: Slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot((prev) => (prev?._id === slot._id ? null : slot));
  };

  const handleContinue = () => {
    if (!selectedSlot || !selectedDate) return;
    navigation.navigate('SlotLock', {
      turfId,
      turfName,
      slotId:    selectedSlot._id,
      date:      selectedDate,
      startTime: selectedSlot.startTime,
      endTime:   selectedSlot.endTime,
      price:     selectedSlot.price,
    });
  };

  const calendarTheme = {
    backgroundColor:     colors.bg.primary,
    calendarBackground:  colors.bg.primary,
    textSectionTitleColor: colors.text.secondary,
    selectedDayBackgroundColor: colors.olive.primary,
    selectedDayTextColor: colors.text.inverse,
    todayTextColor:      colors.olive.light,
    dayTextColor:        colors.text.primary,
    textDisabledColor:   colors.text.disabled,
    dotColor:            colors.olive.primary,
    arrowColor:          colors.olive.primary,
    monthTextColor:      colors.text.primary,
    textDayFontFamily:   fontFamily.medium,
    textMonthFontFamily: fontFamily.bold,
    textDayHeaderFontFamily: fontFamily.semiBold,
    textDayFontSize:     fontSize.sm,
    textMonthFontSize:   fontSize.base,
    textDayHeaderFontSize: fontSize.xs,
  };

  return (
    <View style={styles.container}>
      <Header title="Select Date & Slot" subtitle={turfName} showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Calendar */}
        <Calendar
          onDayPress={handleDateSelect}
          minDate={today}
          markedDates={
            selectedDate
              ? { [selectedDate]: { selected: true, selectedColor: colors.olive.primary } }
              : {}
          }
          theme={calendarTheme as any}
          style={styles.calendar}
        />

        <View style={styles.divider} />

        {/* Slots section */}
        {selectedDate ? (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
            style={styles.slotsSection}
          >
            <View style={styles.slotsHeader}>
              <AppText size="md" weight="semiBold">
                Available Slots
              </AppText>
              <View style={styles.legend}>
                {[
                  { color: colors.olive.primary, label: 'Available' },
                  { color: colors.status.warning, label: 'Locked' },
                  { color: colors.text.disabled, label: 'Booked' },
                ].map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <AppText size="xs" color={colors.text.tertiary}>{l.label}</AppText>
                  </View>
                ))}
              </View>
            </View>

            {isLoading ? (
              <View style={styles.slotsGrid}>
                {Array(6).fill(0).map((_, i) => (
                  <View key={i} style={styles.slotSkeletonWrapper}>
                    <View style={styles.slotSkeleton} />
                  </View>
                ))}
              </View>
            ) : slots && slots.length > 0 ? (
              <View style={styles.slotsGrid}>
                {slots.map((slot: Slot) => (
                  <SlotChip
                    key={slot._id}
                    slot={slot}
                    selected={selectedSlot?._id === slot._id}
                    onPress={handleSlotPress}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="time-outline"
                title="No slots available"
                description="Try selecting a different date."
              />
            )}
          </MotiView>
        ) : (
          <View style={styles.promptContainer}>
            <AppText size="sm" color={colors.text.tertiary} align="center">
              Select a date above to see available slots
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      {selectedSlot ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 250 }}
          style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}
        >
          <View style={styles.ctaInfo}>
            <AppText size="sm" color={colors.text.secondary}>
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </AppText>
            <AppText size="md" weight="bold" color={colors.olive.primary}>
              ₹{selectedSlot.price}
            </AppText>
          </View>
          <Button label="Hold This Slot" onPress={handleContinue} />
        </MotiView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg.primary },
  calendar:    { paddingHorizontal: spacing[2] },
  divider: {
    height:          1,
    backgroundColor: colors.bg.divider,
    marginVertical:  spacing[2],
  },
  slotsSection:   { paddingHorizontal: spacing[5] },
  slotsHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing[4],
  },
  legend:     { flexDirection: 'row', gap: spacing[3] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: {
    width:        7,
    height:       7,
    borderRadius: 4,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           '3%',
  },
  slotSkeletonWrapper: { width: '30%', marginBottom: spacing[3] },
  slotSkeleton: {
    height:          76,
    borderRadius:    radius.md,
    backgroundColor: colors.bg.tertiary,
    opacity:         0.6,
  },
  promptContainer: {
    paddingHorizontal: spacing[5],
    paddingVertical:   spacing[6],
  },
  ctaContainer: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    backgroundColor:   colors.bg.primary,
    borderTopWidth:    1,
    borderTopColor:    colors.bg.divider,
    gap:               spacing[3],
  },
  ctaInfo: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
});
