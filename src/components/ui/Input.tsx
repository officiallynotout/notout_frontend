import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MotiView } from 'moti';
import { AppText } from './AppText';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants';

interface InputProps extends TextInputProps {
  label?:       string;
  error?:       string;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  onRightPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightPress,
  style,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  const borderColor = hasError
    ? colors.status.error
    : focused
    ? colors.olive.primary
    : colors.bg.border;

  return (
    <View style={styles.container}>
      {label ? (
        <AppText size="sm" weight="medium" color={colors.text.secondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <MotiView
        animate={{ borderColor }}
        transition={{ type: 'timing', duration: 150 }}
        style={[styles.inputWrapper, { borderColor }]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          style={[
            styles.input,
            leftIcon  ? styles.inputWithLeftIcon  : undefined,
            rightIcon ? styles.inputWithRightIcon : undefined,
            style,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {rightIcon ? (
          <Pressable onPress={onRightPress} style={styles.iconRight}>
            {rightIcon}
          </Pressable>
        ) : null}
      </MotiView>

      {hasError ? (
        <AppText size="xs" color={colors.status.error} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container:           { width: '100%' },
  label:               { marginBottom: spacing[1] },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.bg.input,
    borderWidth:     1.5,
    borderRadius:    radius.md,
    height:          52,
    overflow:        'hidden',
  },
  input: {
    flex:           1,
    height:         '100%',
    paddingHorizontal: spacing[4],
    fontFamily:     fontFamily.regular,
    fontSize:       fontSize.base,
    color:          colors.text.primary,
  },
  inputWithLeftIcon:  { paddingLeft: spacing[1] },
  inputWithRightIcon: { paddingRight: spacing[1] },
  iconLeft:           { paddingLeft: spacing[4] },
  iconRight:          { paddingRight: spacing[4] },
  errorText:          { marginTop: spacing[1] },
});
