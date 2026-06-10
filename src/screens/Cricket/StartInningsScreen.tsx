import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Input } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { startMatchApi, startInnings2Api, getMatchApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';

type Nav   = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CricketStartInnings'>;

export const StartInningsScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const route       = useRoute<Route>();
  const insets      = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { matchId, isSecondInnings = false, target } = route.params;

  const [opener1, setOpener1] = useState('');
  const [opener2, setOpener2] = useState('');
  const [bowler,  setBowler]  = useState('');

  const { data: match } = useQuery({
    queryKey: ['cricket-match', matchId],
    queryFn:  () => getMatchApi(matchId).then((r) => r.data.data),
    staleTime: 0,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => isSecondInnings
      ? startInnings2Api(matchId, { opener1: opener1.trim(), opener2: opener2.trim(), bowler: bowler.trim() })
      : startMatchApi(matchId, { opener1: opener1.trim(), opener2: opener2.trim(), bowler: bowler.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cricket-match', matchId] });
      navigation.replace('CricketLiveScoring', { matchId });
    },
    onError: () => Alert.alert('Error', 'Could not start innings. Please try again.'),
  });

  const canStart = opener1.trim() && opener2.trim() && bowler.trim()
    && opener1.trim() !== opener2.trim();

  const battingTeamName = (() => {
    if (!match) return '';
    if (isSecondInnings) {
      return match.battingFirst === 'team1' ? match.team2Name : match.team1Name;
    }
    return match.battingFirst === 'team1' ? match.team1Name : match.team2Name;
  })();

  const bowlingTeamName = (() => {
    if (!match) return '';
    if (isSecondInnings) {
      return match.battingFirst === 'team1' ? match.team1Name : match.team2Name;
    }
    return match.battingFirst === 'team1' ? match.team2Name : match.team1Name;
  })();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <AppText size="lg" weight="bold">
          {isSecondInnings ? '2nd Innings' : '1st Innings'}
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
        >
          {isSecondInnings && target && (
            <View style={styles.targetBanner}>
              <AppText size="sm" color={colors.text.secondary}>Target</AppText>
              <AppText size="2xl" weight="bold" color={colors.status.warning}>{target}</AppText>
              <AppText size="sm" color={colors.text.secondary}>{bowlingTeamName} set</AppText>
            </View>
          )}

          <View style={styles.teamsRow}>
            <View style={styles.teamBadge}>
              <Ionicons name="baseball" size={14} color={colors.olive.primary} />
              <AppText size="sm" weight="semiBold" color={colors.olive.primary} style={{ marginLeft: 4 }}>
                BAT: {battingTeamName}
              </AppText>
            </View>
            <View style={[styles.teamBadge, { backgroundColor: `${colors.status.info}15` }]}>
              <AppText size="sm" weight="semiBold" color={colors.status.info}>
                BOWL: {bowlingTeamName}
              </AppText>
            </View>
          </View>

          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
            OPENING BATSMEN
          </AppText>
          <Input
            placeholder="Opener 1 (on strike)"
            value={opener1}
            onChangeText={setOpener1}
            maxLength={50}
          />
          <View style={{ height: spacing[3] }} />
          <Input
            placeholder="Opener 2 (non-strike)"
            value={opener2}
            onChangeText={setOpener2}
            maxLength={50}
          />
          {opener1.trim() && opener2.trim() && opener1.trim() === opener2.trim() && (
            <AppText size="xs" color={colors.status.error} style={styles.errorText}>
              Opener names must be different
            </AppText>
          )}

          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.sectionLabel}>
            OPENING BOWLER
          </AppText>
          <Input
            placeholder="Bowler name"
            value={bowler}
            onChangeText={setBowler}
            maxLength={50}
          />
        </MotiView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          label={isSecondInnings ? 'Start 2nd Innings' : 'Start Match'}
          onPress={() => mutate()}
          loading={isPending}
          disabled={!canStart}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
  },
  content:      { paddingHorizontal: spacing[5], paddingBottom: spacing[8] },
  targetBanner: {
    alignItems: 'center', backgroundColor: `${colors.status.warning}15`,
    borderRadius: radius.lg, padding: spacing[5],
    borderWidth: 1, borderColor: `${colors.status.warning}30`,
    marginBottom: spacing[5],
  },
  teamsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[2] },
  teamBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.olive.primary}15`,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  sectionLabel: { marginTop: spacing[5], marginBottom: spacing[2] },
  errorText:    { marginTop: spacing[1], color: colors.status.error },
  footer:       { paddingHorizontal: spacing[5], paddingTop: spacing[3] },
});
