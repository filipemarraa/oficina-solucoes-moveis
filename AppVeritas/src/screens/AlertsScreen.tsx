import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCard, EmptyState } from '../components';
import { Alert } from '../types';
import { colors, fontSize, fontWeight, spacing } from '../constants/theme';
import { alertsService } from '../services/backendService';

export const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await alertsService.getAlerts();
      if (!error && data) {
        // Mapear alertas do backend para o formato do app
        const mappedAlerts: Alert[] = data.map((alert: any) => ({
          id: alert.id,
          title: alert.title,
          message: alert.message,
          type: alert.type as 'info' | 'update' | 'success',
          date: alert.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          isRead: alert.is_read,
          projectId: alert.project_id,
        }));
        setAlerts(mappedAlerts);
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const handleAlertPress = async (id: string) => {
    try {
      // Marcar como lido no backend
      const { error } = await alertsService.markAlertAsRead(id);
      if (!error) {
        // Atualizar localmente
        setAlerts(prevAlerts =>
          prevAlerts.map(a =>
            a.id === id ? { ...a, isRead: true } : a
          )
        );
      }
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🔔 Alertas</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Atualizações sobre seus projetos
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando alertas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // App.tsx already renders the top safe area (blue). Keep only bottom safe area here.
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🔔 Alertas</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          Atualizações sobre seus projetos
        </Text>
      </View>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Nenhum alerta no momento"
          message="Você será notificado quando houver atualizações nos seus projetos favoritos"
        />
      ) : (
        <FlatList
          data={alerts}
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              onPress={() => handleAlertPress(item.id)}
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
  header: {
    // make header same gray as page background
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    opacity: 0.9,
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
