import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotiView } from 'moti';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
// Reanimated 4: Animated is still a default export, same hooks API
import { OtpInput } from 'react-native-otp-entry';
import { AppText, Button } from '@/components/ui';
import { colors, spacing, fontFamily } from '@/constants';
import { loginApi, verifyOtpApi } from '@/api';
import { useAuth } from '@/hooks';
import type { AuthStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Route = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>['route'];

const OTP_LENGTH    = 4;
const RESEND_SECS   = 30;

export const OTPVerifyScreen: React.FC = () => {
  const navigation = useNavigation();
  const route  = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { login }      = useAuth();
  const { phone, name, isNewUser } = route.params;

  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendTimer, setTimer] = useState(RESEND_SECS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const shake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10,  { duration: 60 }),
      withTiming(-8,  { duration: 60 }),
      withTiming(8,   { duration: 60 }),
      withTiming(0,   { duration: 60 }),
    );
  };

  useEffect(() => {
    startResendTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startResendTimer = () => {
    setTimer(RESEND_SECS);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleVerify = async (code: string = otp) => {
    if (code.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const res = await verifyOtpApi({ phone, otp: code });
      login(res.data.data);
      // RootNavigator's conditional rendering handles the switch automatically
    } catch (err: any) {
      shake();
      Alert.alert('Invalid OTP', err?.response?.data?.message ?? 'Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await loginApi({ phone });
      startResendTimer();
      Alert.alert('OTP Sent', 'A new code has been sent to your phone.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to resend OTP.');
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
        {/* Back arrow */}
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
          <AppText size="sm" color={colors.olive.primary} weight="medium">
            ← Back
          </AppText>
        </Pressable>

        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <AppText size="3xl" weight="bold" style={styles.heading}>
            Verify{'\n'}Phone.
          </AppText>
          <AppText size="base" color={colors.text.secondary} style={styles.subheading}>
            Enter the 6-digit code sent to{' '}
            <AppText size="base" weight="semiBold" color={colors.text.primary}>
              +91 {phone}
            </AppText>
          </AppText>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 }}
        >
          <Animated.View style={[styles.otpWrapper, shakeStyle]}>
            <OtpInput
              numberOfDigits={OTP_LENGTH}
              onFilled={(code) => { setOtp(code); handleVerify(code); }}
              onTextChange={setOtp}
              theme={{
                containerStyle:    styles.otpContainer,
                inputsContainerStyle: styles.otpInputsRow,
                pinCodeContainerStyle: styles.otpCell,
                pinCodeTextStyle:  styles.otpText,
                focusedPinCodeContainerStyle: styles.otpCellFocused,
                filledPinCodeContainerStyle:  styles.otpCellFilled,
              }}
            />
          </Animated.View>

          <Button
            label="Verify OTP"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={otp.length < OTP_LENGTH}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            <AppText size="sm" color={colors.text.secondary}>
              Didn't receive it?{' '}
            </AppText>
            <Pressable onPress={handleResend} disabled={resendTimer > 0} hitSlop={8}>
              <AppText
                size="sm"
                weight="semiBold"
                color={resendTimer > 0 ? colors.text.tertiary : colors.olive.primary}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </AppText>
            </Pressable>
          </View>
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
  back:        { marginBottom: spacing[6] },
  heading:     { marginBottom: spacing[2], lineHeight: 44 },
  subheading:  { marginBottom: spacing[8], lineHeight: 24 },
  otpWrapper:  { marginBottom: spacing[6] },
  otpContainer: { width: '100%' },
  otpInputsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:             10,
  },
  otpCell: {
    flex:            1,
    height:          60,
    backgroundColor: colors.bg.input,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     colors.bg.border,
  },
  otpCellFocused: { borderColor: colors.olive.primary },
  otpCellFilled:  { borderColor: colors.olive.dark, backgroundColor: `${colors.olive.primary}15` },
  otpText: {
    fontFamily: fontFamily.bold,
    fontSize:   24,
    color:      colors.text.primary,
  },
  verifyBtn:   {},
  resendRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    marginTop:      spacing[5],
  },
});
