import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppText, Button, Input } from '@/components/ui';
import { colors, spacing } from '@/constants';
import { loginApi, registerApi } from '@/api';
import type { AuthStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'PhoneEntry'>;

type Mode = 'login' | 'register';

const phoneRule = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

const loginSchema = z.object({
  phone: phoneRule,
});

const registerSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: phoneRule,
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const PhoneEntryScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets     = useSafeAreaInsets();
  const [mode, setMode]       = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<RegisterForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(mode === 'login' ? loginSchema : registerSchema) as any,
    defaultValues: { name: '', phone: '' },
  });

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    reset();
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await registerApi({ name: data.name!, phone: data.phone });
      } else {
        res = await loginApi({ phone: data.phone });
      }
      if (res.data.data?.otp) {
        console.log(`\n🔑 OTP for ${data.phone}: ${res.data.data.otp}\n`);
      }
      navigation.navigate('OTPVerify', {
        phone:     data.phone,
        name:      data.name,
        isNewUser: mode === 'register',
      });
    } catch (err: any) {
      console.error('[PhoneEntry] API error:', JSON.stringify(err?.response?.data ?? err?.message ?? err));
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
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
        >
          <AppText size="3xl" weight="bold" style={styles.heading}>
            {mode === 'login' ? 'Welcome\nBack.' : 'Create\nAccount.'}
          </AppText>
          <AppText size="base" color={colors.text.secondary} style={styles.subheading}>
            {mode === 'login'
              ? 'Enter your phone to receive a one-time code.'
              : 'Sign up to book your first turf.'}
          </AppText>
        </MotiView>

        {/* Form */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 150 }}
          style={styles.form}
        >
          {mode === 'register' ? (
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                  style={styles.inputSpacing}
                />
              )}
            />
          ) : null}

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
            label={mode === 'login' ? 'Send OTP' : 'Register & Send OTP'}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.submitBtn}
          />
        </MotiView>

        {/* Toggle mode */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.toggleRow}
        >
          <AppText size="sm" color={colors.text.secondary}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </AppText>
          <Pressable onPress={toggleMode} hitSlop={8}>
            <AppText size="sm" weight="semiBold" color={colors.olive.primary}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
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
  heading:      { marginBottom: spacing[2], lineHeight: 44 },
  subheading:   { marginBottom: spacing[8], lineHeight: 24 },
  form:         { gap: spacing[4] },
  inputSpacing: { marginBottom: spacing[1] },
  submitBtn:    { marginTop: spacing[2] },
  toggleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      spacing[6],
  },
});
