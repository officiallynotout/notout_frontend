import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { colors, spacing, radius, fontFamily, fontSize } from '@/constants';
import { getMatchByCodeApi } from '@/api';
import { useCricketSocket } from '@/hooks/useCricketSocket';
import type { AppStackParamList } from '@/navigation/types';
import type { CricketMatch, CricketInnings } from '@/types';

type Nav   = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CricketSpectator'>;

// ── Live scorecard (read-only) ─────────────────────────────────────────────────

const LiveScorecard: React.FC<{ match: CricketMatch; connected: boolean }> = ({ match, connected }) => {
  const activeInnings: CricketInnings | undefined =
    match.innings.find((i) => i.status === 'IN_PROGRESS') ?? match.innings[match.innings.length - 1];

  if (!activeInnings) return null;

  const battingTeamName = activeInnings.battingTeam === 'team1' ? match.team1Name : match.team2Name;
  const currentBatsmen  = activeInnings.batsmen.filter((b) => !b.isOut);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Connection indicator */}
      <View style={styles.connRow}>
        <View style={[styles.connDot, { backgroundColor: connected ? colors.olive.primary : colors.status.warning }]} />
        <AppText size="xs" color={colors.text.tertiary}>
          {connected ? 'Live' : 'Reconnecting...'}
        </AppText>
      </View>

      {/* Score */}
      <View style={styles.scoreCard}>
        <AppText size="sm" color={colors.text.secondary} weight="semiBold">
          Innings {activeInnings.inningsNumber} • {battingTeamName}
        </AppText>
        <AppText size="4xl" weight="bold" style={{ marginVertical: spacing[1] }}>
          {activeInnings.totalRuns}/{activeInnings.totalWickets}
        </AppText>
        <View style={styles.subRow}>
          <AppText size="sm" color={colors.text.secondary}>{activeInnings.overs} overs</AppText>
          <View style={styles.dot} />
          <AppText size="sm" color={colors.text.secondary}>RR {activeInnings.runRate.toFixed(1)}</AppText>
          {match.target && (
            <>
              <View style={styles.dot} />
              <AppText size="sm" color={colors.status.warning} weight="semiBold">
                Target {match.target}
              </AppText>
            </>
          )}
        </View>

        {/* Recent balls */}
        {activeInnings.recentBalls.length > 0 && (
          <View style={{ marginTop: spacing[4] }}>
            <AppText size="xs" color={colors.text.tertiary} style={{ marginBottom: 6 }}>THIS OVER</AppText>
            <View style={styles.ballsRow}>
              {activeInnings.recentBalls.map((b, i) => {
                let label = '.';
                let bg    = colors.bg.border;
                let col   = colors.text.secondary;
                if (b.isWicket)       { label = 'W';  bg = colors.status.error;           col = colors.white; }
                else if (b.isWide)    { label = 'Wd'; bg = `${colors.status.warning}30`; col = colors.status.warning; }
                else if (b.isNoBall)  { label = 'NB'; bg = `${colors.status.warning}30`; col = colors.status.warning; }
                else if (b.runs === 4){ label = '4';  bg = `${colors.olive.primary}30`;  col = colors.olive.primary; }
                else if (b.runs === 6){ label = '6';  bg = `${colors.olive.light}30`;    col = colors.olive.light; }
                else if (b.runs > 0)  { label = String(b.runs); bg = colors.bg.tertiary; col = colors.text.primary; }
                return (
                  <View key={b.id ?? i} style={[styles.ballBadge, { backgroundColor: bg }]}>
                    <AppText size="xs" weight="bold" color={col}>{label}</AppText>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Batsmen */}
      <View style={styles.section}>
        <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>BATTING</AppText>
        {currentBatsmen.map((b) => {
          const isStriker = b.playerName === activeInnings.currentStrikeBatsman;
          return (
            <View key={b.id} style={[styles.playerRow, isStriker && styles.playerRowActive]}>
              <View style={styles.playerName}>
                {isStriker && <View style={styles.strikerDot} />}
                <AppText size="base" weight={isStriker ? 'semiBold' : 'regular'}>{b.playerName}</AppText>
              </View>
              <AppText size="base" weight="bold">{b.runs}</AppText>
              <AppText size="sm" color={colors.text.tertiary} style={{ width: 36, textAlign: 'right' }}>
                ({b.balls})
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Bowler */}
      {activeInnings.currentBowlerName && (() => {
        const bowler = activeInnings.bowlers.find((b) => b.playerName === activeInnings.currentBowlerName);
        return bowler ? (
          <View style={styles.section}>
            <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>BOWLING</AppText>
            <View style={styles.playerRow}>
              <AppText size="base" weight="semiBold" style={{ flex: 1 }}>{bowler.playerName}</AppText>
              <AppText size="sm" color={colors.text.secondary}>
                {bowler.overs}  {bowler.runs}r  {bowler.wickets}w
              </AppText>
            </View>
          </View>
        ) : null;
      })()}

      {match.result && (
        <View style={styles.resultBanner}>
          <Ionicons name="trophy" size={20} color={colors.status.warning} />
          <AppText size="base" weight="bold" style={{ marginLeft: spacing[2] }}>{match.result}</AppText>
        </View>
      )}
    </ScrollView>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const SpectatorScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();

  const [inputCode, setInputCode]       = useState(route.params?.shareCode ?? '');
  const [activeCode, setActiveCode]     = useState(route.params?.shareCode ?? '');
  const [submitted, setSubmitted]       = useState(!!route.params?.shareCode);

  const { data: fetchedMatch, isLoading, error } = useQuery<CricketMatch>({
    queryKey: ['cricket-spectate', activeCode],
    queryFn:  () => getMatchByCodeApi(activeCode).then((r) => r.data.data),
    enabled:  submitted && activeCode.length === 6,
    staleTime: 0,
    retry: false,
  });

  const { liveData, connected } = useCricketSocket({
    shareCode: activeCode,
    enabled:   submitted && activeCode.length === 6 && !!fetchedMatch,
  });

  const match = liveData ?? fetchedMatch;

  const handleJoin = () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) return;
    setActiveCode(code);
    setSubmitted(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <AppText size="lg" weight="bold">Watch Live</AppText>
        <View style={{ width: 24 }} />
      </View>

      {!submitted ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
          style={styles.codeEntry}
        >
          <Ionicons name="eye-outline" size={48} color={colors.text.tertiary} style={{ marginBottom: spacing[4] }} />
          <AppText size="xl" weight="bold" style={{ marginBottom: spacing[2] }}>Enter Share Code</AppText>
          <AppText size="sm" color={colors.text.secondary} style={{ textAlign: 'center', marginBottom: spacing[6] }}>
            Ask the scorer for the 6-character match code to follow the live score
          </AppText>
          <TextInput
            style={styles.codeInput}
            placeholder="e.g. A3F2B1"
            placeholderTextColor={colors.text.tertiary}
            value={inputCode}
            onChangeText={(t) => setInputCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Button
            label="Join Match"
            onPress={handleJoin}
            disabled={inputCode.trim().length !== 6}
            style={{ marginTop: spacing[4] }}
          />
        </MotiView>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: spacing[4] }}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.olive.primary} />
            </View>
          ) : error ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.center}
            >
              <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
              <AppText size="base" weight="semiBold" style={{ marginTop: spacing[3] }}>
                Match not found
              </AppText>
              <AppText size="sm" color={colors.text.secondary} style={{ marginTop: spacing[1] }}>
                Check the share code and try again
              </AppText>
              <Pressable
                onPress={() => { setSubmitted(false); setActiveCode(''); setInputCode(''); }}
                style={styles.retryBtn}
              >
                <AppText size="sm" weight="semiBold" color={colors.olive.primary}>Try Again</AppText>
              </Pressable>
            </MotiView>
          ) : match ? (
            <LiveScorecard match={match} connected={connected} />
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
  },
  codeEntry: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  codeInput: {
    width: '100%', backgroundColor: colors.bg.input,
    borderRadius: radius.lg, borderWidth: 2, borderColor: colors.olive.primary,
    padding: spacing[4], color: colors.text.primary,
    fontFamily: fontFamily.bold, fontSize: 28,
    textAlign: 'center', letterSpacing: 8,
  },
  retryBtn: { marginTop: spacing[5], padding: spacing[3] },
  // scorecard
  connRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing[2] },
  connDot:   { width: 8, height: 8, borderRadius: 4 },
  scoreCard: {
    alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderRadius: radius.xl, padding: spacing[5],
    borderWidth: 1, borderColor: colors.bg.border, marginBottom: spacing[4],
  },
  subRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  dot:       { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.text.tertiary },
  ballsRow:  { flexDirection: 'row', gap: spacing[2] },
  ballBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  section:      { marginBottom: spacing[3] },
  sectionTitle: { marginBottom: spacing[2] },
  playerRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[2] },
  playerRowActive: {
    backgroundColor: `${colors.olive.primary}10`,
    borderRadius: radius.sm, paddingHorizontal: spacing[2],
    marginHorizontal: -spacing[2],
  },
  playerName:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  strikerDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.olive.primary },
  resultBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.status.warning}15`,
    borderRadius: radius.lg, padding: spacing[4],
    borderWidth: 1, borderColor: `${colors.status.warning}30`,
    marginBottom: spacing[4],
  },
});
