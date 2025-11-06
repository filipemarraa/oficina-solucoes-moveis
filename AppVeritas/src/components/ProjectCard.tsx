import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Project } from '../types';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../constants/theme';

interface ProjectCardProps {
  project: Project;
  onPress?: () => void;
  onToggleFavorite?: (id: string) => void;
  onSupport?: (id: string) => void;
  onAgainst?: (id: string) => void;
  onAlert?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  onToggleFavorite,
  onSupport,
  onAgainst,
  onAlert,
}) => {
  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Saúde': '#E53935',
      'Educação': '#1E88E5',
      'Segurança': '#8E24AA',
      'Trabalho': '#43A047',
      'Meio Ambiente': '#00897B',
      'Economia': '#FFB300',
      'Direitos Humanos': '#F4511E',
      'Tecnologia': '#3949AB',
      'Outros': '#757575',
    };
    return colorMap[category] || colors.primary;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      'Em tramitação': colors.warningYellow,
      'Aprovado': colors.primaryCyan,
      'Arquivado': '#6B7280',
      'Vetado': colors.errorRed,
      'Rejeitado': colors.errorRed,
      'Em análise': '#8B5CF6',
      'Em votação': '#3B82F6',
      'Retirado': '#F59E0B',
    };
    return colorMap[status] || colors.textSecondary;
  };

  const getStatusTextColor = (status: string): string => {
    const textColorMap: { [key: string]: string } = {
      'Em tramitação': '#000000',
      'Aprovado': '#FFFFFF',
      'Arquivado': '#FFFFFF',
      'Vetado': '#FFFFFF',
      'Rejeitado': '#FFFFFF',
      'Em análise': '#FFFFFF',
      'Em votação': '#FFFFFF',
      'Retirado': '#FFFFFF',
    };
    return textColorMap[status] || '#FFFFFF';
  };

  const formatDate = (dateString: string): string => {
    try {
      // Se já está em formato brasileiro, retorna
      if (dateString.includes('/')) {
        return dateString;
      }
      
      // Se está em formato ISO (YYYY-MM-DD), converte
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(project.category) }]}>
          <Text style={styles.categoryText}>{project.category}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}> 
            <Text style={[styles.statusText, { color: getStatusTextColor(project.status) }]}> 
              {project.status}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite?.(project.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.favoriteIcon}>{project.isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Número do projeto */}
      <Text style={styles.number} numberOfLines={1} ellipsizeMode="tail">
        Projeto nº {project.number}
      </Text>

      {/* Title & Summary */}
      <Text style={styles.title} numberOfLines={2}>
        {project.title}
      </Text>

      {/* Date shown under title per UX request */}
      <Text style={styles.date}>
        {formatDate(project.date)}
      </Text>

      <Text style={styles.summary} numberOfLines={2}>
        {project.summary}
      </Text>

      {/* Progress Bar with Status */}
      {project.progress !== undefined && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Status: {project.status}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{project.progress}%</Text>
          </View>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSupport?.(project.id)}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text style={styles.actionIcon}>👍</Text>
          <Text style={styles.actionButtonText}>Apoiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onAgainst?.(project.id)}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text style={styles.actionIcon}>👎</Text>
          <Text style={styles.actionButtonText}>Contra</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonCircle}
          onPress={() => onAlert?.(project.id)}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text style={styles.actionIconLarge}>🔔</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  number: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.semibold,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    minWidth: 40,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionIconLarge: {
    fontSize: 20,
  },
  actionButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  favoriteButton: {
    marginLeft: spacing.xs,
    padding: 4,
    borderRadius: 8,
  },
  favoriteIcon: {
    fontSize: 18,
  },
});
