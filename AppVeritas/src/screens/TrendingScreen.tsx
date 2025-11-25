import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProjectCard } from '../components';
import { TrendingProject, RootStackParamList } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../constants/theme';
import { projectsService, favoritesService } from '../services/backendService';
import {
  fetchCamaraPropositionDetails,
  fetchCamaraPropositionAuthors,
  transformCamaraToProject
} from '../services/governmentApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

// Mock removed


export const TrendingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [trendingProjects, setTrendingProjects] = useState<TrendingProject[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadNotifications = 3; // Mock - virá do contexto/estado global

  useEffect(() => {
    loadTrendingProjects();
  }, []);

  const loadTrendingProjects = async () => {
    try {
      setLoading(true);
      const { data: trendingData, error } = await projectsService.getTrending();

      if (error) {
        console.error('Erro ao buscar trending:', error);
        setTrendingProjects([]);
      } else if (trendingData && trendingData.length > 0) {
        // Fetch real details for each trending project
        const enrichedProjects = await Promise.all(
          trendingData.map(async (t: any) => {
            try {
              // Extract numeric ID from "camara-123" or just use it if it's numeric
              // Assuming format "camara-XXXX" or just "XXXX"
              let numericId: number;
              if (t.project_id.toString().includes('camara-')) {
                const parts = t.project_id.split('-');
                numericId = parseInt(parts[parts.length - 1]);
              } else {
                numericId = parseInt(t.project_id);
              }

              if (isNaN(numericId)) return null;

              const propDetails = await fetchCamaraPropositionDetails(numericId);
              const authors = await fetchCamaraPropositionAuthors(numericId);
              const project = transformCamaraToProject(propDetails, authors);

              return {
                ...project,
                interactionsCount: parseInt(t.interaction_count),
                interactionsToday: parseInt(t.interaction_count), // Simplified
                id: t.project_id // Keep the ID from backend to ensure consistency
              };
            } catch (err) {
              console.error(`Error fetching details for ${t.project_id}:`, err);
              return null;
            }
          })
        );

        const validProjects = enrichedProjects.filter(Boolean) as TrendingProject[];
        setTrendingProjects(validProjects);
      } else {
        setTrendingProjects([]);
      }

      // Load favorites to check status
      const { data: favs } = await favoritesService.getFavorites();
      if (favs) {
        const favIds = new Set<string>(favs.map((f: any) => f.project_id));
        setFavorites(favIds);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar projetos em alta:', error);
      setLoading(false);
      setTrendingProjects([]);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrendingProjects();
    setRefreshing(false);
  };

  const handleSupport = async (projectId: string) => {
    console.log('Apoiar projeto:', projectId);
    const { error } = await projectsService.registerInteraction(projectId, 'like');
    if (!error) {
      loadTrendingProjects(); // Refresh to show new counts
    }
  };

  const handleAgainst = async (projectId: string) => {
    console.log('Contra projeto:', projectId);
    const { error } = await projectsService.registerInteraction(projectId, 'dislike');
    if (!error) {
      loadTrendingProjects(); // Refresh to show new counts
    }
  };



  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  // Marcar projetos como favoritos
  const projectsWithFavorites = trendingProjects.map((p) => ({
    ...p,
    isFavorite: favorites.has(p.id),
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🔥</Text>
            <Text style={styles.headerTitle}>Em Alta!</Text>
          </View>
          <TouchableOpacity
            onPress={navigateToNotifications}
            style={styles.notificationButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando projetos em alta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🔥</Text>
          <View>
            <Text style={styles.headerTitle}>Em Alta!</Text>
            <Text style={styles.headerSubtitle}>
              Projetos com mais interações no momento
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={navigateToNotifications}
          style={styles.notificationButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      <FlatList
        data={projectsWithFavorites}
        renderItem={({ item }) => (
          <View>
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate('ProjectDetails', { project: item })}
              onToggleFavorite={handleToggleFavorite}
              onSupport={handleSupport}
              onAgainst={handleAgainst}
            />
            {/* Trending Badge */}
            <View style={styles.trendingBadge}>
              <Text style={styles.trendingBadgeText}>
                🔥 +{item.interactionsToday} interações hoje
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum projeto em alta no momento</Text>
            <Text style={styles.emptySubtext}>
              Volte mais tarde para ver os projetos mais populares
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
  },
  bellIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.errorRed,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  trendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
  },
  trendingBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: '#F57C00',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
