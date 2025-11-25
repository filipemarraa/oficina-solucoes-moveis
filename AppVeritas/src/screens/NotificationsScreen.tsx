import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Notification, RootStackParamList } from '../types';
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../constants/theme';
import { alertsService } from '../services/backendService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

// Mock data para demonstração
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'trending',
    title: 'Novo projeto em alta!',
    description: '"PL 1234/2024 - Saúde" está recebendo muitas interações',
    projectId: '1234',
    projectTitle: 'PL 1234/2024 - Saúde',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    isRead: false,
    icon: '🔥',
  },
  {
    id: '2',
    type: 'interest_update',
    title: 'Atualização de interesse',
    description: 'Projeto que você apoia teve uma nova movimentação',
    projectId: '5678',
    projectTitle: 'PL 5678/2024 - Educação',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    isRead: false,
    icon: '👍',
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Status alterado',
    description: '"PL 5678/2024" foi aprovado em comissão',
    projectId: '5678',
    projectTitle: 'PL 5678/2024',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Ontem
    isRead: true,
    icon: '📊',
  },
  {
    id: '4',
    type: 'keyword_match',
    title: 'Nova correspondência',
    description: 'Novo projeto relacionado a "aposentadoria"',
    projectId: '9012',
    projectTitle: 'PL 9012/2024',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    isRead: true,
    icon: '🔍',
  },
];

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const { data, error } = await alertsService.getAlerts();
    if (data) {
      const mappedNotifications: Notification[] = data.map((alert: any) => ({
        id: alert.id,
        type: mapAlertType(alert.type),
        title: alert.title,
        description: alert.message,
        projectId: alert.project_id,
        projectTitle: alert.project_id ? `Projeto #${alert.project_id}` : undefined, // Placeholder title
        date: alert.created_at,
        isRead: alert.is_read,
        icon: getIconForType(alert.type),
      }));
      setNotifications(mappedNotifications);
    } else {
      console.error('Erro ao carregar notificações:', error);
    }
    setLoading(false);
  };

  const mapAlertType = (backendType: string): any => {
    switch (backendType) {
      case 'update': return 'interest_update';
      case 'success': return 'status_change';
      default: return 'keyword_match';
    }
  };

  const getIconForType = (backendType: string): string => {
    switch (backendType) {
      case 'update': return '👍';
      case 'success': return '📊';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  const groupNotificationsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      Hoje: [],
      Ontem: [],
      'Esta Semana': [],
      'Mais Antigas': [],
    };

    notifications.forEach((notification) => {
      const notificationDate = new Date(notification.date);
      const notificationDay = new Date(
        notificationDate.getFullYear(),
        notificationDate.getMonth(),
        notificationDate.getDate()
      );

      if (notificationDay.getTime() === today.getTime()) {
        groups['Hoje'].push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        groups['Ontem'].push(notification);
      } else if (notificationDate >= thisWeek) {
        groups['Esta Semana'].push(notification);
      } else {
        groups['Mais Antigas'].push(notification);
      }
    });

    return groups;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays === 1) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await alertsService.markAlertAsRead(id);
  };

  const handleDelete = (id: string) => {
    // Note: Backend doesn't have delete endpoint for alerts yet, so we just hide it locally
    // or we could implement a delete endpoint. For now, local hide.
    RNAlert.alert(
      'Excluir notificação',
      'Tem certeza que deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          },
        },
      ]
    );
  };

  const showActionMenu = (notification: Notification) => {
    RNAlert.alert(
      'Ações',
      undefined,
      [
        !notification.isRead && {
          text: 'Marcar como lida',
          onPress: () => handleMarkAsRead(notification.id),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDelete(notification.id),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ].filter(Boolean) as any
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marcar como lida
    handleMarkAsRead(notification.id);

    // Navegar para o projeto (se houver)
    if (notification.projectId) {
      // TODO: Buscar o projeto completo e navegar
      console.log('Navigate to project:', notification.projectId);
    }
  };

  const renderNotificationCard = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.notificationCardUnread,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>{item.icon}</Text>
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>• {formatTime(item.date)}</Text>
          <TouchableOpacity
            onPress={() => showActionMenu(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;

    return (
      <View key={title} style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item) => (
          <View key={item.id}>
            {renderNotificationCard({ item })}
          </View>
        ))}
      </View>
    );
  };

  const groupedNotifications = groupNotificationsByDate();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.chevronIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.bellContainer}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={['content']}
        renderItem={() => (
          <View>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>Sem notificações</Text>
                <Text style={styles.emptyText}>
                  Você não possui novas notificações no momento.
                </Text>
              </View>
            ) : (
              <>
                {renderSection('Hoje', groupedNotifications['Hoje'])}
                {renderSection('Ontem', groupedNotifications['Ontem'])}
                {renderSection('Esta Semana', groupedNotifications['Esta Semana'])}
                {renderSection('Mais Antigas', groupedNotifications['Mais Antigas'])}
              </>
            )}
          </View>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  bellContainer: {
    position: 'relative',
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryCyan,
    backgroundColor: '#F0FDFF',
  },
  notificationContent: {
    gap: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notificationIcon: {
    fontSize: 28,
  },
  notificationTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  notificationDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 36, // Alinha com o texto (ícone + gap)
  },
  notificationTime: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  moreIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  chevronIcon: {
    fontSize: 28,
    color: colors.text,
  },
  bellIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
