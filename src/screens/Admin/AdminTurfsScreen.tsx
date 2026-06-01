import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppText, Badge, Card } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { getAllTurfsAdminApi, deleteTurfApi, updateTurfApi } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import type { AdminStackParamList } from '@/navigation/types';
import type { Turf } from '@/types';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export const AdminTurfsScreen: React.FC = () => {
  const insets      = useSafeAreaInsets();
  const navigation  = useNavigation<Nav>();
  const queryClient = useQueryClient();

  const { data: turfs, isLoading, refetch, isRefetching } = useQuery<Turf[]>({
    queryKey:  ['admin-turfs'],
    queryFn:   () => getAllTurfsAdminApi().then((r) => r.data.data),
    staleTime: 1000 * 60,
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateTurfApi(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-turfs'] }),
    onError:   (err: any) => Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update turf.'),
  });

  const { mutate: deleteTurf } = useMutation({
    mutationFn: (id: string) => deleteTurfApi(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-turfs'] }),
    onError:    (err: any) => Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete turf.'),
  });

  const handleToggle = useCallback((turf: Turf) => {
    const action = turf.isActive ? 'Deactivate' : 'Activate';
    Alert.alert(
      `${action} Turf?`,
      `Are you sure you want to ${action.toLowerCase()} "${turf.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action, onPress: () => toggleActive({ id: turf._id, isActive: !turf.isActive }) },
      ],
    );
  }, [toggleActive]);

  const handleDelete = useCallback((turf: Turf) => {
    Alert.alert(
      'Delete Turf?',
      `This will permanently delete "${turf.name}". This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTurf(turf._id) },
      ],
    );
  }, [deleteTurf]);

  const renderItem = ({ item, index }: { item: Turf; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <Card style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBlock}>
            <AppText size="md" weight="bold" numberOfLines={1} style={styles.turfName}>
              {item.name}
            </AppText>
            <AppText size="xs" color={colors.text.secondary}>
              {item.location.city} · {item.location.address}
            </AppText>
          </View>
          <Badge
            label={item.isActive ? 'Active' : 'Inactive'}
            variant={item.isActive ? 'success' : 'default'}
          />
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={colors.text.tertiary} />
            <AppText size="sm" color={colors.text.secondary} style={styles.metaText}>
              {formatCurrency(item.pricePerHour)}/hr
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <AppText size="sm" color={colors.text.secondary} style={styles.metaText}>
              {item.operatingHours.open} – {item.operatingHours.close}
            </AppText>
          </View>
        </View>

        {/* Amenities */}
        {item.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {item.amenities.slice(0, 3).map((a) => (
              <View key={a} style={styles.amenityChip}>
                <AppText size="xs" color={colors.text.secondary}>{a}</AppText>
              </View>
            ))}
            {item.amenities.length > 3 && (
              <AppText size="xs" color={colors.text.tertiary}>+{item.amenities.length - 3} more</AppText>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('AdminTurfForm', { turf: item })}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.olive.primary} />
            <AppText size="sm" weight="medium" color={colors.olive.primary} style={styles.actionText}>Edit</AppText>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, item.isActive ? styles.deactivateBtn : styles.activateBtn]}
            onPress={() => handleToggle(item)}
          >
            <Ionicons
              name={item.isActive ? 'eye-off-outline' : 'eye-outline'}
              size={14}
              color={item.isActive ? colors.status.warning : colors.status.success}
            />
            <AppText
              size="sm"
              weight="medium"
              color={item.isActive ? colors.status.warning : colors.status.success}
              style={styles.actionText}
            >
              {item.isActive ? 'Deactivate' : 'Activate'}
            </AppText>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={14} color={colors.status.error} />
          </Pressable>
        </View>
      </Card>
    </MotiView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <AppText size="xl" weight="bold">Turfs</AppText>
          <AppText size="sm" color={colors.text.secondary}>
            {turfs ? `${turfs.length} total` : '—'}
          </AppText>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminTurfForm', {})}
        >
          <Ionicons name="add" size={20} color={colors.text.inverse} />
          <AppText size="sm" weight="semiBold" color={colors.text.inverse} style={styles.addBtnText}>
            Add Turf
          </AppText>
        </Pressable>
      </View>

      <FlatList
        data={turfs ?? []}
        keyExtractor={(t) => t._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? null : (
            <AppText size="sm" color={colors.text.tertiary} align="center" style={styles.empty}>
              No turfs found. Add one!
            </AppText>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  addBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.olive.primary,
    borderRadius:     radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[2],
  },
  addBtnText:    { marginLeft: 4 },
  list:          { padding: spacing[4], paddingBottom: spacing[10] },
  card:          { padding: spacing[4], marginBottom: spacing[3] },
  cardHeader: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   spacing[3],
  },
  cardTitleBlock: { flex: 1, marginRight: spacing[2] },
  turfName:       { marginBottom: 2 },
  metaRow: {
    flexDirection: 'row',
    gap:           spacing[4],
    marginBottom:  spacing[3],
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 4 },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[1],
    marginBottom:  spacing[3],
  },
  amenityChip: {
    backgroundColor:  colors.bg.tertiary,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical:   3,
  },
  actions: {
    flexDirection:  'row',
    gap:            spacing[2],
    paddingTop:     spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.bg.divider,
  },
  actionBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[2],
    borderRadius:     radius.sm,
    borderWidth:      1,
  },
  editBtn:       { borderColor: `${colors.olive.primary}40`, backgroundColor: `${colors.olive.primary}10` },
  deactivateBtn: { borderColor: `${colors.status.warning}40`, backgroundColor: `${colors.status.warning}10` },
  activateBtn:   { borderColor: `${colors.status.success}40`, backgroundColor: `${colors.status.success}10` },
  deleteBtn:     { borderColor: `${colors.status.error}40`,   backgroundColor: `${colors.status.error}10`, paddingHorizontal: spacing[2] },
  actionText:    { marginLeft: 4 },
  empty:         { marginTop: spacing[8] },
});
