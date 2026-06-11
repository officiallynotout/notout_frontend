import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Badge } from '@/components/ui';
import { colors, radius, spacing } from '@/constants';
import { resolveImageUrl } from '@/utils';
import type { Turf } from '@/types';

interface TurfCardProps {
  turf:    Turf;
  onPress: () => void;
  index?:  number;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80';

export const TurfCard: React.FC<TurfCardProps> = ({ turf, onPress, index = 0 }) => {
  const [pressed, setPressed] = React.useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 60 }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <MotiView
          animate={{ scale: pressed ? 0.98 : 1 }}
          transition={{ type: 'timing', duration: 80 }}
          style={styles.card}
        >
          <Image
            source={{ uri: resolveImageUrl(turf.images?.[0]) || PLACEHOLDER }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="reload"
          />

          <View style={styles.body}>
            <View style={styles.topRow}>
              <AppText size="md" weight="bold" style={styles.name} numberOfLines={1}>
                {turf.name}
              </AppText>
              <View style={styles.priceTag}>
                <AppText size="xs" color={colors.olive.primary} weight="semiBold">
                  ₹{turf.pricePerHour}
                </AppText>
                <AppText size="xs" color={colors.text.tertiary}>
                  /hr
                </AppText>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.text.tertiary} />
              <AppText
                size="sm"
                color={colors.text.secondary}
                style={styles.locationText}
                numberOfLines={1}
              >
                {turf.location.address}, {turf.location.city}
              </AppText>
            </View>

            {turf.amenities.length > 0 ? (
              <View style={styles.amenitiesRow}>
                {turf.amenities.slice(0, 3).map((a) => (
                  <Badge key={a} label={a} variant="olive" />
                ))}
                {turf.amenities.length > 3 ? (
                  <AppText size="xs" color={colors.text.tertiary}>
                    +{turf.amenities.length - 3}
                  </AppText>
                ) : null}
              </View>
            ) : null}

            <View style={styles.footer}>
              <Ionicons name="time-outline" size={13} color={colors.text.tertiary} />
              <AppText size="xs" color={colors.text.tertiary} style={styles.hoursText}>
                {turf.operatingHours.open} – {turf.operatingHours.close}
              </AppText>
            </View>
          </View>
        </MotiView>
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius:    radius.lg,
    borderWidth:     1,
    borderColor:     colors.bg.border,
    overflow:        'hidden',
    marginBottom:    spacing[3],
  },
  image: {
    width:  '100%',
    height: 150,
  },
  body: {
    padding: spacing[4],
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   spacing[2],
  },
  name:    { flex: 1, marginRight: spacing[2] },
  priceTag: {
    flexDirection: 'row',
    alignItems:    'baseline',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  spacing[3],
  },
  locationText: { marginLeft: 4, flex: 1 },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  spacing[3],
  },
  footer: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  hoursText: { marginLeft: 4 },
});
