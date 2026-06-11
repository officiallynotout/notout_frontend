import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
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
import { loginApi } from '@/api';
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

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver:      zodResolver(schema),
    defaultValues: { phone: '' },
  });

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
});
