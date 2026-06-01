import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText, Card, Badge, bookingStatusVariant } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getAdminStatsApi, getAllBookingsApi } from '@/api';
import { useAppSelector } from '@/store';
import { formatDate, formatTime } from '@/utils/formatters';
import type { AdminStats, AdminBooking } from '@/types';

type StatCardProps = {
  label:  string;
  value:  number | string;
  icon:   React.ComponentProps<typeof Ionicons>['name'];
  color:  string;
  delay?: number;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, delay = 0 }) => (
  <MotiView
    from={{ opacity: 0, translateY: 12 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 350, delay }}
    style={[styles.statCard, { borderColor: `${color}30` }]}
  >
    <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <AppText size="2xl" weight="bold" color={color} style={styles.statValue}>
      {value}
    </AppText>
    <AppText size="xs" color={colors.text.secondary} weight="medium">
      {label}
    </AppText>
  </MotiView>
);

export const AdminDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const user   = useAppSelector((s) => s.auth.user);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
    isRefetching: statsRefetching,
  } = useQuery<AdminStats>({
    queryKey:  ['admin-stats'],
    queryFn:   () => getAdminStatsApi().then((r) => r.data.data),
    staleTime: 1000 * 30,
  });

  const {
    data: bookings,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery<AdminBooking[]>({
    queryKey:  ['admin-bookings'],
    queryFn:   () => getAllBookingsApi().then((r) => r.data.data),
    staleTime: 1000 * 30,
  });

  const isRefreshing = statsRefetching;

  const onRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  const recentBookings = (bookings ?? []).slice(0, 6);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.olive.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.header}
      >
        <View>
          <AppText size="sm" color={colors.text.secondary}>Welcome back,</AppText>
          <AppText size="xl" weight="bold">{user?.name?.split(' ')[0] ?? 'Admin'} 👋</AppText>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color={colors.olive.primary} />
          <AppText size="xs" weight="semiBold" color={colors.olive.primary} style={styles.adminBadgeText}>
            Admin
          </AppText>
        </View>
      </MotiView>

      {/* Stats grid */}
      <AppText size="sm" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
        Overview
      </AppText>

      {statsLoading ? (
        <View style={styles.statsGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.statCard, styles.skeletonCard]} />
          ))}
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label="Today's Bookings"  value={stats?.today ?? 0}       icon="today-outline"        color={colors.olive.primary}   delay={0}   />
          <StatCard label="Total Bookings"    value={stats?.total ?? 0}       icon="receipt-outline"      color={colors.status.info}     delay={60}  />
          <StatCard label="Confirmed"         value={stats?.confirmed ?? 0}   icon="checkmark-circle-outline" color={colors.status.success} delay={120} />
          <StatCard label="Cancelled"         value={stats?.cancelled ?? 0}   icon="close-circle-outline" color={colors.status.error}    delay={180} />
          <StatCard label="Pending"           value={stats?.pending ?? 0}     icon="hourglass-outline"    color={colors.status.warning}  delay={240} />
          <StatCard label="Active Turfs"      value={stats?.activeTurfs ?? 0} icon="location-outline"     color={colors.olive.light}     delay={300} />
        </View>
      )}

      {/* Recent bookings */}
      <AppText size="sm" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
        Recent Bookings
      </AppText>

      {bookingsLoading ? (
        [0, 1, 2].map((i) => <View key={i} style={styles.skeletonRow} />)
      ) : recentBookings.length === 0 ? (
        <AppText size="sm" color={colors.text.tertiary} align="center" style={styles.empty}>
          No bookings yet
        </AppText>
      ) : (
        recentBookings.map((booking, i) => (
          <MotiView
            key={booking._id}
            from={{ opacity: 0, translateX: -12 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 300, delay: i * 50 }}
          >
            <Card style={styles.bookingRow}>
              <View style={styles.bookingMain}>
                <View style={styles.bookingInfo}>
                  <AppText size="sm" weight="semiBold" numberOfLines={1} style={styles.bookingTurf}>
                    {booking.turfName}
                  </AppText>
                  <AppText size="xs" color={colors.text.secondary}>
                    {typeof booking.user === 'object' ? booking.user.name : '—'}
                  </AppText>
                </View>
                <Badge label={booking.status} variant={bookingStatusVariant(booking.status)} />
              </View>
              <View style={styles.bookingMeta}>
                <Ionicons name="calendar-outline" size={12} color={colors.text.tertiary} />
                <AppText size="xs" color={colors.text.tertiary} style={styles.metaText}>
                  {formatDate(booking.date)}
                </AppText>
                <Ionicons name="time-outline" size={12} color={colors.text.tertiary} style={styles.metaIcon} />
                <AppText size="xs" color={colors.text.tertiary} style={styles.metaText}>
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </AppText>
              </View>
            </Card>
          </MotiView>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bg.primary },
  content:     { paddingHorizontal: spacing[4], paddingBottom: spacing[10] },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     spacing[4],
    paddingBottom:  spacing[4],
  },
  adminBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  `${colors.olive.primary}18`,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   6,
    borderWidth:      1,
    borderColor:      `${colors.olive.primary}40`,
  },
  adminBadgeText: { marginLeft: 4 },
  sectionLabel:   { marginBottom: spacing[3], marginTop: spacing[2] },
  statsGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing[3],
    marginBottom:   spacing[4],
  },
  statCard: {
    width:            '47%',
    backgroundColor:  colors.bg.secondary,
    borderRadius:     radius.lg,
    borderWidth:      1,
    borderColor:      colors.bg.border,
    padding:          spacing[4],
    gap:              spacing[1],
  },
  statIcon:  { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[1] },
  statValue: { lineHeight: 32 },
  skeletonCard: { height: 110, backgroundColor: colors.bg.tertiary, borderColor: colors.bg.border },
  bookingRow: { marginBottom: spacing[2], padding: spacing[3] },
  bookingMain: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing[2],
  },
  bookingInfo:  { flex: 1, marginRight: spacing[2] },
  bookingTurf:  { marginBottom: 2 },
  bookingMeta:  { flexDirection: 'row', alignItems: 'center' },
  metaText:     { marginLeft: 4 },
  metaIcon:     { marginLeft: spacing[3] },
  skeletonRow:  { height: 72, backgroundColor: colors.bg.secondary, borderRadius: radius.lg, marginBottom: spacing[2] },
  empty:        { marginTop: spacing[4] },
});
