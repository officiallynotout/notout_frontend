import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, lineHeight, letterSpacing } from '@/constants';

type FontWeight = keyof typeof fontFamily;
type FontSize   = keyof typeof fontSize;

interface AppTextProps extends TextProps {
  size?:          FontSize;
  weight?:        FontWeight;
  color?:         string;
  align?:         'left' | 'center' | 'right';
  uppercase?:     boolean;
  tracking?:      keyof typeof letterSpacing;
}

export const AppText: React.FC<AppTextProps> = ({
  size    = 'base',
  weight  = 'regular',
  color   = colors.text.primary,
  align   = 'left',
  uppercase,
  tracking = 'normal',
  style,
  children,
  ...rest
}) => {
  return (
    <Text
      style={[
        {
          fontFamily:    fontFamily[weight],
          fontSize:      fontSize[size],
          lineHeight:    lineHeight[size],
          color,
          textAlign:     align,
          textTransform: uppercase ? 'uppercase' : undefined,
          letterSpacing: letterSpacing[tracking],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
