import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { TurfCardSkeleton } from '@/components/ui';
import { TurfCard, EmptyState } from '@/components/common';
import { colors, fontFamily, fontSize, spacing, radius } from '@/constants';
import { getTurfsApi } from '@/api';
import { useAppSelector } from '@/store';
import type { AppStackParamList } from '@/navigation/types';
import type { Turf } from '@/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation  = useNavigation<Nav>();
  const insets      = useSafeAreaInsets();
  const user        = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['turfs', search],
    queryFn:  () => getTurfsApi(search ? { search } : undefined).then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  });

  const filtered = (data ?? []).filter((t: Turf) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location.city.toLowerCase().includes(search.toLowerCase()),
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.header}
      >
        <View>
          <AppText size="sm" color={colors.text.secondary}>
            {greeting()},
          </AppText>
          <AppText size="xl" weight="bold">
            {user?.name?.split(' ')[0] ?? 'Player'} 👋
          </AppText>
        </View>
        <View style={styles.avatarPlaceholder}>
          <AppText size="md" weight="bold" color={colors.olive.primary}>
            {(user?.name?.[0] ?? 'P').toUpperCase()}
          </AppText>
        </View>
      </MotiView>

      {/* Search bar */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 100 }}
        style={styles.searchWrapper}
      >
        <Ionicons name="search-outline" size={18} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search turfs or cities..."
          placeholderTextColor={colors.text.tertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={8} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
          </Pressable>
        ) : null}
      </MotiView>

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <AppText size="md" weight="semiBold">
          {search ? `Results for "${search}"` : 'All Turfs'}
        </AppText>
        {data ? (
          <AppText size="sm" color={colors.text.tertiary}>
            {filtered.length} found
          </AppText>
        ) : null}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => <TurfCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.listPadding, { paddingBottom: insets.bottom + spacing[4] }]}
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
            <TurfCard
              turf={item}
              index={index}
              onPress={() => navigation.navigate('TurfDetail', { turfId: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="football-outline"
              title="No turfs found"
              description={
                search
                  ? `No results for "${search}". Try a different search.`
                  : 'No turfs available right now. Check back soon.'
              }
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
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: spacing[5],
    paddingTop:        spacing[4],
    paddingBottom:     spacing[2],
  },
  avatarPlaceholder: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: `${colors.olive.primary}20`,
    borderWidth:     1.5,
    borderColor:     `${colors.olive.primary}50`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  searchWrapper: {
    flexDirection:    'row',
    alignItems:       'center',
    marginHorizontal: spacing[5],
    marginVertical:   spacing[3],
    backgroundColor:  colors.bg.input,
    borderRadius:     radius.full,
    borderWidth:      1.5,
    borderColor:      colors.bg.border,
    height:           48,
    paddingLeft:      spacing[4],
    paddingRight:     spacing[3],
  },
  searchIcon:  { marginRight: spacing[2] },
  searchInput: {
    flex:       1,
    fontFamily: fontFamily.regular,
    fontSize:   fontSize.base,
    color:      colors.text.primary,
    height:     '100%',
  },
  clearBtn: { padding: 4 },
  sectionHeader: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: spacing[5],
    marginBottom:      spacing[2],
  },
  listPadding: { paddingHorizontal: spacing[5] },
});
