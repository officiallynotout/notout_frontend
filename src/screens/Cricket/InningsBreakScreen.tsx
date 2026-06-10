import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getMatchApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';
import type { CricketMatch } from '@/types';

type Nav   = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CricketInningsBreak'>;

export const InningsBreakScreen: React.FC = () => {
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
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.olive.primary} />
      </View>
    );
  }

  const innings1 = match.innings.find((i) => i.inningsNumber === 1);
  if (!innings1) return null;

  const battingFirstName  = match.battingFirst === 'team1' ? match.team1Name : match.team2Name;
  const battingSecondName = match.battingFirst === 'team1' ? match.team2Name : match.team1Name;
  const target            = innings1.totalRuns + 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.content}
      >
        <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.label}>
          INNINGS BREAK
        </AppText>

        {/* 1st Innings summary */}
        <View style={styles.scoreCard}>
          <AppText size="sm" color={colors.text.secondary}>{battingFirstName} scored</AppText>
          <AppText size="4xl" weight="bold" style={styles.bigScore}>
            {innings1.totalRuns}/{innings1.totalWickets}
          </AppText>
          <AppText size="base" color={colors.text.secondary}>in {innings1.overs} overs</AppText>
        </View>

        {/* Target */}
        <View style={styles.targetCard}>
          <AppText size="base" color={colors.text.secondary}>{battingSecondName} need</AppText>
          <AppText size="4xl" weight="bold" color={colors.status.warning} style={{ marginVertical: spacing[1] }}>
            {target}
          </AppText>
          <AppText size="base" color={colors.text.secondary}>
            to win in {match.totalOvers} overs
          </AppText>
        </View>

        {/* Top batsmen */}
        {innings1.batsmen.length > 0 && (
          <View style={styles.statsBox}>
            <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.statsTitle}>
              TOP SCORES
            </AppText>
            {innings1.batsmen
              .sort((a, b) => b.runs - a.runs)
              .slice(0, 3)
              .map((b) => (
                <View key={b.id} style={styles.statsRow}>
                  <AppText size="sm" style={{ flex: 1 }}>{b.playerName}</AppText>
                  <AppText size="sm" weight="bold">{b.runs}</AppText>
                  <AppText size="xs" color={colors.text.tertiary} style={{ width: 40, textAlign: 'right' }}>
                    ({b.balls})
                  </AppText>
                </View>
              ))}
          </View>
        )}
      </MotiView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          label={`Start ${battingSecondName}'s Innings`}
          onPress={() => navigation.replace('CricketStartInnings', {
            matchId,
            isSecondInnings: true,
            target,
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg.primary },
  center:     { alignItems: 'center', justifyContent: 'center' },
  content:    { flex: 1, padding: spacing[5], alignItems: 'center', justifyContent: 'center' },
  label:      { marginBottom: spacing[4], letterSpacing: 1 },
  scoreCard: {
    alignItems: 'center', backgroundColor: colors.bg.secondary,
    borderRadius: radius.xl, padding: spacing[6], width: '100%',
    borderWidth: 1, borderColor: colors.bg.border, marginBottom: spacing[4],
  },
  bigScore: { marginVertical: spacing[2] },
  targetCard: {
    alignItems: 'center', backgroundColor: `${colors.status.warning}10`,
    borderRadius: radius.xl, padding: spacing[6], width: '100%',
    borderWidth: 1, borderColor: `${colors.status.warning}30`, marginBottom: spacing[4],
  },
  statsBox: {
    width: '100%', backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg, padding: spacing[4],
    borderWidth: 1, borderColor: colors.bg.border,
  },
  statsTitle: { marginBottom: spacing[2] },
  statsRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[1] },
  footer:     { paddingHorizontal: spacing[5], paddingTop: spacing[3] },
});
