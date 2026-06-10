import React from 'react';
import { Pressable, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { AppText } from './AppText';
import { colors, radius, spacing, fontFamily, fontSize } from '@/constants';
import { useHaptics } from '@/hooks';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress:    () => void;
  label:      string;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
  labelStyle?: TextStyle;
  leftIcon?:  React.ReactNode;
}

const variantStyles: Record<Variant, { bg: string; border?: string; text: string }> = {
  primary: { bg: colors.olive.primary, text: colors.white },
  outline: { bg: colors.transparent, border: colors.olive.primary, text: colors.olive.primary },
  ghost:   { bg: colors.transparent, text: colors.olive.primary },
  danger:  { bg: colors.status.error, text: colors.white },
};

const sizeStyles: Record<Size, { height: number; px: number; textSize: keyof typeof fontSize }> = {
  sm: { height: 42, px: spacing[4], textSize: 'base' },
  md: { height: 54, px: spacing[6], textSize: 'md' },
  lg: { height: 62, px: spacing[8], textSize: 'lg' },
};

export const Button: React.FC<ButtonProps> = ({
  onPress,
  label,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  fullWidth = true,
  style,
  labelStyle,
  leftIcon,
}) => {
  const { light } = useHaptics();
  const [pressed, setPressed] = React.useState(false);

  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled) {
      light();
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <MotiView
        animate={{ scale: pressed ? 0.97 : 1, opacity: isDisabled ? 0.5 : 1 }}
        transition={{ type: 'timing', duration: 80 }}
        style={[
          styles.base,
          {
            height:          ss.height,
            paddingHorizontal: ss.px,
            backgroundColor: vs.bg,
            borderWidth:     vs.border ? 1.5 : 0,
            borderColor:     vs.border ?? colors.transparent,
            borderRadius:    radius.md,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.white : colors.olive.primary}
          />
        ) : (
          <>
            {leftIcon}
            <AppText
              size={ss.textSize}
              weight="semiBold"
              color={vs.text}
              style={[leftIcon ? styles.labelWithIcon : undefined, labelStyle]}
            >
              {label}
            </AppText>
          </>
        )}
      </MotiView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  labelWithIcon: { marginLeft: spacing[2] },
});
