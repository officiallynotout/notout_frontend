import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Input } from '@/components/ui';
import { colors, spacing } from '@/constants';
import { loginApi } from '@/api';
import { useGoogleSignIn } from '@/hooks';
import type { AuthStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'PhoneEntry'>;

const schema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

type Form = z.infer<typeof schema>;

export const PhoneEntryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, loading: googleLoading } = useGoogleSignIn();

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver:      zodResolver(schema),
    defaultValues: { phone: '' },
  });

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err?.message ?? 'Something went wrong.');
    }
  };

  const onSubmit = async ({ phone }: Form) => {
    setLoading(true);
    try {
      const res = await loginApi({ phone });
      navigation.navigate('OTPVerify', { phone, otp: res.data.data?.otp });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
        >
          <AppText size="3xl" weight="bold" style={styles.heading}>
            Welcome to{'\n'}NotOut.
          </AppText>
          <AppText size="base" color={colors.text.secondary} style={styles.subheading}>
            Enter your phone number to get started.
          </AppText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 150 }}
          style={styles.form}
        >
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Phone Number"
                placeholder="9876543210"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Button
            label="Send OTP"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText size="xs" color={colors.text.tertiary}>or</AppText>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
          >
            <AntDesign name="google" size={18} color={colors.text.primary} />
            <AppText size="sm" weight="medium" color={colors.text.primary} style={styles.googleBtnText}>
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
            </AppText>
          </Pressable>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: colors.bg.primary },
  container: {
    flexGrow:          1,
    paddingHorizontal: spacing[6],
    paddingBottom:     spacing[8],
  },
  heading:    { marginBottom: spacing[2], lineHeight: 44 },
  subheading: { marginBottom: spacing[8], lineHeight: 24 },
  form:       { gap: spacing[4] },
  submitBtn:  { marginTop: spacing[2] },

  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    marginVertical: spacing[6],
    gap:            spacing[3],
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: colors.bg.border,
  },

  googleBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              spacing[3],
    borderWidth:      1.5,
    borderColor:      colors.bg.border,
    borderRadius:     12,
    paddingVertical:  spacing[4],
    backgroundColor:  colors.bg.input,
  },
  googleBtnPressed: { opacity: 0.7 },
  googleBtnText:    { marginLeft: spacing[1] },
});
