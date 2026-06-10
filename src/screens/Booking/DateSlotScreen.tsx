import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Calendar } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button } from '@/components/ui';
import { Header, SlotChip, EmptyState } from '@/components/common';
import { colors, spacing, fontFamily, fontSize, radius } from '@/constants';
import { getBoxesApi, getSlotsApi } from '@/api';
import { formatTime } from '@/utils/formatters';
import type { AppStackParamList } from '@/navigation/types';
import type { Box, Slot } from '@/types';

type Route = NativeStackScreenProps<AppStackParamList, 'DateSlot'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList>;

const today = new Date().toISOString().split('T')[0];

export const DateSlotScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const { turfId, turfName } = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBox,  setSelectedBox]  = useState<Box | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: boxes, isLoading: boxesLoading } = useQuery({
    queryKey:  ['boxes', turfId],
    queryFn:   () => getBoxesApi(turfId).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedBox?._id, selectedDate],
    queryFn:  () =>
      getSlotsApi({ boxId: selectedBox!._id, date: selectedDate! }).then((r) => r.data.data),
    enabled:  Boolean(selectedBox && selectedDate),
    staleTime: 0,
  });

  const handleDateSelect = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
  };

  const handleBoxPress = (box: Box) => {
    setSelectedBox((prev) => (prev?._id === box._id ? null : box));
    setSelectedSlot(null);
  };

  const handleSlotPress = (slot: Slot) => {
    if (slot.effectiveStatus !== 'available') return;
    setSelectedSlot((prev) => (prev?._id === slot._id ? null : slot));
  };

  const handleContinue = () => {
    if (!selectedSlot || !selectedDate || !selectedBox) return;
    navigation.navigate('SlotLock', {
      turfId,
      turfName,
      boxName:   selectedBox.name,
      slotId:    selectedSlot._id,
      date:      selectedDate,
      startTime: selectedSlot.startTime,
      endTime:   selectedSlot.endTime,
      price:     selectedSlot.price,
    });
  };

  const calendarTheme = {
    backgroundColor:            colors.bg.primary,
    calendarBackground:         colors.bg.primary,
    textSectionTitleColor:      colors.text.secondary,
    selectedDayBackgroundColor: colors.olive.primary,
    selectedDayTextColor:       colors.text.inverse,
    todayTextColor:             colors.olive.light,
    dayTextColor:               colors.text.primary,
    textDisabledColor:          colors.text.disabled,
    dotColor:                   colors.olive.primary,
    arrowColor:                 colors.olive.primary,
    monthTextColor:             colors.text.primary,
    textDayFontFamily:          fontFamily.medium,
    textMonthFontFamily:        fontFamily.bold,
    textDayHeaderFontFamily:    fontFamily.semiBold,
    textDayFontSize:            fontSize.sm,
    textMonthFontSize:          fontSize.base,
    textDayHeaderFontSize:      fontSize.xs,
  };

  return (
    <View style={styles.container}>
      <Header title="Book a Slot" subtitle={turfName} showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Step 1: Date ── */}
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

        {/* ── Step 2: Box ── */}
        {selectedDate ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <AppText size="md" weight="semiBold">Select Box</AppText>
              {selectedBox && (
                <AppText size="sm" color={colors.olive.primary} weight="semiBold">
                  {selectedBox.name}
                </AppText>
              )}
            </View>

            {boxesLoading ? (
              <View style={styles.boxRow}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.boxSkeleton} />
                ))}
              </View>
            ) : (
              <FlatList
                data={boxes}
                keyExtractor={(b) => b._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.boxRow}
                renderItem={({ item: box }) => {
                  const active = selectedBox?._id === box._id;
                  return (
                    <Pressable
                      onPress={() => handleBoxPress(box)}
                      style={[styles.boxChip, active && styles.boxChipActive]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={15}
                        color={active ? colors.text.inverse : colors.text.secondary}
                      />
                      <AppText
                        size="sm"
                        weight={active ? 'semiBold' : 'regular'}
                        color={active ? colors.text.inverse : colors.text.primary}
                      >
                        {box.name}
                      </AppText>
                    </Pressable>
                  );
                }}
              />
            )}
          </MotiView>
        ) : (
          <View style={styles.promptContainer}>
            <AppText size="sm" color={colors.text.tertiary} align="center">
              Select a date above to get started
            </AppText>
          </View>
        )}

        {/* ── Step 3: Slots ── */}
        {selectedBox && selectedDate ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.section}
          >
            <View style={styles.divider} />

            <View style={[styles.sectionHeader, { marginTop: spacing[4] }]}>
              <AppText size="md" weight="semiBold">Available Slots</AppText>
              <View style={styles.legend}>
                {[
                  { color: colors.olive.primary,  label: 'Available' },
                  { color: colors.status.warning, label: 'Locked' },
                  { color: colors.text.disabled,  label: 'Booked' },
                ].map((l) => (
                  <View key={l.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <AppText size="xs" color={colors.text.tertiary}>{l.label}</AppText>
                  </View>
                ))}
              </View>
            </View>

            {slotsLoading ? (
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
                description="Try a different date or box."
              />
            )}
          </MotiView>
        ) : selectedDate && !selectedBox ? (
          <View style={styles.promptContainer}>
            <AppText size="sm" color={colors.text.tertiary} align="center">
              Choose a box above to see available slots
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      {/* ── CTA ── */}
      {selectedSlot ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 250 }}
          style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}
        >
          <View style={styles.ctaInfo}>
            <View>
              <AppText size="xs" color={colors.text.tertiary}>
                {selectedBox?.name}  ·  {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
              </AppText>
            </View>
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
  container: { flex: 1, backgroundColor: colors.bg.primary },
  calendar:  { paddingHorizontal: spacing[2] },
  divider: {
    height:          1,
    backgroundColor: colors.bg.divider,
    marginVertical:  spacing[2],
  },
  section:         { paddingHorizontal: spacing[5] },
  sectionHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing[3],
  },
  boxRow: {
    flexDirection: 'row',
    gap:           spacing[2],
    paddingRight:  spacing[5],
  },
  boxChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[2] + 2,
    borderRadius:      radius.full,
    borderWidth:       1.5,
    borderColor:       colors.bg.border,
    backgroundColor:   colors.bg.secondary,
  },
  boxChipActive: {
    backgroundColor: colors.olive.primary,
    borderColor:     colors.olive.primary,
  },
  boxSkeleton: {
    width:           80,
    height:          38,
    borderRadius:    radius.full,
    backgroundColor: colors.bg.tertiary,
    opacity:         0.6,
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
