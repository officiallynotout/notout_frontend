import React from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getMatchApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';
import type { CricketMatch, CricketInnings } from '@/types';

type Nav   = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CricketMatchResult'>;

const InningsSummary: React.FC<{ innings: CricketInnings; teamName: string }> = ({ innings, teamName }) => (
  <View style={styles.inningsCard}>
    <View style={styles.inningsHeader}>
      <AppText size="base" weight="bold">{teamName}</AppText>
      <AppText size="xl" weight="bold">
        {innings.totalRuns}/{innings.totalWickets}
      </AppText>
      <AppText size="sm" color={colors.text.secondary}>{innings.overs} overs</AppText>
    </View>

    {/* Batsmen */}
    <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.tableHeader}>
      BATTER
    </AppText>
    {innings.batsmen.map((b) => (
      <View key={b.id} style={styles.tableRow}>
        <View style={{ flex: 1 }}>
          <AppText size="sm">{b.playerName}</AppText>
          {b.isOut && b.dismissalType && (
            <AppText size="xs" color={colors.text.tertiary}>
              {b.dismissalType.replace('_', ' ').toLowerCase()}
            </AppText>
          )}
        </View>
        <AppText size="sm" weight="bold" style={{ width: 32, textAlign: 'right' }}>{b.runs}</AppText>
        <AppText size="xs" color={colors.text.tertiary} style={{ width: 40, textAlign: 'right' }}>
          ({b.balls})
        </AppText>
        <AppText size="xs" color={colors.text.tertiary} style={{ width: 56, textAlign: 'right' }}>
          4s:{b.fours} 6s:{b.sixes}
        </AppText>
      </View>
    ))}

    {/* Extras */}
    {innings.extras.total > 0 && (
      <View style={[styles.tableRow, { marginTop: spacing[1] }]}>
        <AppText size="sm" color={colors.text.secondary} style={{ flex: 1 }}>Extras</AppText>
        <AppText size="sm" weight="semiBold">{innings.extras.total}</AppText>
      </View>
    )}

    {/* Bowlers */}
    <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={[styles.tableHeader, { marginTop: spacing[4] }]}>
      BOWLER
    </AppText>
    {innings.bowlers.map((b) => (
      <View key={b.id} style={styles.tableRow}>
        <AppText size="sm" style={{ flex: 1 }}>{b.playerName}</AppText>
        <AppText size="xs" color={colors.text.secondary}>
          {b.overs}  {b.runs}r  {b.wickets}w
        </AppText>
        <AppText size="xs" color={colors.text.tertiary} style={{ width: 48, textAlign: 'right' }}>
          Eco {b.economy.toFixed(1)}
        </AppText>
      </View>
    ))}
  </View>
);

export const MatchResultScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const insets     = useSafeAreaInsets();
  const { matchId } = route.params;

  const { data: match, isLoading } = useQuery<CricketMatch>({
    queryKey: ['cricket-match', matchId],
    queryFn:  () => getMatchApi(matchId).then((r) => r.data.data),
    staleTime: 0,
  });

  if (isLoading || !match) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.olive.primary} />
      </View>
    );
  }

  const innings1 = match.innings.find((i) => i.inningsNumber === 1);
  const innings2 = match.innings.find((i) => i.inningsNumber === 2);

  const battingFirstName  = match.battingFirst === 'team1' ? match.team1Name : match.team2Name;
  const battingSecondName = match.battingFirst === 'team1' ? match.team2Name : match.team1Name;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('Tabs', undefined)}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <AppText size="lg" weight="bold">Match Result</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing[8] }}>
        {/* Result banner */}
        {match.result && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            style={styles.resultBanner}
          >
            <Ionicons name="trophy" size={32} color={colors.status.warning} />
            <AppText size="xl" weight="bold" style={{ marginTop: spacing[3], textAlign: 'center' }}>
              {match.result}
            </AppText>
          </MotiView>
        )}

        <View style={{ paddingHorizontal: spacing[4] }}>
          {innings1 && <InningsSummary innings={innings1} teamName={battingFirstName} />}
          {innings2 && <InningsSummary innings={innings2} teamName={battingSecondName} />}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg.primary },
  center:     { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
  },
  resultBanner: {
    alignItems: 'center', margin: spacing[4],
    backgroundColor: `${colors.status.warning}10`,
    borderRadius: radius.xl, padding: spacing[6],
    borderWidth: 1, borderColor: `${colors.status.warning}30`,
  },
  inningsCard: {
    backgroundColor: colors.bg.secondary, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.bg.border,
    padding: spacing[4], marginBottom: spacing[4],
  },
  inningsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing[3], paddingBottom: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.bg.border,
  },
  tableHeader: { marginBottom: spacing[2], letterSpacing: 0.5 },
  tableRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
});
