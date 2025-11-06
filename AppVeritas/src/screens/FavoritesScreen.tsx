import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectCard, EmptyState, HeaderWithNotifications } from '../components';
import { Project, RootStackParamList } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';
import { favoritesService } from '../services/backendService';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState<number | null>(null);

  // Atualiza favoritos ao focar na tela
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
      // Polling a cada 2 segundos
      const interval = setInterval(loadFavorites, 2000);
      setPolling(interval);
      return () => {
        clearInterval(interval);
        setPolling(null);
      };
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const { data, error } = await favoritesService.getFavorites();
      if (!error && data) {
        // Mapear favoritos para projetos
        const mappedProjects: Project[] = data.map((fav: any) => {
          const projectData = fav.project_data || {};
          return {
            id: String(fav.project_id),
            title: projectData.title || projectData.summary || 'Projeto Favorito',
            number: projectData.number || `ID ${fav.project_id}`,
            summary: projectData.summary || projectData.title || 'Sem descrição',
            category: projectData.category || 'Economia',
            status: projectData.status || 'Em análise',
            date: projectData.date || fav.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            authorId: projectData.authorId || '0',
            authorName: projectData.authorName || 'Autor não informado',
            currentStage: projectData.currentStage || 'Aguardando informações',
            progress: projectData.progress || 0,
            isFavorite: true,
            // Additional fields for details screen
            documentUrl: projectData.documentUrl,
            detailedDescription: projectData.detailedDescription,
            source: projectData.source || 'Câmara dos Deputados',
            sourceId: projectData.sourceId || String(fav.project_id),
          };
        });
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      console.log('[FavoritesScreen] removeFavorite called with id=', id);
      // Remover dos favoritos
      const { data, error } = await favoritesService.removeFavorite(id);
      if (!error) {
        setProjects(prev => prev.filter(p => p.id !== id));
        // atualizar lista do backend para garantir consistência
        await loadFavorites();
        return;
      }

      // Se houve erro (por exemplo favorito não encontrado), tentar formas alternativas
      // Ex: alguns favoritos podem ter sido salvos com prefixos. Tentar remover sem prefixo 'camara-'.
      if (typeof id === 'string' && id.startsWith('camara-')) {
        const altId = id.replace(/^camara-/, '');
        console.log('[FavoritesScreen] retry remove with altId=', altId);
        const retry = await favoritesService.removeFavorite(altId);
        if (!retry.error) {
          setProjects(prev => prev.filter(p => p.id !== id && p.id !== altId));
          await loadFavorites();
          return;
        }
      }

      // fallback: recarregar favoritos para mostrar estado real e logar erro
  await loadFavorites();
  console.error('Erro ao remover favorito:', error || data);
  Alert.alert('Erro', typeof error === 'string' ? error : 'Erro ao remover favorito');
    } catch (err) {
      console.error('Erro ao remover favorito (catch):', err);
      // Recarregar para manter UI consistente
      await loadFavorites();
      Alert.alert('Erro', 'Erro ao remover favorito');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleSupport = (projectId: string) => {
    console.log('Apoiar projeto:', projectId);
    Alert.alert('Apoiar', `Você apoiou o projeto ${projectId}`);
  };

  const handleAgainst = (projectId: string) => {
    console.log('Contra projeto:', projectId);
    Alert.alert('Contra', `Você se posicionou contra o projeto ${projectId}`);
  };

  const handleAlert = (projectId: string) => {
    console.log('Alertar projeto:', projectId);
    Alert.alert('Alerta', `Você ativou alertas para o projeto ${projectId}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <HeaderWithNotifications title="Favoritos" unreadCount={3} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header with Notifications */}
      <HeaderWithNotifications title="Favoritos" unreadCount={3} />

      {/* Favorites List */}
      {projects.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Nenhum favorito ainda"
          message="Toque na estrela nos projetos que você quer acompanhar de perto"
        />
      ) : (
        <FlatList
          data={projects}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate('ProjectDetails', { project: item })}
              onToggleFavorite={handleToggleFavorite}
              onSupport={handleSupport}
              onAgainst={handleAgainst}
              onAlert={handleAlert}
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
      )}
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
  listContent: {
    padding: spacing.lg,
  },
});
