import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert } from '../types';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../constants/theme';

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'info':
        return 'ℹ️';
      case 'update':
        return '🔄';
      case 'success':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getTypeColor = () => {
    switch (alert.type) {
      case 'info':
        return colors.primary;
      case 'update':
        return colors.warning;
      case 'success':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !alert.isRead && styles.unreadCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: getTypeColor() + '20' }]}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        {!alert.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {alert.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {alert.message}
        </Text>
        <Text style={styles.date}>{formatDate(alert.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  unreadCard: {
    backgroundColor: colors.primary + '05',
    borderColor: colors.primary + '20',
  },
  iconContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
