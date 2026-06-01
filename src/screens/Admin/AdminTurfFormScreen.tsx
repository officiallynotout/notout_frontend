import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Input, Card } from '@/components/ui';
import { Header } from '@/components/common';
import { colors, spacing, radius } from '@/constants';
import { createTurfApi, updateTurfApi } from '@/api';
import type { AdminStackParamList } from '@/navigation/types';

type Route = NativeStackScreenProps<AdminStackParamList, 'AdminTurfForm'>['route'];
type Nav   = NativeStackNavigationProp<AdminStackParamList>;

const turfSchema = z.object({
  name:        z.string().min(2, 'Min 2 characters').max(100),
  description: z.string().max(500).optional(),
  address:     z.string().min(2, 'Address required'),
  city:        z.string().min(2, 'City required'),
  pincode:     z.string().regex(/^\d{6}$/, 'Must be 6 digits').optional().or(z.literal('')),
  pricePerHour: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price must be > 0'),
  openTime:    z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM').optional().or(z.literal('')),
  closeTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM').optional().or(z.literal('')),
});

type TurfForm = z.infer<typeof turfSchema>;

export const AdminTurfFormScreen: React.FC = () => {
  const route      = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const existingTurf = route.params?.turf;
  const isEditing    = Boolean(existingTurf);

  const [amenities, setAmenities] = useState<string[]>(existingTurf?.amenities ?? []);
  const [amenityInput, setAmenityInput] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<TurfForm>({
    resolver: zodResolver(turfSchema),
    defaultValues: {
      name:         existingTurf?.name ?? '',
      description:  existingTurf?.description ?? '',
      address:      existingTurf?.location?.address ?? '',
      city:         existingTurf?.location?.city ?? '',
      pincode:      existingTurf?.location?.pincode ?? '',
      pricePerHour: existingTurf ? String(existingTurf.pricePerHour) : '',
      openTime:     existingTurf?.operatingHours?.open ?? '06:00',
      closeTime:    existingTurf?.operatingHours?.close ?? '23:00',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TurfForm) => {
      const payload = {
        name:        data.name,
        description: data.description || undefined,
        location: {
          address: data.address,
          city:    data.city,
          pincode: data.pincode || '',
        },
        amenities,
        pricePerHour: Number(data.pricePerHour),
        operatingHours: {
          open:  data.openTime  || '06:00',
          close: data.closeTime || '23:00',
        },
      };
      return isEditing
        ? updateTurfApi(existingTurf!._id, payload)
        : createTurfApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-turfs'] });
      queryClient.invalidateQueries({ queryKey: ['turfs'] });
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? 'Something went wrong.');
    },
  });

  const addAmenity = () => {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
    }
    setAmenityInput('');
  };

  const removeAmenity = (a: string) =>
    setAmenities((prev) => prev.filter((x) => x !== a));

  const onSubmit = (data: TurfForm) => mutate(data);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={isEditing ? 'Edit Turf' : 'Add Turf'}
        subtitle={isEditing ? existingTurf?.name : undefined}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[10] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic info */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          Basic Info
        </AppText>
        <Card style={styles.section}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input label="Turf Name" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="e.g. Green Field Arena" />
            )}
          />
          <View style={styles.gap} />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input label="Description (optional)" value={value} onChangeText={onChange} error={errors.description?.message} placeholder="Short description..." multiline />
            )}
          />
        </Card>

        {/* Location */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          Location
        </AppText>
        <Card style={styles.section}>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input label="Address" value={value} onChangeText={onChange} error={errors.address?.message} placeholder="e.g. 45 Sports Complex Road" />
            )}
          />
          <View style={styles.gap} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Input label="City" value={value} onChangeText={onChange} error={errors.city?.message} placeholder="e.g. Surat" />
                )}
              />
            </View>
            <View style={styles.gap16} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="pincode"
                render={({ field: { onChange, value } }) => (
                  <Input label="Pincode" value={value} onChangeText={onChange} error={errors.pincode?.message} placeholder="395001" keyboardType="numeric" maxLength={6} />
                )}
              />
            </View>
          </View>
        </Card>

        {/* Pricing & Hours */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          Pricing & Hours
        </AppText>
        <Card style={styles.section}>
          <Controller
            control={control}
            name="pricePerHour"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Price per Hour (₹)"
                value={value}
                onChangeText={onChange}
                error={errors.pricePerHour?.message}
                placeholder="e.g. 800"
                keyboardType="numeric"
              />
            )}
          />
          <View style={styles.gap} />
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="openTime"
                render={({ field: { onChange, value } }) => (
                  <Input label="Opens (HH:MM)" value={value} onChangeText={onChange} error={errors.openTime?.message} placeholder="06:00" keyboardType="numbers-and-punctuation" />
                )}
              />
            </View>
            <View style={styles.gap16} />
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="closeTime"
                render={({ field: { onChange, value } }) => (
                  <Input label="Closes (HH:MM)" value={value} onChangeText={onChange} error={errors.closeTime?.message} placeholder="23:00" keyboardType="numbers-and-punctuation" />
                )}
              />
            </View>
          </View>
        </Card>

        {/* Amenities */}
        <AppText size="xs" color={colors.text.tertiary} weight="semiBold" uppercase tracking="wider" style={styles.sectionLabel}>
          Amenities
        </AppText>
        <Card style={styles.section}>
          <View style={styles.amenityInputRow}>
            <View style={styles.flex1}>
              <Input
                placeholder="e.g. Parking, Changing Room..."
                value={amenityInput}
                onChangeText={setAmenityInput}
                onSubmitEditing={addAmenity}
                returnKeyType="done"
              />
            </View>
            <Pressable style={styles.addChipBtn} onPress={addAmenity}>
              <Ionicons name="add" size={20} color={colors.olive.primary} />
            </Pressable>
          </View>

          {amenities.length > 0 && (
            <View style={styles.chipsWrap}>
              {amenities.map((a) => (
                <Pressable key={a} style={styles.chip} onPress={() => removeAmenity(a)}>
                  <AppText size="xs" color={colors.text.secondary}>{a}</AppText>
                  <Ionicons name="close" size={12} color={colors.text.tertiary} style={styles.chipX} />
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.submitWrap}>
          <Button
            label={isEditing ? 'Save Changes' : 'Create Turf'}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg.primary },
  content:      { padding: spacing[4] },
  sectionLabel: { marginBottom: spacing[2], marginTop: spacing[4] },
  section:      { padding: spacing[4] },
  gap:          { height: spacing[3] },
  gap16:        { width: spacing[4] },
  row:          { flexDirection: 'row' },
  flex1:        { flex: 1 },
  amenityInputRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing[2],
  },
  addChipBtn: {
    width:           44,
    height:          52,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: `${colors.olive.primary}18`,
    borderRadius:    radius.md,
    borderWidth:     1,
    borderColor:     `${colors.olive.primary}40`,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing[2],
    marginTop:     spacing[3],
  },
  chip: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.bg.tertiary,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical:   spacing[1],
    borderWidth:      1,
    borderColor:      colors.bg.border,
  },
  chipX:      { marginLeft: 4 },
  submitWrap: { marginTop: spacing[6] },
});
