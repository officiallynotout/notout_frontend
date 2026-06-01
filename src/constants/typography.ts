export const fontFamily = {
  regular:  'SpaceGrotesk_400Regular',
  medium:   'SpaceGrotesk_500Medium',
  semiBold: 'SpaceGrotesk_600SemiBold',
  bold:     'SpaceGrotesk_700Bold',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
} as const;

export const lineHeight = {
  xs:   16,
  sm:   20,
  base: 22,
  md:   26,
  lg:   28,
  xl:   32,
  '2xl': 36,
  '3xl': 42,
  '4xl': 50,
} as const;

export const letterSpacing = {
  tight:  -0.5,
  normal:  0,
  wide:    0.5,
  wider:   1,
  widest:  2,
} as const;
