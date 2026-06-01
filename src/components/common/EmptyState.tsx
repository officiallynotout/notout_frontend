import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui';
import { colors, spacing } from '@/constants';

interface EmptyStateProps {
  icon?:       React.ComponentProps<typeof Ionicons>['name'];
  title:       string;
  description?: string;
  action?:     React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon        = 'calendar-outline',
  title,
  description,
  action,
}) => (
  <MotiView
    from={{ opacity: 0, translateY: 16 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 400 }}
    style={styles.container}
  >
    <View style={styles.iconWrapper}>
      <Ionicons name={icon} size={48} color={colors.olive.dark} />
    </View>
    <AppText size="lg" weight="bold" align="center" style={styles.title}>
      {title}
    </AppText>
    {description ? (
      <AppText
        size="sm"
        color={colors.text.secondary}
        align="center"
        style={styles.description}
      >
        {description}
      </AppText>
    ) : null}
    {action ? <View style={styles.action}>{action}</View> : null}
  </MotiView>
);

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical:   spacing[12],
  },
  iconWrapper: {
    width:           88,
    height:          88,
    borderRadius:    44,
    backgroundColor: `${colors.olive.dark}18`,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing[5],
  },
  title:       { marginBottom: spacing[2] },
  description: { lineHeight: 22 },
  action:      { marginTop: spacing[6] },
});
