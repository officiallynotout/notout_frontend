import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText, Card, Badge, bookingStatusVariant } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getAllBookingsApi } from '@/api';
import { formatDate, formatTime } from '@/utils/formatters';
import type { AdminBooking, BookingStatus } from '@/types';

type Filter = 'all' | BookingStatus;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',       value: 'all'       },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending',   value: 'pending'   },
  { label: 'Cancelled', value: 'cancelled' },
];

export const AdminBookingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: bookings, isLoading, refetch, isRefetching } = useQuery<AdminBooking[]>({
    queryKey:  ['admin-bookings'],
    queryFn:   () => getAllBookingsApi().then((r) => r.data.data),
    staleTime: 1000 * 30,
  });

  const filtered = useMemo(() => {
    if (!bookings) return [];
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const counts = useMemo(() => {
    if (!bookings) return { all: 0, confirmed: 0, pending: 0, cancelled: 0 };
    return {
      all:       bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      pending:   bookings.filter((b) => b.status === 'pending').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  const renderItem = ({ item, index }: { item: AdminBooking; index: number }) => {
    const userName = typeof item.user === 'object' ? item.user.name : '—';

    return (
      <MotiView
        from={{ opacity: 0, translateX: -10 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: 'timing', duration: 300, delay: index * 40 }}
      >
        <Card style={styles.card}>
          {/* Top row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <AppText size="md" weight="bold" numberOfLines={1} style={styles.turfName}>
                {item.turfName}
              </AppText>
              <View style={styles.userRow}>
                <Ionicons name="person-outline" size={12} color={colors.text.tertiary} />
                <AppText size="xs" color={colors.text.secondary} style={styles.userName}>
                  {userName}
                </AppText>
              </View>
            </View>
            <Badge label={item.status} variant={bookingStatusVariant(item.status)} />
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={colors.text.tertiary} />
              <AppText size="sm" color={colors.text.secondary} style={styles.metaText}>
                {formatDate(item.date)}
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
              <AppText size="sm" color={colors.text.secondary} style={styles.metaText}>
                {formatTime(item.startTime)} – {formatTime(item.endTime)}
              </AppText>
            </View>
          </View>
        </Card>
      </MotiView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText size="xl" weight="bold">All Bookings</AppText>
        <AppText size="sm" color={colors.text.secondary}>
          {bookings ? `${counts.all} total` : '—'}
        </AppText>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterWrap}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count  = counts[f.value];
          return (
            <Pressable
              key={f.value}
              style={[styles.filterBtn, active && styles.filterBtnActive]}
              onPress={() => setFilter(f.value)}
            >
              <AppText
                size="sm"
                weight={active ? 'semiBold' : 'regular'}
                color={active ? colors.olive.primary : colors.text.secondary}
              >
                {f.label}
              </AppText>
              {count > 0 && (
                <View style={[styles.filterCount, active && styles.filterCountActive]}>
                  <AppText size="xs" weight="bold" color={active ? colors.olive.primary : colors.text.tertiary}>
                    {count}
                  </AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletons}>
              {[0, 1, 2, 3].map((i) => <View key={i} style={styles.skeleton} />)}
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={40} color={colors.text.disabled} />
              <AppText size="sm" color={colors.text.tertiary} align="center" style={styles.emptyText}>
                No {filter === 'all' ? '' : filter} bookings
              </AppText>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  filterWrap: {
    flexDirection:    'row',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[3],
    gap:              spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  filterBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[2],
    borderRadius:     radius.full,
    gap:              spacing[1],
    borderWidth:      1,
    borderColor:      colors.bg.border,
  },
  filterBtnActive: {
    borderColor:     `${colors.olive.primary}60`,
    backgroundColor: `${colors.olive.primary}12`,
  },
  filterCount: {
    minWidth:         18,
    height:           18,
    borderRadius:     9,
    alignItems:       'center',
    justifyContent:   'center',
    backgroundColor:  colors.bg.tertiary,
    paddingHorizontal: 4,
  },
  filterCountActive: { backgroundColor: `${colors.olive.primary}22` },
  list:  { padding: spacing[4], paddingBottom: spacing[10] },
  card: { padding: spacing[4], marginBottom: spacing[3] },
  cardHeader: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   spacing[3],
  },
  cardTitleBlock: { flex: 1, marginRight: spacing[2] },
  turfName:       { marginBottom: 4 },
  userRow:        { flexDirection: 'row', alignItems: 'center' },
  userName:       { marginLeft: 4 },
  metaRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[3],
  },
  metaItem:  { flexDirection: 'row', alignItems: 'center' },
  metaText:  { marginLeft: 4 },
  skeletons: { gap: spacing[3] },
  skeleton:  { height: 90, backgroundColor: colors.bg.secondary, borderRadius: radius.lg },
  emptyWrap: { alignItems: 'center', paddingTop: spacing[12] },
  emptyText: { marginTop: spacing[3] },
});
