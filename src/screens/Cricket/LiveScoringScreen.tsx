import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { colors, spacing, radius, fontFamily, fontSize } from '@/constants';
import {
  logBallApi, setNextBatsmanApi, setNextBowlerApi,
  completeMatchApi, getMatchApi,
} from '@/api';
import type { AppStackParamList } from '@/navigation/types';
import type { CricketMatch, CricketBallRecord, DismissalType, CricketInnings } from '@/types';

type Nav   = NativeStackNavigationProp<AppStackParamList>;
type Route = RouteProp<AppStackParamList, 'CricketLiveScoring'>;

const DISMISSAL_OPTIONS: { value: DismissalType; label: string }[] = [
  { value: 'BOWLED',      label: 'Bowled' },
  { value: 'CAUGHT',      label: 'Caught' },
  { value: 'RUN_OUT',     label: 'Run Out' },
  { value: 'LBW',         label: 'LBW' },
  { value: 'STUMPED',     label: 'Stumped' },
  { value: 'HIT_WICKET',  label: 'Hit Wicket' },
  { value: 'RETIRED_HURT', label: 'Retired Hurt' },
];

// ── Ball badge ────────────────────────────────────────────────────────────────

const BallBadge: React.FC<{ ball: CricketBallRecord }> = ({ ball }) => {
  let label = '.';
  let bg    = colors.bg.tertiary;
  let color = colors.text.secondary;

  if (ball.isWicket)       { label = 'W';  bg = colors.status.error;   color = colors.white; }
  else if (ball.isWide)    { label = 'Wd'; bg = `${colors.status.warning}30`; color = colors.status.warning; }
  else if (ball.isNoBall)  { label = 'NB'; bg = `${colors.status.warning}30`; color = colors.status.warning; }
  else if (ball.runs === 4){ label = '4';  bg = `${colors.olive.primary}30`;  color = colors.olive.primary; }
  else if (ball.runs === 6){ label = '6';  bg = `${colors.olive.light}30`;    color = colors.olive.light; }
  else if (ball.runs > 0)  { label = String(ball.runs); bg = colors.bg.border; color = colors.text.primary; }

  return (
    <View style={[styles.ballBadge, { backgroundColor: bg }]}>
      <AppText size="xs" weight="bold" color={color}>{label}</AppText>
    </View>
  );
};

// ── Wicket modal ──────────────────────────────────────────────────────────────

interface WicketModalProps {
  visible:    boolean;
  batsmen:    string[];
  onConfirm:  (dismissal: DismissalType, dismissed: string) => void;
  onCancel:   () => void;
}

