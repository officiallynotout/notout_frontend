import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Badge, bookingStatusVariant } from '@/components/ui';
import { colors, radius, spacing } from '@/constants';
import { formatDate, formatTime } from '@/utils/formatters';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  index?:   number;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel, index = 0 }) => {
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <MotiView
      from={{ opacity: 0, translateX: -16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 60 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <AppText size="md" weight="bold" numberOfLines={1} style={styles.turfName}>
          {booking.turfName}
        </AppText>
        <Badge label={booking.status} variant={bookingStatusVariant(booking.status)} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.tertiary} />
          <AppText size="sm" color={colors.text.secondary} style={styles.infoText}>
            {formatDate(booking.date)}
          </AppText>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
          <AppText size="sm" color={colors.text.secondary} style={styles.infoText}>
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </AppText>
        </View>
      </View>

      {canCancel && onCancel ? (
        <Pressable onPress={() => onCancel(booking._id)} style={styles.cancelBtn}>
          <AppText size="sm" color={colors.status.error} weight="medium">
            Cancel Booking
          </AppText>
        </Pressable>
      ) : null}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.bg.border,
    padding:         spacing[4],
    marginBottom:    spacing[3],
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   spacing[3],
  },
  turfName: { flex: 1, marginRight: spacing[2] },
  infoRow: {
    gap: spacing[2],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  infoText: { marginLeft: 6 },
  cancelBtn: {
    marginTop:  spacing[3],
    paddingTop: spacing[3],
    borderTopWidth:  1,
    borderTopColor:  colors.bg.divider,
  },
});
