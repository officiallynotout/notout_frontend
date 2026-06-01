import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AppText } from '@/components/ui';
import { colors, radius, spacing } from '@/constants';
import { useHaptics } from '@/hooks';
import type { Slot } from '@/types';

interface SlotChipProps {
  slot:       Slot;
  selected:   boolean;
  onPress:    (slot: Slot) => void;
}

export const SlotChip: React.FC<SlotChipProps> = ({ slot, selected, onPress }) => {
  const { selection } = useHaptics();
  const isAvailable   = slot.status === 'available';
  const isBooked      = slot.status === 'booked';

  const bgColor = selected
    ? colors.olive.primary
    : isBooked
    ? colors.bg.tertiary
    : colors.bg.secondary;

  const borderColor = selected
    ? colors.olive.primary
    : isBooked
    ? colors.bg.border
    : colors.bg.border;

  const textColor = selected
    ? colors.text.inverse
    : isBooked
    ? colors.text.disabled
    : isAvailable
    ? colors.text.primary
    : colors.status.warning;

  const handlePress = () => {
    if (!isAvailable && !selected) return;
    selection();
    onPress(slot);
  };

  return (
    <Pressable onPress={handlePress} disabled={isBooked} style={styles.wrapper}>
      <MotiView
        animate={{ backgroundColor: bgColor, borderColor, scale: selected ? 1.03 : 1 }}
        transition={{ type: 'timing', duration: 150 }}
        style={styles.chip}
      >
        <AppText size="sm" weight={selected ? 'semiBold' : 'regular'} color={textColor} align="center">
          {slot.startTime}
        </AppText>
        <AppText size="xs" color={selected ? colors.text.inverse : colors.text.tertiary} align="center">
          {slot.endTime}
        </AppText>
        <AppText size="xs" weight="medium" color={textColor} align="center">
          ₹{slot.price}
        </AppText>
      </MotiView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '30%', marginBottom: spacing[3] },
  chip: {
    borderRadius:  radius.md,
    borderWidth:   1.5,
    paddingVertical: spacing[2] + 2,
    paddingHorizontal: spacing[1],
    alignItems:    'center',
    gap:           2,
  },
});
