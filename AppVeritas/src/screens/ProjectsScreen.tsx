import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProjectCard, HeaderWithNotifications, FilterTabs } from '../components';
import { Category, Project, RootStackParamList } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';
import {
  fetchCamaraPropositions,
  transformCamaraToProject,
  fetchCamaraPropositionAuthors,
  mapCategoria,
  fetchProjectsWithCategoryMinimum,
} from '../services/governmentApi';
import { favoritesService, projectsService, alertsService } from '../services/backendService';
import { batchUpdateProjectsStatus, clearStatusCache } from '../services/realTimeStatusService';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const ProjectsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos' | 'Palavras-chave'>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterByInterests, setFilterByInterests] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateProgress, setUpdateProgress] = useState({ current: 0, total: 0 });

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const handleCategoryChange = (category: Category | 'Todos' | 'Palavras-chave') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(category);
  };

  const handleStatusChange = (status: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedStatus(status);
  };

  // Criar lista de categorias dinamicamente baseada nos interesses do usuário
  const filterCategories = React.useMemo(() => {
    const categories: (Category | 'Todos' | 'Palavras-chave')[] = ['Todos'];

    // Adicionar filtro de palavras-chave se o usuário tiver keywords
    if (profile?.keywords && profile.keywords.length > 0) {
      categories.push('Palavras-chave');
    }

    if (!profile?.interests || profile.interests.length === 0) {
      // Se não há interesses, mostra categorias padrão
      categories.push(
        'Saúde' as Category,
        'Educação' as Category,
        'Segurança' as Category,
        'Trabalho' as Category,
        'Meio Ambiente' as Category,
        'Economia' as Category,
        'Tecnologia' as Category,
        'Direitos Humanos' as Category,
        'Outros' as Category,
      );
    } else {
      // Se há interesses, adiciona os interesses do usuário
      categories.push(...profile.interests as Category[]);
    }

    return categories;
  }, [profile?.interests, profile?.keywords]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadInitialData = async () => {
    try {
      // 1. Try to load from cache first
      const cachedData = await AsyncStorage.getItem('projects_cache');
      if (cachedData) {
        const parsedProjects = JSON.parse(cachedData);
        setProjects(parsedProjects);
        setLoading(false);

        // Load favorites in background
        loadFavorites();

        // Optional: Update status in background if needed, but don't block
        // batchUpdateProjectsStatus...
        return;
      }

      // 2. If no cache, load from API
      const loadedProjects = await loadProjects();
      await loadFavorites();

      setLoading(false);

      // Start status update in background
      if (loadedProjects && loadedProjects.length > 0) {
        updateStatusForProjects(loadedProjects);
      }
    } catch (err) {
      console.error('Erro no loadInitialData:', err);
      setLoading(false);
    }
  };

  const updateStatusForProjects = async (projectsToUpdate: Project[]) => {
    setUpdatingStatus(true);
    setUpdateProgress({ current: 0, total: projectsToUpdate.length });

    try {
      const results = await batchUpdateProjectsStatus(
        projectsToUpdate,
        (current, total) => setUpdateProgress({ current, total })
      );

      setProjects((currentProjects) => {
        const updated = currentProjects.map((project) => {
          const result = results.get(project.id);
          if (result && result.status) {
            return {
              ...project,
              status: result.status as any,
              statusDetails: result.details,
              progress: typeof result.progress === 'number' ? result.progress : project.progress,
            };
          }
          return project;
        });
        // Update cache with new statuses
        AsyncStorage.setItem('projects_cache', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Erro ao atualizar status automaticamente:', err);
    } finally {
      setUpdatingStatus(false);
      setUpdateProgress({ current: 0, total: 0 });
    }
  };

  const loadProjects = async () => {
    try {
      // Buscar projetos com garantia de mínimo por categoria
      const data = await fetchProjectsWithCategoryMinimum(5, 3);

      // Atualizar contador
      setLoadingCount(data.length);

      // Converter para Project type com todos os campos
      const mappedProjects: Project[] = data.map((transformed: any) => ({
        id: transformed.id,
        title: transformed.title,
        number: transformed.number,
        summary: transformed.summary,
        category: transformed.category,
        status: transformed.status,
        date: transformed.date,
        authorId: '0',
        authorName: transformed.authorName,
        currentStage: transformed.currentStage,
        progress: 0,
        isFavorite: false,
        // Additional fields for details screen
        documentUrl: transformed.documentUrl,
        detailedDescription: transformed.detailedDescription,
        source: transformed.source,
        sourceId: transformed.sourceId,
      }));

      setProjects(mappedProjects);
      // Save to cache
      await AsyncStorage.setItem('projects_cache', JSON.stringify(mappedProjects));

      return mappedProjects;
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      return [];
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await favoritesService.getFavorites();
      if (!error && data) {
        const favIds = new Set<string>(data.map((fav: any) => String(fav.project_id)));
        setFavorites(favIds);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const filteredProjects = (() => {
    let filtered = projects;

    // Filtrar por palavras-chave (busca em título e resumo)
    if (selectedCategory === 'Palavras-chave' && profile?.keywords && profile.keywords.length > 0) {
      filtered = filtered.filter(p => {
        const searchText = `${p.title} ${p.summary}`.toLowerCase();
        return profile.keywords!.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });
    }
    // Filtrar por interesses do usuário (se ativado)
    else if (filterByInterests && profile?.interests && profile.interests.length > 0) {
      filtered = filtered.filter(p =>
        profile.interests.includes(p.category)
      );
    }
    // Filtrar por categoria selecionada
    else if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    // Filtrar por situação/status
    if (selectedStatus && selectedStatus !== 'Todos') {
      filtered = filtered.filter(p => (p.status || 'Em tramitação') === selectedStatus);
    }

    return filtered;
  })();

  // Marcar projetos como favoritos
  const projectsWithFavorites = filteredProjects.map(p => ({
    ...p,
    isFavorite: favorites.has(p.id)
  }));

  const handleToggleFavorite = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const projectId = String(project.id); // Usar sempre o id do projeto
    const isFavorite = favorites.has(id);

    if (isFavorite) {
      try {
        console.log('[ProjectsScreen] removeFavorite called with projectId=', projectId);
        const { data, error } = await favoritesService.removeFavorite(projectId);
        if (!error) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          await loadFavorites();
          return;
        }

        // retry without possible prefix
        if (projectId.startsWith('camara-')) {
          const altId = projectId.replace(/^camara-/, '');
          const retry = await favoritesService.removeFavorite(altId);
          if (!retry.error) {
            setFavorites(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
            await loadFavorites();
            return;
          }
        }

        // fallback: reload favorites
        await loadFavorites();
        console.error('Erro ao remover favorito:', error || data);
        Alert.alert('Erro', typeof error === 'string' ? error : 'Erro ao remover favorito');
      } catch (err) {
        console.error('Erro ao remover favorito (catch):', err);
        await loadFavorites();
        Alert.alert('Erro', 'Erro ao remover favorito');
      }
    } else {
      const { error } = await favoritesService.addFavorite(projectId, project);
      if (!error) {
        setFavorites(prev => new Set(prev).add(id));
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force reload from API
    const loadedProjects = await loadProjects();
    await loadFavorites();
    if (loadedProjects.length > 0) {
      updateStatusForProjects(loadedProjects);
    }
    setRefreshing(false);
  };

  const handleUpdateAllStatus = async () => {
    if (projects.length === 0) {
      Alert.alert('Aviso', 'Nenhum projeto para atualizar');
      return;
    }

    setUpdatingStatus(true);
    setUpdateProgress({ current: 0, total: projects.length });

    try {
      console.log('🔄 Iniciando atualização de status em tempo real...');

      const results = await batchUpdateProjectsStatus(
        projects,
        (current, total) => {
          setUpdateProgress({ current, total });
        }
      );

      // Atualizar projetos com novos status
      const updatedProjects = projects.map((project) => {
        const result = results.get(project.id);
        if (result && result.status) {
          return {
            ...project,
            status: result.status as any, // Type assertion para ProjectStatus
            statusDetails: result.details,
            progress: typeof result.progress === 'number' ? result.progress : project.progress,
          };
        }
        return project;
      });

      setProjects(updatedProjects);

      console.log(`✅ ${results.size} projetos atualizados com sucesso`);
      Alert.alert(
        'Atualização Concluída',
        `Status de ${results.size} projetos foi atualizado em tempo real!`
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status dos projetos');
    } finally {
      setUpdatingStatus(false);
      setUpdateProgress({ current: 0, total: 0 });
    }
  };

  const handleSupport = async (projectId: string) => {
    console.log('Apoiar projeto:', projectId);
    const { error } = await projectsService.registerInteraction(projectId, 'like');
    if (error) {
      Alert.alert('Erro', 'Não foi possível registrar seu apoio.');
    } else {
      Alert.alert('Sucesso', 'Seu apoio foi registrado!');
    }
  };

  const handleAgainst = async (projectId: string) => {
    console.log('Contra projeto:', projectId);
    const { error } = await projectsService.registerInteraction(projectId, 'dislike');
    if (error) {
      Alert.alert('Erro', 'Não foi possível registrar sua posição.');
    } else {
      Alert.alert('Sucesso', 'Sua posição contra foi registrada!');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <HeaderWithNotifications title="Projetos" unreadCount={3} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando projetos...</Text>
          {loadingCount > 0 && (
            <Text style={styles.loadingCountText}>📊 {loadingCount} projetos</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header with Notifications */}
      <HeaderWithNotifications title="Projetos" unreadCount={3} />

      {/* Status Update Progress */}
      {updatingStatus && (
        <View style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={{ fontSize: fontSize.sm, color: colors.white, fontWeight: fontWeight.semibold }}>
            Atualizando status... {updateProgress.current}/{updateProgress.total}
          </Text>
        </View>
      )}

      {/* Category Tabs or Interests Info */}
      {!filterByInterests ? (
        <View>
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {filterCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.tab,
                    selectedCategory === category && styles.tabActive,
                  ]}
                  onPress={() => handleCategoryChange(category)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedCategory === category && styles.tabTextActive,
                    ]}
                  >
                    {category === 'Palavras-chave' ? '🔍 ' : ''}{category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status filter tabs */}
          <View style={{ backgroundColor: colors.white }}>
            <FilterTabs
              label="Situação"
              options={[
                'Todos',
                'Em tramitação',
                'Em votação',
                'Em análise',
                'Aprovado',
                'Arquivado',
                'Vetado',
                'Retirado',
              ]}
              selectedOption={selectedStatus}
              onSelectOption={(opt) => handleStatusChange(opt)}
            />
          </View>

          {/* Mostrar keywords ativas quando Palavras-chave estiver selecionado */}
          {selectedCategory === 'Palavras-chave' && profile?.keywords && profile.keywords.length > 0 && (
            <View style={styles.keywordsInfoContainer}>
              <Text style={styles.keywordsInfoTitle}>🔍 Buscando por:</Text>
              <View style={styles.keywordsTagsContainer}>
                {profile.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordTagText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.filterCountContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.filterCountText}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto' : 'projetos'}
              </Text>

              {/* Botão de atualizar status */}
              <TouchableOpacity
                onPress={handleUpdateAllStatus}
                disabled={updatingStatus}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: 16,
                  backgroundColor: updatingStatus ? colors.border : colors.primary,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={{ fontSize: 12 }}>🔄</Text>
                )}
                <Text style={{ fontSize: fontSize.xs, color: colors.white, fontWeight: fontWeight.semibold }}>
                  Atualizar Status
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.interestsInfoContainer}>
          <Text style={styles.interestsInfoText}>
            Mostrando projetos de:
          </Text>
          <View style={styles.interestsTagsContainer}>
            {profile?.interests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Projects List */}
      <FlatList
        data={projectsWithFavorites}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => navigation.navigate('ProjectDetails', { project: item })}
            onToggleFavorite={handleToggleFavorite}
            onSupport={handleSupport}
            onAgainst={handleAgainst}
          />
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  loadingCountText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterCountContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterCountText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  interestsInfoContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  interestsInfoText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  interestsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  interestTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  keywordsInfoContainer: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.warningYellow,
  },
  keywordsInfoTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  keywordsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  keywordTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.warningYellow,
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  keywordTagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#000000',
  },
  listContent: {
    padding: spacing.lg,
  },
});
