import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Input, Card, Badge } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getAllTurfsAdminApi, generateSlotsApi } from '@/api';
import { formatTime } from '@/utils/formatters';
import type { Turf, Slot } from '@/types';

const DURATIONS: { label: string; value: 30 | 60 | 90 | 120 }[] = [
  { label: '30 min', value: 30  },
  { label: '1 hr',   value: 60  },
  { label: '1.5 hr', value: 90  },
  { label: '2 hr',   value: 120 },
];

const generateSchema = z.object({
  date:      z.string().min(10, 'Select a date').regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  endTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  price:     z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price must be > 0'),
});

type GenerateForm = z.infer<typeof generateSchema>;

export const AdminSlotGenerateScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);
  const [duration, setDuration]             = useState<30 | 60 | 90 | 120>(60);
  const [generatedSlots, setGeneratedSlots] = useState<Slot[] | null>(null);

  const { data: turfs, isLoading: turfsLoading } = useQuery<Turf[]>({
    queryKey:  ['admin-turfs'],
    queryFn:   () => getAllTurfsAdminApi().then((r) => r.data.data),
    staleTime: 1000 * 60,
  });

  const { control, handleSubmit, formState: { errors } } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      date:      '',
      startTime: '06:00',
      endTime:   '23:00',
      price:     '',
    },
  });

  const { mutate: generate, isPending } = useMutation({
    mutationFn: (data: GenerateForm) => {
      if (!selectedTurfId) throw new Error('Please select a turf first.');
      return generateSlotsApi({
        turfId:          selectedTurfId,
        date:            data.date,
        startTime:       data.startTime,
        endTime:         data.endTime,
        durationMinutes: duration,
        price:           Number(data.price),
      });
    },
    onSuccess: (res) => {
      const slots = res.data.data;
      setGeneratedSlots(slots);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message ?? err?.response?.data?.message ?? 'Generation failed.');
    },
  });

  const selectedTurf = turfs?.find((t) => t._id === selectedTurfId);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <AppText size="xl" weight="bold">Generate Slots</AppText>
        <AppText size="sm" color={colors.text.secondary}>Bulk-create time slots for a turf</AppText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[10] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1 — Turf */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          1. Select Turf
        </AppText>

        {turfsLoading ? (
          <View style={styles.skeletonList} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.turfScroll} contentContainerStyle={styles.turfScrollContent}>
            {(turfs ?? []).filter((t) => t.isActive).map((turf) => {
              const selected = turf._id === selectedTurfId;
              return (
                <Pressable
                  key={turf._id}
                  style={[styles.turfChip, selected && styles.turfChipSelected]}
                  onPress={() => {
                    setSelectedTurfId(turf._id);
                    setGeneratedSlots(null);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={selected ? 'semiBold' : 'regular'}
                    color={selected ? colors.text.inverse : colors.text.primary}
                  >
                    {turf.name}
                  </AppText>
                  <AppText
                    size="xs"
                    color={selected ? `${colors.text.inverse}99` : colors.text.tertiary}
                  >
                    {turf.location.city}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Step 2 — Date & Times */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          2. Date & Time Window
        </AppText>
        <Card style={styles.section}>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Date (YYYY-MM-DD)"
                value={value}
                onChangeText={onChange}
                error={errors.date?.message}
                placeholder="2025-07-15"
                keyboardType="numbers-and-punctuation"
                leftIcon={<Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />}
              />
            )}
          />
          <View style={styles.gap} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="startTime"
                render={({ field: { onChange, value } }) => (
                  <Input label="Start (HH:MM)" value={value} onChangeText={onChange} error={errors.startTime?.message} placeholder="06:00" keyboardType="numbers-and-punctuation" />
                )}
              />
            </View>
            <View style={styles.gap16} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="endTime"
                render={({ field: { onChange, value } }) => (
                  <Input label="End (HH:MM)" value={value} onChangeText={onChange} error={errors.endTime?.message} placeholder="23:00" keyboardType="numbers-and-punctuation" />
                )}
              />
            </View>
          </View>
        </Card>

        {/* Step 3 — Duration */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          3. Slot Duration
        </AppText>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => {
            const active = duration === d.value;
            return (
              <Pressable
                key={d.value}
                style={[styles.durationBtn, active && styles.durationBtnActive]}
                onPress={() => setDuration(d.value)}
              >
                <AppText
                  size="sm"
                  weight={active ? 'semiBold' : 'regular'}
                  color={active ? colors.text.inverse : colors.text.primary}
                >
                  {d.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Step 4 — Price */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          4. Price per Slot (₹)
        </AppText>
        <Card style={styles.section}>
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <Input
                value={String(value)}
                onChangeText={onChange}
                error={errors.price?.message}
                placeholder="e.g. 400"
                keyboardType="numeric"
                leftIcon={<Ionicons name="cash-outline" size={16} color={colors.text.tertiary} />}
              />
            )}
          />
        </Card>

        <View style={styles.generateWrap}>
          <Button
            label="Generate Slots"
            onPress={handleSubmit((data) => generate(data))}
            loading={isPending}
            disabled={!selectedTurfId}
          />
          {!selectedTurfId && (
            <AppText size="xs" color={colors.text.tertiary} align="center" style={styles.hintText}>
              Select a turf above to continue
            </AppText>
          )}
        </View>

        {/* Result */}
        {generatedSlots !== null && (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.resultBox}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
              <AppText size="md" weight="bold" color={colors.status.success} style={styles.resultTitle}>
                {generatedSlots.length} slot{generatedSlots.length !== 1 ? 's' : ''} generated
              </AppText>
            </View>
            <AppText size="sm" color={colors.text.secondary} style={styles.resultSub}>
              {selectedTurf?.name} · {generatedSlots[0]?.date}
            </AppText>
            <View style={styles.slotChips}>
              {generatedSlots.map((s) => (
                <View key={s._id} style={styles.resultChip}>
                  <AppText size="xs" color={colors.text.secondary}>
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </AppText>
                </View>
              ))}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom:     spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  content:     { padding: spacing[4] },
  sectionLabel: { marginBottom: spacing[3], marginTop: spacing[4] },
  section:      { padding: spacing[4] },
  gap:          { height: spacing[3] },
  gap16:        { width: spacing[4] },
  row:          { flexDirection: 'row' },
  flex1:        { flex: 1 },
  skeletonList: { height: 60, backgroundColor: colors.bg.secondary, borderRadius: radius.lg },
  turfScroll:        { marginHorizontal: -spacing[4] },
  turfScrollContent: { paddingHorizontal: spacing[4], gap: spacing[2] },
  turfChip: {
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    borderRadius:      radius.lg,
    backgroundColor:   colors.bg.secondary,
    borderWidth:       1,
    borderColor:       colors.bg.border,
    minWidth:          120,
  },
  turfChipSelected: {
    backgroundColor: colors.olive.primary,
    borderColor:     colors.olive.primary,
  },
  durationRow: {
    flexDirection: 'row',
    gap:           spacing[2],
    marginBottom:  spacing[2],
  },
  durationBtn: {
    flex:             1,
    alignItems:       'center',
    paddingVertical:  spacing[3],
    borderRadius:     radius.md,
    backgroundColor:  colors.bg.secondary,
    borderWidth:      1,
    borderColor:      colors.bg.border,
  },
  durationBtnActive: {
    backgroundColor: colors.olive.primary,
    borderColor:     colors.olive.primary,
  },
  generateWrap: { marginTop: spacing[6] },
  hintText:     { marginTop: spacing[2] },
  resultBox: {
    marginTop:       spacing[5],
    backgroundColor: `${colors.status.success}12`,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     `${colors.status.success}30`,
    padding:         spacing[4],
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] },
  resultTitle:  { marginLeft: spacing[2] },
  resultSub:    { marginBottom: spacing[3] },
  slotChips: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },
  resultChip: {
    backgroundColor:  colors.bg.secondary,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   4,
    borderWidth:      1,
    borderColor:      colors.bg.border,
  },
});