const WicketModal: React.FC<WicketModalProps> = ({ visible, batsmen, onConfirm, onCancel }) => {
  const [dismissal, setDismissal] = useState<DismissalType | null>(null);
  const [dismissed, setDismissed] = useState<string>('');

  const reset = () => { setDismissal(null); setDismissed(''); };

  const handleConfirm = () => {
    if (!dismissal || !dismissed) return;
    onConfirm(dismissal, dismissed);
    reset();
  };

  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <AppText size="lg" weight="bold" style={styles.modalTitle}>Wicket!</AppText>

          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.modalLabel}>
            HOW OUT
          </AppText>
          <View style={styles.chipRow}>
            {DISMISSAL_OPTIONS.map((d) => (
              <Pressable
                key={d.value}
                onPress={() => setDismissal(d.value)}
                style={[styles.chip, dismissal === d.value && styles.chipActive]}
              >
                <AppText
                  size="sm"
                  weight={dismissal === d.value ? 'bold' : 'regular'}
                  color={dismissal === d.value ? colors.white : colors.text.secondary}
                >
                  {d.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.modalLabel}>
            DISMISSED BATSMAN
          </AppText>
          <View style={styles.chipRow}>
            {batsmen.map((b) => (
              <Pressable
                key={b}
                onPress={() => setDismissed(b)}
                style={[styles.chip, dismissed === b && styles.chipActive]}
              >
                <AppText
                  size="sm"
                  weight={dismissed === b ? 'bold' : 'regular'}
                  color={dismissed === b ? colors.white : colors.text.secondary}
                >
                  {b}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.modalBtns}>
            <Pressable onPress={handleCancel} style={[styles.modalBtn, styles.modalBtnCancel]}>
              <AppText size="base" weight="semiBold" color={colors.text.secondary}>Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={!dismissal || !dismissed}
              style={[styles.modalBtn, styles.modalBtnConfirm, (!dismissal || !dismissed) && { opacity: 0.4 }]}
            >
              <AppText size="base" weight="bold" color={colors.white}>Confirm</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── New Bowler modal ───────────────────────────────────────────────────────────

interface NewBowlerModalProps {
  visible:   boolean;
  onConfirm: (name: string) => void;
  onCancel:  () => void;
}

const NewBowlerModal: React.FC<NewBowlerModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <AppText size="lg" weight="bold" style={styles.modalTitle}>Over Complete</AppText>
          <AppText size="sm" color={colors.text.secondary} style={{ marginBottom: spacing[4] }}>
            Enter the bowler for the next over
          </AppText>
          <TextInput
            style={styles.modalInput}
            placeholder="Bowler name"
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoFocus
          />
          <View style={styles.modalBtns}>
            <Pressable onPress={() => { setName(''); onCancel(); }} style={[styles.modalBtn, styles.modalBtnCancel]}>
              <AppText size="base" weight="semiBold" color={colors.text.secondary}>Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={() => { onConfirm(name.trim()); setName(''); }}
              disabled={!name.trim()}
              style={[styles.modalBtn, styles.modalBtnConfirm, !name.trim() && { opacity: 0.4 }]}
            >
              <AppText size="base" weight="bold" color={colors.white}>Set Bowler</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── New Batsman modal ─────────────────────────────────────────────────────────

interface NewBatsmanModalProps {
  visible:   boolean;
  onConfirm: (name: string, isOnStrike: boolean) => void;
  onCancel:  () => void;
}

const NewBatsmanModal: React.FC<NewBatsmanModalProps> = ({ visible, onConfirm, onCancel }) => {
  const [name, setName]           = useState('');
  const [isOnStrike, setStrike]   = useState(true);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <AppText size="lg" weight="bold" style={styles.modalTitle}>New Batsman</AppText>
          <TextInput
            style={styles.modalInput}
            placeholder="Batsman name"
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
            maxLength={50}
            autoFocus
          />
          <AppText size="sm" weight="semiBold" color={colors.text.secondary} style={styles.modalLabel}>
            COMING IN AT
          </AppText>
          <View style={styles.toggleRow}>
            {[true, false].map((s) => (
              <Pressable
                key={String(s)}
                onPress={() => setStrike(s)}
                style={[styles.toggleBtn, isOnStrike === s && styles.toggleBtnActive]}
              >
                <AppText size="sm" weight="semiBold"
                  color={isOnStrike === s ? colors.white : colors.text.secondary}>
                  {s ? 'On Strike' : 'Non-Strike'}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.modalBtns}>
            <Pressable onPress={() => { setName(''); onCancel(); }} style={[styles.modalBtn, styles.modalBtnCancel]}>
              <AppText size="base" weight="semiBold" color={colors.text.secondary}>Cancel</AppText>
            </Pressable>
            <Pressable
              onPress={() => { onConfirm(name.trim(), isOnStrike); setName(''); }}
              disabled={!name.trim()}
              style={[styles.modalBtn, styles.modalBtnConfirm, !name.trim() && { opacity: 0.4 }]}
            >
              <AppText size="base" weight="bold" color={colors.white}>Add Batsman</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export const LiveScoringScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const route       = useRoute<Route>();
  const insets      = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { matchId } = route.params;

  const [showWicket,    setShowWicket]    = useState(false);
  const [showBowler,    setShowBowler]    = useState(false);
  const [showBatsman,   setShowBatsman]   = useState(false);
  const [pendingWicket, setPendingWicket] = useState(false);
  const [showShareCode, setShowShareCode] = useState(false);

  const { data: match, isLoading } = useQuery<CricketMatch>({
    queryKey: ['cricket-match', matchId],
    queryFn:  () => getMatchApi(matchId).then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: (query) => query.state.data?.status === 'IN_PROGRESS' ? 30000 : false,
  });

  const activeInnings: CricketInnings | undefined = match?.innings.find(
    (i) => i.status === 'IN_PROGRESS',
  );

  const currentBatsmen = activeInnings?.batsmen.filter((b) => !b.isOut) ?? [];
  const striker        = activeInnings?.currentStrikeBatsman;
  const nonStriker     = activeInnings?.currentNonStrikeBatsman;
  const overDone       = (activeInnings?.currentLegalBallsInOver ?? 0) >= 6;

  const refetchMatch = () => queryClient.invalidateQueries({ queryKey: ['cricket-match', matchId] });

  const ballMutation = useMutation({
    mutationFn: (payload: Parameters<typeof logBallApi>[1]) => logBallApi(matchId, payload),
    onSuccess: (res) => {
      const updated: CricketMatch = res.data.data;
      queryClient.setQueryData(['cricket-match', matchId], updated);

      const updatedInnings = updated.innings.find((i) => i.status === 'IN_PROGRESS');

      // Over complete
      if (updatedInnings && updatedInnings.currentLegalBallsInOver === 0 &&
          updatedInnings.status === 'IN_PROGRESS') {
        setShowBowler(true);
      }

      // Innings complete
      if (updated.status === 'INNINGS_BREAK') {
        navigation.replace('CricketInningsBreak', { matchId });
      } else if (updated.status === 'COMPLETED') {
        navigation.replace('CricketMatchResult', { matchId });
      }

      // Wicket fell — need new batsman
      if (pendingWicket) {
        setPendingWicket(false);
        setShowBatsman(true);
      }
    },
    onError: () => Alert.alert('Error', 'Failed to record ball. Please try again.'),
  });

  const batsmanMutation = useMutation({
    mutationFn: (d: { playerName: string; isOnStrike: boolean }) => setNextBatsmanApi(matchId, d),
    onSuccess:  (res) => queryClient.setQueryData(['cricket-match', matchId], res.data.data),
    onError: () => Alert.alert('Error', 'Failed to add batsman.'),
  });

  const bowlerMutation = useMutation({
    mutationFn: (d: { bowlerName: string }) => setNextBowlerApi(matchId, d),
    onSuccess:  (res) => queryClient.setQueryData(['cricket-match', matchId], res.data.data),
    onError: () => Alert.alert('Error', 'Failed to set bowler.'),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeMatchApi(matchId),
    onSuccess: () => navigation.replace('CricketMatchResult', { matchId }),
    onError: () => Alert.alert('Error', 'Failed to complete match.'),
  });

  const handleBall = useCallback((payload: Parameters<typeof logBallApi>[1]) => {
    if (overDone) { setShowBowler(true); return; }
    if (!striker) { Alert.alert('Set Batsman', 'Please set the current batsman first.'); return; }
    if (!activeInnings?.currentBowlerName) { setShowBowler(true); return; }

    ballMutation.mutate({
      batsmanName: striker,
      bowlerName:  activeInnings.currentBowlerName,
      ...payload,
    });
  }, [overDone, striker, activeInnings, ballMutation]);

  const handleWicket = () => {
    if (overDone || !striker || !activeInnings?.currentBowlerName) return;
    setShowWicket(true);
  };

  const onWicketConfirm = (dismissal: DismissalType, dismissed: string) => {
    setShowWicket(false);
    setPendingWicket(true);
    ballMutation.mutate({
      batsmanName:          striker!,
      bowlerName:           activeInnings!.currentBowlerName!,
      isWicket:             true,
      dismissalType:        dismissal,
      dismissedBatsmanName: dismissed,
    });
  };

  const isMutating = ballMutation.isPending || batsmanMutation.isPending || bowlerMutation.isPending;

  if (isLoading || !match) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.olive.primary} />
      </View>
    );
  }

  if (!activeInnings) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <AppText size="base" color={colors.text.secondary}>No active innings</AppText>
      </View>
    );
  }

  const battingTeamName = activeInnings.battingTeam === 'team1' ? match.team1Name : match.team2Name;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <AppText size="base" weight="semiBold" numberOfLines={1} style={{ flex: 1, textAlign: 'center', marginHorizontal: spacing[2] }}>
          {match.team1Name} vs {match.team2Name}
        </AppText>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowShareCode((v) => !v)} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="share-social-outline" size={22} color={colors.olive.primary} />
          </Pressable>
          <Pressable
            onPress={() => Alert.alert(
              'End Match',
              'Are you sure you want to end the match?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End Match', style: 'destructive', onPress: () => completeMutation.mutate() },
              ],
            )}
            hitSlop={12}
          >
            <Ionicons name="flag-outline" size={22} color={colors.status.error} />
          </Pressable>
        </View>
      </View>

      {/* Share code reveal */}
      {showShareCode && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.shareCodeBanner}
        >
          <Ionicons name="people-outline" size={16} color={colors.text.secondary} />
          <AppText size="sm" color={colors.text.secondary} style={{ marginLeft: spacing[2] }}>
            Share code:
          </AppText>
          <AppText size="md" weight="bold" color={colors.olive.primary} style={styles.shareCodeText}>
            {match.shareCode}
          </AppText>
          <Pressable onPress={() => setShowShareCode(false)} hitSlop={8} style={{ marginLeft: 'auto' }}>
            <Ionicons name="close" size={16} color={colors.text.tertiary} />
          </Pressable>
        </MotiView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing[4] }}>
        {/* Scoreboard */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.scoreboard}
        >
          <AppText size="sm" color={colors.text.secondary} weight="semiBold">
            Innings {activeInnings.inningsNumber} • {battingTeamName}
          </AppText>
          <AppText size="3xl" weight="bold" style={styles.score}>
            {activeInnings.totalRuns}/{activeInnings.totalWickets}
          </AppText>
          <View style={styles.scoreDetails}>
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

          {/* This over */}
          {activeInnings.recentBalls.length > 0 && (
            <View style={styles.thisOver}>
              <AppText size="xs" color={colors.text.tertiary} weight="semiBold" style={{ marginBottom: 6 }}>
                THIS OVER
              </AppText>
              <View style={styles.ballsRow}>
                {activeInnings.recentBalls.map((b, i) => (
                  <BallBadge key={b.id ?? i} ball={b} />
                ))}
              </View>
            </View>
          )}
        </MotiView>

        {/* Batsmen */}
        <View style={styles.section}>
          <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>
            BATTING
          </AppText>
          {currentBatsmen.map((b) => {
            const isStriker = b.playerName === striker;
            return (
              <View key={b.id} style={[styles.playerRow, isStriker && styles.playerRowActive]}>
                <View style={styles.playerName}>
                  {isStriker && <View style={styles.strikerDot} />}
                  <AppText size="base" weight={isStriker ? 'semiBold' : 'regular'}>{b.playerName}</AppText>
                </View>
                <AppText size="base" weight="bold">{b.runs}</AppText>
                <AppText size="sm" color={colors.text.tertiary} style={{ width: 32, textAlign: 'right' }}>({b.balls})</AppText>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText size="xs" color={colors.text.tertiary}>SR {b.strikeRate}</AppText>
                  <AppText size="xs" color={colors.text.tertiary}>4s:{b.fours} 6s:{b.sixes}</AppText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bowler */}
        {activeInnings.currentBowlerName && (() => {
          const bowlerRecord = activeInnings.bowlers.find(
            (b) => b.playerName === activeInnings.currentBowlerName,
          );
          return bowlerRecord ? (
            <View style={styles.section}>
              <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>
                BOWLING
              </AppText>
              <View style={styles.playerRow}>
                <AppText size="base" weight="semiBold" style={{ flex: 1 }}>{bowlerRecord.playerName}</AppText>
                <AppText size="sm" color={colors.text.secondary}>
                  {bowlerRecord.overs}  {bowlerRecord.runs}r  {bowlerRecord.wickets}w
                </AppText>
                <AppText size="xs" color={colors.text.tertiary} style={{ marginLeft: spacing[2] }}>
                  Eco {bowlerRecord.economy.toFixed(1)}
                </AppText>
              </View>
            </View>
          ) : null;
        })()}

        {/* Extras */}
        {match.trackExtras && (
          <View style={styles.section}>
            <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>
              EXTRAS
            </AppText>
            <View style={styles.extrasRow}>
              {[
                { label: 'Wides', value: activeInnings.extras.wides },
                { label: 'NB',    value: activeInnings.extras.noBalls },
                { label: 'Byes',  value: activeInnings.extras.byes },
                { label: 'LB',    value: activeInnings.extras.legByes },
                { label: 'Total', value: activeInnings.extras.total },
              ].map((e) => (
                <View key={e.label} style={styles.extraItem}>
                  <AppText size="xs" color={colors.text.tertiary}>{e.label}</AppText>
                  <AppText size="base" weight="semiBold">{e.value}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ball input pad */}
        <View style={styles.section}>
          <AppText size="xs" weight="semiBold" color={colors.text.tertiary} style={styles.sectionTitle}>
            LOG BALL
          </AppText>
          {overDone ? (
            <Pressable style={styles.overDoneBanner} onPress={() => setShowBowler(true)}>
              <Ionicons name="refresh-circle-outline" size={20} color={colors.status.warning} />
              <AppText size="sm" weight="semiBold" color={colors.status.warning} style={{ marginLeft: 6 }}>
                Over complete — set next bowler
              </AppText>
            </Pressable>
          ) : (
            <>
              <View style={styles.ballPadRow}>
                {[0, 1, 2, 3, 4, 6].map((r) => (
                  <Pressable
                    key={r}
                    disabled={isMutating}
                    onPress={() => handleBall({ runs: r })}
                    style={[styles.ballBtn, isMutating && { opacity: 0.5 }]}
                  >
                    <AppText size="md" weight="bold" color={
                      r === 4 ? colors.olive.primary :
                      r === 6 ? colors.olive.light : colors.text.primary
                    }>{r}</AppText>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.ballPadRow, { marginTop: spacing[2] }]}>
                <Pressable
                  disabled={isMutating}
                  onPress={handleWicket}
                  style={[styles.ballBtn, styles.ballBtnWicket, isMutating && { opacity: 0.5 }]}
                >
                  <AppText size="md" weight="bold" color={colors.white}>W</AppText>
                </Pressable>
                {match.trackExtras && (
                  <>
                    <Pressable
                      disabled={isMutating}
                      onPress={() => handleBall({ isWide: true, runs: 0 })}
                      style={[styles.ballBtn, styles.ballBtnExtra, isMutating && { opacity: 0.5 }]}
                    >
                      <AppText size="sm" weight="bold" color={colors.status.warning}>Wd</AppText>
                    </Pressable>
                    <Pressable
                      disabled={isMutating}
                      onPress={() => handleBall({ isNoBall: true, runs: 0 })}
                      style={[styles.ballBtn, styles.ballBtnExtra, isMutating && { opacity: 0.5 }]}
                    >
                      <AppText size="sm" weight="bold" color={colors.status.warning}>NB</AppText>
                    </Pressable>
                    <Pressable
                      disabled={isMutating}
                      onPress={() => handleBall({ isBye: true, runs: 1 })}
                      style={[styles.ballBtn, styles.ballBtnExtra, isMutating && { opacity: 0.5 }]}
                    >
                      <AppText size="sm" weight="bold" color={colors.text.secondary}>Bye</AppText>
                    </Pressable>
                    <Pressable
                      disabled={isMutating}
                      onPress={() => handleBall({ isLegBye: true, runs: 1 })}
                      style={[styles.ballBtn, styles.ballBtnExtra, isMutating && { opacity: 0.5 }]}
                    >
                      <AppText size="sm" weight="bold" color={colors.text.secondary}>LB</AppText>
                    </Pressable>
                  </>
                )}
                {isMutating && (
                  <ActivityIndicator size="small" color={colors.olive.primary} style={{ marginLeft: spacing[2] }} />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <WicketModal
        visible={showWicket}
        batsmen={currentBatsmen.map((b) => b.playerName)}
        onConfirm={onWicketConfirm}
        onCancel={() => setShowWicket(false)}
      />
      <NewBowlerModal
        visible={showBowler}
        onConfirm={(name) => { setShowBowler(false); bowlerMutation.mutate({ bowlerName: name }); }}
        onCancel={() => setShowBowler(false)}
      />
      <NewBatsmanModal
        visible={showBatsman}
        onConfirm={(name, isOnStrike) => {
          setShowBatsman(false);
          batsmanMutation.mutate({ playerName: name, isOnStrike });
        }}
        onCancel={() => setShowBatsman(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bg.primary },
  center:     { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 1, borderBottomColor: colors.bg.border,
  },
  headerActions:  { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  headerBtn:      {},
  shareCodeBanner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: `${colors.olive.primary}10`,
    borderBottomWidth: 1, borderBottomColor: `${colors.olive.primary}25`,
  },
  shareCodeText:  { marginLeft: spacing[2], letterSpacing: 3 },
  scoreboard: {
    alignItems: 'center', padding: spacing[5],
    backgroundColor: colors.bg.secondary,
    borderBottomWidth: 1, borderBottomColor: colors.bg.border,
  },
  score:        { marginTop: spacing[1] },
  scoreDetails: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] },
  dot:          { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.text.tertiary },
  thisOver:     { marginTop: spacing[4], alignItems: 'center' },
  ballsRow:     { flexDirection: 'row', gap: spacing[2] },
  ballBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  section:      { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  sectionTitle: { marginBottom: spacing[2] },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing[2], gap: spacing[2],
  },
  playerRowActive: {
    backgroundColor: `${colors.olive.primary}10`,
    borderRadius: radius.sm, paddingHorizontal: spacing[2],
    marginHorizontal: -spacing[2],
  },
  playerName:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  strikerDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.olive.primary },
  extrasRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  extraItem:    { alignItems: 'center' },
  overDoneBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${colors.status.warning}15`,
    borderRadius: radius.md, padding: spacing[4],
    borderWidth: 1, borderColor: `${colors.status.warning}30`,
  },
  ballPadRow:  { flexDirection: 'row', gap: spacing[2] },
  ballBtn: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: colors.bg.secondary,
    borderWidth: 1.5, borderColor: colors.bg.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ballBtnWicket: { backgroundColor: colors.status.error, borderColor: colors.status.error },
  ballBtnExtra:  { borderColor: `${colors.status.warning}60` },
  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg.secondary,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing[5], paddingBottom: spacing[8],
  },
  modalTitle:  { marginBottom: spacing[4] },
  modalLabel:  { marginTop: spacing[4], marginBottom: spacing[2] },
  modalInput: {
    backgroundColor: colors.bg.input, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.bg.border,
    padding: spacing[4], color: colors.text.primary,
    fontFamily: fontFamily.regular, fontSize: fontSize.base,
  },
  modalBtns:      { flexDirection: 'row', gap: spacing[3], marginTop: spacing[5] },
  modalBtn:       { flex: 1, paddingVertical: spacing[4], borderRadius: radius.md, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: colors.bg.tertiary },
  modalBtnConfirm: { backgroundColor: colors.olive.primary },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.bg.border,
    backgroundColor: colors.bg.tertiary,
  },
  chipActive:      { backgroundColor: colors.olive.primary, borderColor: colors.olive.primary },
  toggleRow:       { flexDirection: 'row', gap: spacing[3] },
  toggleBtn: {
    flex: 1, paddingVertical: spacing[3], borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.bg.border,
    alignItems: 'center', backgroundColor: colors.bg.tertiary,
  },
  toggleBtnActive: { backgroundColor: colors.olive.primary, borderColor: colors.olive.primary },
});
