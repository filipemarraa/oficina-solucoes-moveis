import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

interface BadgeProps {
  count: number;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ count, size = 'medium' }) => {
  if (count === 0) return null;

  return (
    <View style={[styles.badge, size === 'small' && styles.badgeSmall]}>
      <Text style={[styles.badgeText, size === 'small' && styles.badgeTextSmall]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeSmall: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
});
