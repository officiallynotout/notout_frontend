import React from 'react';
import {
  View, FlatList, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { colors, spacing, radius } from '@/constants';
import { listMatchesApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';
import type { CricketMatchListItem } from '@/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const STATUS_COLOR: Record<string, string> = {
  SETUP:          colors.status.info,
  IN_PROGRESS:    colors.olive.primary,
  INNINGS_BREAK:  colors.status.warning,
  COMPLETED:      colors.text.tertiary,
};

const STATUS_LABEL: Record<string, string> = {
  SETUP:          'Setup',
  IN_PROGRESS:    'Live',
  INNINGS_BREAK:  'Break',
  COMPLETED:      'Done',
};

const MatchCard: React.FC<{ match: CricketMatchListItem; onPress: () => void; index: number }> = ({
  match, onPress, index,
}) => {
  const inn1 = match.innings.find((i) => i.inningsNumber === 1);
  const inn2 = match.innings.find((i) => i.inningsNumber === 2);
  const isLive = match.status === 'IN_PROGRESS';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 60 }}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <View style={styles.cardHeader}>
          <AppText size="base" weight="semiBold" numberOfLines={1} style={styles.teamText}>
            {match.team1Name} vs {match.team2Name}
          </AppText>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[match.status]}20` }]}>
            {isLive && <View style={styles.liveDot} />}
            <AppText size="xs" weight="semiBold" color={STATUS_COLOR[match.status]}>
              {STATUS_LABEL[match.status]}
            </AppText>
          </View>
        </View>

        {(inn1 || inn2) ? (
          <View style={styles.scoresRow}>
            {inn1 && (
              <View style={styles.scoreCol}>
                <AppText size="xs" color={colors.text.tertiary}>{match.team1Name}</AppText>
                <AppText size="md" weight="bold" color={colors.text.primary}>
                  {inn1.totalRuns}/{inn1.totalWickets}
                </AppText>
                <AppText size="xs" color={colors.text.tertiary}>{inn1.overs} ov</AppText>
              </View>
            )}
            {inn2 && (
              <>
                <View style={styles.vs}><AppText size="xs" color={colors.text.tertiary}>vs</AppText></View>
                <View style={styles.scoreCol}>
                  <AppText size="xs" color={colors.text.tertiary}>{match.team2Name}</AppText>
                  <AppText size="md" weight="bold" color={colors.text.primary}>
                    {inn2.totalRuns}/{inn2.totalWickets}
                  </AppText>
                  <AppText size="xs" color={colors.text.tertiary}>{inn2.overs} ov</AppText>
                </View>
              </>
            )}
          </View>
        ) : null}

        {match.result && (
          <AppText size="sm" color={colors.olive.primary} weight="semiBold" style={styles.result}>
            {match.result}
          </AppText>
        )}

        <View style={styles.cardFooter}>
          <AppText size="xs" color={colors.text.tertiary}>
            {match.totalOvers} overs
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
        </View>
      </Pressable>
    </MotiView>
  );
};

export const MatchHistoryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['cricket-matches'],
    queryFn:  () => listMatchesApi().then((r) => r.data.data as CricketMatchListItem[]),
    staleTime: 0,
  });

  const handleMatchPress = (match: CricketMatchListItem) => {
    if (match.status === 'SETUP') {
      navigation.navigate('CricketStartInnings', { matchId: match.matchId });
    } else if (match.status === 'IN_PROGRESS' || match.status === 'INNINGS_BREAK') {
      navigation.navigate('CricketLiveScoring', { matchId: match.matchId });
    } else {
      navigation.navigate('CricketMatchResult', { matchId: match.matchId });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 350 }}
        style={styles.header}
      >
        <View>
          <AppText size="xl" weight="bold">Scoreboard</AppText>
          <AppText size="sm" color={colors.text.secondary}>Your cricket matches</AppText>
        </View>
        <Pressable
          style={styles.watchBtn}
          onPress={() => navigation.navigate('CricketSpectator', {})}
        >
          <Ionicons name="eye-outline" size={16} color={colors.olive.primary} />
          <AppText size="sm" weight="semiBold" color={colors.olive.primary} style={{ marginLeft: 4 }}>
            Watch
          </AppText>
        </Pressable>
      </MotiView>

      {isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.card, styles.skeleton]} />
          ))}
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.matchId}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.olive.primary}
              colors={[colors.olive.primary]}
            />
          }
          renderItem={({ item, index }) => (
            <MatchCard match={item} index={index} onPress={() => handleMatchPress(item)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="baseball-outline"
              title="No matches yet"
              description="Start your first cricket match and track every ball."
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + spacing[5] }]}
        onPress={() => navigation.navigate('CricketNewMatch')}
      >
        <Ionicons name="add" size={26} color={colors.white} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[3],
  },
  watchBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.olive.primary,
  },
  list:     { paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.bg.border, padding: spacing[4],
    marginBottom: spacing[3],
  },
  skeleton: { height: 110, opacity: 0.4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  teamText:   { flex: 1, marginRight: spacing[2] },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[2], paddingVertical: 3,
    borderRadius: radius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.olive.primary },
  scoresRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[2] },
  scoreCol:  { flex: 1, alignItems: 'center' },
  vs:        { paddingHorizontal: spacing[2] },
  result:    { marginBottom: spacing[2] },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fab: {
    position: 'absolute', right: spacing[5],
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.olive.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.olive.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
});
