import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';
import { Project } from '../types';
import { fetchCamaraPropositionDetails } from '../services/governmentApi';
import { favoritesService } from '../services/backendService';

interface ProjectDetailsScreenProps {
  route: {
    params: {
      project: Project;
    };
  };
  navigation: any;
}

export const ProjectDetailsScreen: React.FC<ProjectDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { project: initialProject } = route.params;
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(false);
  const [fullDetails, setFullDetails] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(initialProject.isFavorite || false);

  useEffect(() => {
    loadFullDetails();
  }, []);

  const loadFullDetails = async () => {
    if (!project.id) return;
    
    setLoading(true);
    try {
      // Extract numeric ID from "camara-123456"
      const numericId = parseInt(project.id.replace('camara-', ''));
      const details = await fetchCamaraPropositionDetails(numericId);
      setFullDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    const numericId = project.id.replace('camara-', '');
    
    if (isFavorite) {
      const { error } = await favoritesService.removeFavorite(numericId);
      if (!error) {
        setIsFavorite(false);
      }
    } else {
      const { error } = await favoritesService.addFavorite(numericId, project);
      if (!error) {
        setIsFavorite(true);
      }
    }
  };

  const handleOpenDocument = () => {
    if (project.documentUrl) {
      Linking.openURL(project.documentUrl).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o documento');
      });
    }
  };

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
      'Em tramitação': '#6366F1',
      'Aprovado': '#10B981',
      'Arquivado': '#6B7280',
      'Vetado': '#EF4444',
      'Em análise': '#8B5CF6',
      'Em votação': '#3B82F6',
      'Retirado': '#F59E0B',
    };
    return colorMap[status] || colors.textSecondary;
  };

  const formatDate = (dateString: string): string => {
    try {
      if (dateString.includes('/')) return dateString;
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category and Status Badges */}
        <View style={styles.badgesContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(project.category) }]}>
            <Text style={styles.categoryText}>{project.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
              {project.status}
            </Text>
          </View>
        </View>

        {/* Project Number */}
        <Text style={styles.number}>{project.number}</Text>

        {/* Title */}
        <Text style={styles.title}>{project.title}</Text>

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Apresentado em</Text>
            <Text style={styles.metadataValue}>{formatDate(project.date)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Autor(a)</Text>
            <Text style={styles.metadataValue}>{project.authorName}</Text>
          </View>
        </View>

        {/* Current Stage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Situação Atual</Text>
          <View style={styles.stageCard}>
            <Text style={styles.stageText}>{project.currentStage}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Ementa</Text>
          <Text style={styles.summaryText}>{project.summary}</Text>
        </View>

        {/* Detailed Description (if available) */}
        {fullDetails?.ementaDetalhada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Ementa Detalhada</Text>
            <Text style={styles.detailText}>{fullDetails.ementaDetalhada}</Text>
          </View>
        )}

        {/* Status Details */}
        {fullDetails?.statusProposicao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚖️ Detalhes da Tramitação</Text>
            <View style={styles.detailsCard}>
              {fullDetails.statusProposicao.siglaOrgao && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Órgão:</Text>
                  <Text style={styles.detailValue}>{fullDetails.statusProposicao.siglaOrgao}</Text>
                </View>
              )}
              {fullDetails.statusProposicao.regime && fullDetails.statusProposicao.regime !== '.' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Regime:</Text>
                  <Text style={styles.detailValue}>{fullDetails.statusProposicao.regime}</Text>
                </View>
              )}
              {fullDetails.statusProposicao.despacho && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Despacho:</Text>
                  <Text style={styles.detailValue}>{fullDetails.statusProposicao.despacho}</Text>
                </View>
              )}
              {fullDetails.statusProposicao.dataHora && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Última Atualização:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(fullDetails.statusProposicao.dataHora).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Justification (if available) */}
        {fullDetails?.justificativa && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💭 Justificativa</Text>
            <Text style={styles.detailText}>{fullDetails.justificativa}</Text>
          </View>
        )}

        {/* Document Link */}
        {project.documentUrl && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.documentButton}
              onPress={handleOpenDocument}
            >
              <Text style={styles.documentButtonText}>📎 Ver Documento Completo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando detalhes...</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  number: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  metadataContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontWeight: fontWeight.medium,
  },
  metadataValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stageCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  stageText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  detailText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  documentButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  documentButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
