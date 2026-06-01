import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { BookingCard, EmptyState } from '@/components/common';
import { colors, spacing } from '@/constants';
import { getMyBookingsApi, cancelBookingApi } from '@/api';
import { useHaptics } from '@/hooks';
import type { Booking } from '@/types';

export const MyBookingsScreen: React.FC = () => {
  const insets      = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { warning } = useHaptics();

  const {
    data: bookings,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn:  () => getMyBookingsApi().then((r) => r.data.data),
    staleTime: 1000 * 30,
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id: string) => cancelBookingApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not cancel booking.');
    },
  });

  const handleCancel = useCallback(
    (id: string) => {
      warning();
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelBooking(id) },
        ],
      );
    },
    [warning, cancelBooking],
  );

  const upcoming = (bookings ?? []).filter(
    (b: Booking) => b.status !== 'cancelled' && new Date(b.date) >= new Date(new Date().toDateString()),
  );
  const past = (bookings ?? []).filter(
    (b: Booking) => b.status === 'cancelled' || new Date(b.date) < new Date(new Date().toDateString()),
  );

  const sections = [
    ...(upcoming.length > 0 ? [{ type: 'header', label: 'Upcoming' }, ...upcoming.map((b: Booking) => ({ type: 'booking', data: b }))] : []),
    ...(past.length > 0 ? [{ type: 'header', label: 'Past & Cancelled' }, ...past.map((b: Booking) => ({ type: 'booking', data: b }))] : []),
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Page header */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 350 }}
        style={styles.pageHeader}
      >
        <AppText size="2xl" weight="bold">
          My Bookings
        </AppText>
        {bookings ? (
          <AppText size="sm" color={colors.text.tertiary}>
            {bookings.length} total
          </AppText>
        ) : null}
      </MotiView>

      {isLoading ? (
        <View style={styles.listPad}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.bookingSkeleton} />
          ))}
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, idx) =>
            item.type === 'header' ? `header-${idx}` : (item as any).data._id
          }
          contentContainerStyle={[
            styles.listPad,
            { paddingBottom: insets.bottom + spacing[4] },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.olive.primary}
              colors={[colors.olive.primary]}
            />
          }
          renderItem={({ item, index }) => {
            if (item.type === 'header') {
              return (
                <AppText
                  size="xs"
                  weight="semiBold"
                  color={colors.text.tertiary}
                  uppercase
                  tracking="wider"
                  style={styles.sectionHeader}
                >
                  {(item as any).label}
                </AppText>
              );
            }
            const booking: Booking = (item as any).data;
            return (
              <BookingCard
                booking={booking}
                onCancel={handleCancel}
                index={index}
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No bookings yet"
              description="Book a turf to see your upcoming matches here."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.bg.primary,
  },
  pageHeader: {
    flexDirection:    'row',
    alignItems:       'baseline',
    justifyContent:   'space-between',
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[4],
    paddingBottom:     spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  listPad: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  sectionHeader: { marginBottom: spacing[2], marginTop: spacing[1] },
  bookingSkeleton: {
    height:          90,
    backgroundColor: colors.bg.secondary,
    borderRadius:    12,
    marginBottom:    12,
    opacity:         0.5,
  },
});
