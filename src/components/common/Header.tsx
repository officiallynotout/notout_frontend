import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { colors, spacing } from '@/constants';

interface HeaderProps {
  title:        string;
  subtitle?:    string;
  showBack?:    boolean;
  rightElement?: React.ReactNode;
  onBackPress?:  () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack     = true,
  rightElement,
  onBackPress,
}) => {
  const insets    = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else navigation.goBack();
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing[2] }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleWrapper}>
          <AppText size="md" weight="bold" align="center" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText
              size="xs"
              color={colors.text.secondary}
              align="center"
              style={styles.subtitle}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <View style={styles.rightWrapper}>
          {rightElement ?? <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg.primary,
    paddingBottom:   spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: spacing[4],
  },
  backBtn: {
    width:           36,
    height:          36,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.bg.tertiary,
    borderRadius:    18,
  },
  titleWrapper:  { flex: 1, paddingHorizontal: spacing[2] },
  subtitle:      { marginTop: 2 },
  rightWrapper:  { width: 36, alignItems: 'flex-end' },
  placeholder:   { width: 36 },
});
