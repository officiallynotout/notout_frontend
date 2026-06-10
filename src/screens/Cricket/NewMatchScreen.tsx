import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Input } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { createMatchApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const OVERS_OPTIONS = [5, 6, 7, 8, 10, 12, 15, 20];
const PLAYERS_OPTIONS = [6, 7, 8, 9, 10, 11];

export const NewMatchScreen: React.FC = () => {
  const navigation   = useNavigation<Nav>();
  const insets       = useSafeAreaInsets();
  const queryClient  = useQueryClient();

  const [team1Name,     setTeam1Name]     = useState('');
  const [team2Name,     setTeam2Name]     = useState('');
  const [battingFirst,  setBattingFirst]  = useState<'team1' | 'team2'>('team1');
  const [totalOvers,    setTotalOvers]    = useState(10);
  const [playersPerSide, setPlayersPerSide] = useState(11);
  const [trackExtras,   setTrackExtras]   = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => createMatchApi({
      team1Name:     team1Name.trim(),
      team2Name:     team2Name.trim(),
      battingFirst,
      totalOvers,
      playersPerSide,
      trackExtras,
    }),
    onSuccess: (res) => {
      const { matchId } = res.data.data;
      queryClient.invalidateQueries({ queryKey: ['cricket-matches'] });
      navigation.replace('CricketStartInnings', { matchId });
    },
    onError: () => Alert.alert('Error', 'Failed to create match. Please try again.'),
  });

  const canCreate = team1Name.trim().length > 0 && team2Name.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <AppText size="lg" weight="bold">New Match</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          {/* Team Names */}
          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
            TEAM NAMES
          </AppText>
          <Input
            placeholder="Team 1 name"
            value={team1Name}
            onChangeText={setTeam1Name}
            maxLength={50}
          />
          <View style={{ height: spacing[3] }} />
          <Input
            placeholder="Team 2 name"
            value={team2Name}
            onChangeText={setTeam2Name}
            maxLength={50}
          />

          {/* Batting First */}
          {team1Name.trim() && team2Name.trim() && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 250 }}
            >
              <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
                BATTING FIRST
              </AppText>
              <View style={styles.toggleRow}>
                {(['team1', 'team2'] as const).map((t) => {
                  const label = t === 'team1' ? team1Name.trim() : team2Name.trim();
                  const active = battingFirst === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setBattingFirst(t)}
                      style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                    >
                      <AppText
                        size="sm"
                        weight={active ? 'semiBold' : 'regular'}
                        color={active ? colors.white : colors.text.secondary}
                        numberOfLines={1}
                      >
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </MotiView>
          )}

          {/* Overs */}
          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
            OVERS PER INNINGS
          </AppText>
          <View style={styles.chipRow}>
            {OVERS_OPTIONS.map((o) => (
              <Pressable
                key={o}
                onPress={() => setTotalOvers(o)}
                style={[styles.chip, totalOvers === o && styles.chipActive]}
              >
                <AppText
                  size="sm"
                  weight={totalOvers === o ? 'bold' : 'regular'}
                  color={totalOvers === o ? colors.white : colors.text.secondary}
                >
                  {o}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Players per side */}
          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
            PLAYERS PER SIDE
          </AppText>
          <View style={styles.chipRow}>
            {PLAYERS_OPTIONS.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPlayersPerSide(p)}
                style={[styles.chip, playersPerSide === p && styles.chipActive]}
              >
                <AppText
                  size="sm"
                  weight={playersPerSide === p ? 'bold' : 'regular'}
                  color={playersPerSide === p ? colors.white : colors.text.secondary}
                >
                  {p}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Track Extras */}
          <View style={styles.extrasRow}>
            <View>
              <AppText size="base" weight="semiBold">Track Extras</AppText>
              <AppText size="sm" color={colors.text.secondary}>Wides, no-balls, byes</AppText>
            </View>
            <Switch
              value={trackExtras}
              onValueChange={setTrackExtras}
              trackColor={{ false: colors.bg.border, true: colors.olive.primary }}
              thumbColor={colors.white}
            />
          </View>
        </MotiView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          label="Create Match"
          onPress={() => mutate()}
          loading={isPending}
          disabled={!canCreate}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
  },
  content:      { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  sectionLabel: { marginTop: spacing[5], marginBottom: spacing[2] },
  toggleRow:    { flexDirection: 'row', gap: spacing[3] },
  toggleBtn: {
    flex: 1, paddingVertical: spacing[3], borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.bg.border,
    alignItems: 'center', backgroundColor: colors.bg.secondary,
  },
  toggleBtnActive: { backgroundColor: colors.olive.primary, borderColor: colors.olive.primary },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.bg.border,
    backgroundColor: colors.bg.secondary,
  },
  chipActive: { backgroundColor: colors.olive.primary, borderColor: colors.olive.primary },
  extrasRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bg.secondary, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.bg.border,
    padding: spacing[4], marginTop: spacing[5],
  },
  footer: { paddingHorizontal: spacing[5], paddingTop: spacing[3] },
});
