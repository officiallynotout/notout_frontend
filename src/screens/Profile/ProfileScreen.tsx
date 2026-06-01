import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AppText, Button, Input, Card } from '@/components/ui';
import { colors, spacing, radius } from '@/constants';
import { updateProfileApi } from '@/api';
import { useAuth } from '@/hooks';

const profileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

type MenuItemProps = {
  icon:    React.ComponentProps<typeof Ionicons>['name'];
  label:   string;
  value?:  string;
  onPress: () => void;
  danger?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, value, onPress, danger }) => (
  <Pressable onPress={onPress} style={styles.menuItem}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={18} color={danger ? colors.status.error : colors.olive.primary} />
    </View>
    <View style={styles.menuContent}>
      <AppText size="base" color={danger ? colors.status.error : colors.text.primary} weight="medium">
        {label}
      </AppText>
      {value ? (
        <AppText size="sm" color={colors.text.tertiary}>
          {value}
        </AppText>
      ) : null}
    </View>
    {!danger && <Ionicons name="chevron-forward" size={16} color={colors.text.disabled} />}
  </Pressable>
);

export const ProfileScreen: React.FC = () => {
  const insets             = useSafeAreaInsets();
  const { user, logout, patchUser } = useAuth();
  const [isEditing, setIsEditing]   = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProfileForm) => updateProfileApi({ name: data.name, email: data.email || undefined }),
    onSuccess: (res) => {
      patchUser({ name: res.data.data.name, email: res.data.data.email });
      setIsEditing(false);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not update profile.');
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ],
    );
  };

  const initials = (user?.name ?? 'P')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[8] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page title */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
          style={styles.pageHeader}
        >
          <AppText size="2xl" weight="bold">Profile</AppText>
        </MotiView>

        {/* Avatar + name */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 100 }}
          style={styles.avatarSection}
        >
          <View style={styles.avatar}>
            <AppText size="2xl" weight="bold" color={colors.olive.primary}>
              {initials}
            </AppText>
          </View>
          <AppText size="xl" weight="bold" align="center">
            {user?.name ?? '–'}
          </AppText>
          {user?.email ? (
            <AppText size="sm" color={colors.text.secondary} align="center" style={styles.emailText}>
              {user.email}
            </AppText>
          ) : null}
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.status.success} />
              <AppText size="xs" color={colors.status.success} weight="medium" style={styles.verifiedText}>
                Verified
              </AppText>
            </View>
          )}
        </MotiView>

        {/* Edit form */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          {isEditing ? (
            <Card style={styles.editCard}>
              <AppText size="sm" weight="semiBold" style={styles.editTitle}>
                Edit Profile
              </AppText>
              <View style={styles.editFields}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.name?.message}
                      autoCapitalize="words"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Email (optional)"
                      value={value}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />
              </View>
              <View style={styles.editActions}>
                <Button
                  label="Save Changes"
                  onPress={handleSubmit((d) => updateProfile(d))}
                  loading={isPending}
                />
                <Button
                  label="Cancel"
                  variant="ghost"
                  onPress={() => setIsEditing(false)}
                />
              </View>
            </Card>
          ) : (
            <View style={styles.menuSection}>
              <AppText size="xs" color={colors.text.tertiary} uppercase tracking="wider" style={styles.menuLabel}>
                Account
              </AppText>
              <Card style={styles.menuCard}>
                <MenuItem
                  icon="pencil-outline"
                  label="Edit Profile"
                  onPress={() => setIsEditing(true)}
                />
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="call-outline"
                  label="Phone"
                  value={user?.phone ? '••••••' + user.phone.slice(-4) : 'Not set'}
                  onPress={() => {}}
                />
              </Card>

              <AppText size="xs" color={colors.text.tertiary} uppercase tracking="wider" style={[styles.menuLabel, { marginTop: spacing[5] }]}>
                More
              </AppText>
              <Card style={styles.menuCard}>
                <MenuItem
                  icon="log-out-outline"
                  label="Log Out"
                  onPress={handleLogout}
                  danger
                />
              </Card>
            </View>
          )}
        </MotiView>

        {/* App version */}
        <AppText
          size="xs"
          color={colors.text.disabled}
          align="center"
          style={styles.versionText}
        >
          NotOut v1.0.0
        </AppText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: colors.bg.primary },
  container:   { paddingHorizontal: spacing[5] },
  pageHeader:  { marginBottom: spacing[6] },
  avatarSection: {
    alignItems:   'center',
    marginBottom: spacing[6],
    gap:          spacing[1],
  },
  avatar: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: `${colors.olive.primary}20`,
    borderWidth:     2,
    borderColor:     `${colors.olive.primary}50`,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing[2],
  },
  emailText:    {},
  verifiedBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              4,
    backgroundColor:  `${colors.status.success}15`,
    borderRadius:     radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical:   3,
    marginTop:         spacing[1],
  },
  verifiedText: {},
  editCard: {
    padding: spacing[5],
    gap:     spacing[4],
  },
  editTitle:  { marginBottom: spacing[1] },
  editFields: { gap: spacing[3] },
  editActions: { gap: spacing[2], marginTop: spacing[1] },
  menuSection: {},
  menuLabel:   { marginBottom: spacing[2] },
  menuCard:    { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: spacing[4],
    paddingVertical:   spacing[4],
    gap:           spacing[3],
  },
  menuIcon: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: `${colors.olive.primary}15`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuIconDanger: { backgroundColor: `${colors.status.error}15` },
  menuContent:    { flex: 1, gap: 2 },
  menuDivider: {
    height:           1,
    backgroundColor:  colors.bg.divider,
    marginHorizontal: spacing[4],
  },
  versionText: { marginTop: spacing[10] },
});
