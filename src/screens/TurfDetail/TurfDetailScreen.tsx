import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, Badge, Card } from '@/components/ui';
import { Header, ImageSlider } from '@/components/common';
import { colors, spacing, radius } from '@/constants';
import { getTurfByIdApi } from '@/api';
import type { AppStackParamList } from '@/navigation/types';

type Route = NativeStackScreenProps<AppStackParamList, 'TurfDetail'>['route'];
type Nav   = NativeStackNavigationProp<AppStackParamList>;

const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: object }) => (
  <MotiView
    from={{ opacity: 0.4 }}
    animate={{ opacity: 1 }}
    transition={{ type: 'timing', duration: 800, loop: true }}
    style={[{ width, height, borderRadius: radius.sm, backgroundColor: colors.bg.secondary }, style]}
  />
);

const TurfDetailSkeleton = () => (
  <View style={{ padding: spacing[5], gap: spacing[4] }}>
    {/* Title row */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ flex: 1, marginRight: spacing[3], gap: spacing[2] }}>
        <SkeletonBox width="70%" height={28} />
        <SkeletonBox width="90%" height={16} />
        <SkeletonBox width="60%" height={16} />
      </View>
      <SkeletonBox width={80} height={68} style={{ borderRadius: radius.md }} />
    </View>
    {/* Hours card */}
    <SkeletonBox width="100%" height={52} style={{ borderRadius: radius.md }} />
    {/* About */}
    <View style={{ gap: spacing[2] }}>
      <SkeletonBox width="30%" height={20} />
      <SkeletonBox width="100%" height={16} />
      <SkeletonBox width="85%" height={16} />
    </View>
    {/* Amenities */}
    <View style={{ gap: spacing[2] }}>
      <SkeletonBox width="35%" height={20} />
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        <SkeletonBox width={90} height={34} style={{ borderRadius: radius.full }} />
        <SkeletonBox width={80} height={34} style={{ borderRadius: radius.full }} />
        <SkeletonBox width={100} height={34} style={{ borderRadius: radius.full }} />
      </View>
    </View>
  </View>
);


export const TurfDetailScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const { turfId } = route.params;

  const { data: turf, isLoading } = useQuery({
    queryKey: ['turf', turfId],
    queryFn:  () => getTurfByIdApi(turfId).then((r) => r.data.data),
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <View style={styles.container}>
      <Header
        title={turf?.name ?? 'Turf Detail'}
        subtitle={turf ? `${turf.location.city}` : undefined}
        showBack
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Hero image slider */}
        <MotiView
          from={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          {isLoading || !turf ? (
            <View style={styles.imageSkeleton} />
          ) : (
            <ImageSlider images={turf.images ?? []} />
          )}
        </MotiView>

        {isLoading || !turf ? (
          <TurfDetailSkeleton />
        ) : null}

        {!isLoading && turf ? (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.body}
          >
            {/* Name + price */}
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <AppText size="2xl" weight="bold" style={styles.turfName}>
                  {turf.name}
                </AppText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                  <AppText size="sm" color={colors.text.secondary} style={styles.locationText}>
                    {turf.location.address}, {turf.location.city}
                    {turf.location.pincode ? ` - ${turf.location.pincode}` : ''}
                  </AppText>
                </View>
              </View>
              <View style={styles.priceBox}>
                <AppText size="xl" weight="bold" color={colors.olive.primary}>
                  ₹{turf.pricePerHour}
                </AppText>
                <AppText size="xs" color={colors.text.tertiary}>
                  per hour
                </AppText>
              </View>
            </View>

            {/* Hours */}
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={colors.olive.primary} />
                <AppText size="sm" color={colors.text.secondary} style={styles.infoLabel}>
                  Operating Hours
                </AppText>
                <AppText size="sm" weight="semiBold">
                  {turf.operatingHours.open} – {turf.operatingHours.close}
                </AppText>
              </View>
            </Card>

            {/* Description */}
            {turf.description ? (
              <View style={styles.section}>
                <AppText size="md" weight="semiBold" style={styles.sectionTitle}>
                  About
                </AppText>
                <AppText size="sm" color={colors.text.secondary} style={styles.description}>
                  {turf.description}
                </AppText>
              </View>
            ) : null}

            {/* Amenities */}
            {turf.amenities.length > 0 ? (
              <View style={styles.section}>
                <AppText size="md" weight="semiBold" style={styles.sectionTitle}>
                  Amenities
                </AppText>
                <View style={styles.amenitiesGrid}>
                  {turf.amenities.map((amenity) => (
                    <View key={amenity} style={styles.amenityChip}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={colors.olive.primary} />
                      <AppText size="sm" style={styles.amenityText}>
                        {amenity}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </MotiView>
        ) : null}
      </ScrollView>

      {/* CTA */}
      {turf ? (
        <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + spacing[4] }]}>
          <Button
            label="Book a Slot"
            onPress={() => navigation.navigate('DateSlot', { turfId: turf._id, turfName: turf.name })}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.bg.primary,
  },
  body: {
    padding: spacing[5],
  },
  titleRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   spacing[4],
  },
  titleLeft:    { flex: 1, marginRight: spacing[3] },
  turfName:     { marginBottom: spacing[1] },
  locationRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  locationText: { marginLeft: 4, flex: 1, lineHeight: 20 },
  priceBox: {
    alignItems:      'flex-end',
    backgroundColor: `${colors.olive.primary}15`,
    borderRadius:    radius.md,
    padding:         spacing[3],
    borderWidth:     1,
    borderColor:     `${colors.olive.primary}30`,
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  infoLabel: { flex: 1 },
  section:       { marginBottom: spacing[5] },
  sectionTitle:  { marginBottom: spacing[3] },
  description:   { lineHeight: 22 },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
  },
  amenityChip: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.bg.secondary,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[1] + 2,
    borderWidth:       1,
    borderColor:       colors.bg.border,
    gap:               6,
  },
  amenityText:   {},
  imageSkeleton: {
    width:           '100%',
    height:          260,
    backgroundColor: colors.bg.secondary,
  },
  ctaContainer: {
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[3],
    backgroundColor:   colors.bg.primary,
    borderTopWidth:    1,
    borderTopColor:    colors.bg.divider,
  },
});
