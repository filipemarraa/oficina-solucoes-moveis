import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar, HeaderWithNotifications } from '../components';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../constants/mockData';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, profile, signOut, loading: authLoading, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'interests' | 'notifications' | 'about' | 'terms' | null>(null);
  const [editInterests, setEditInterests] = useState<string[]>(profile?.interests || []);
  const [editKeywords, setEditKeywords] = useState<string>('');
  const [savingInterests, setSavingInterests] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    if (!authLoading) setLoading(false);
  }, [authLoading]);

  // Editar interesses
  const handleEditInterests = () => {
    setEditInterests(profile?.interests || []);
    setEditKeywords(profile?.keywords?.join(', ') || '');
    setModal('interests');
  };
  const handleSaveInterests = async () => {
    setSavingInterests(true);

    // Processar keywords
    const keywordsList = editKeywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    await updateProfile({
      interests: editInterests,
      keywords: keywordsList
    });

    setSavingInterests(false);
    setModal(null);
  };

  // Notificações
  const handleNotifications = () => setModal('notifications');
  // Sobre
  const handleAbout = () => setModal('about');
  // Termos
  const handleTerms = () => setModal('terms');
  // Sair
  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => await signOut() },
      ]
    );
  };

  const menuItems = [
    {
      icon: '⭐',
      title: 'Meus Interesses',
      subtitle: (() => {
        const interestsCount = profile?.interests?.length || 0;
        const keywordsCount = profile?.keywords?.length || 0;
        const parts = [];
        if (interestsCount > 0) parts.push(`${interestsCount} categorias`);
        if (keywordsCount > 0) parts.push(`${keywordsCount} palavras-chave`);
        return parts.length > 0 ? parts.join(', ') : 'Nenhum configurado';
      })(),
      onPress: handleEditInterests,
    },
    {
      icon: '🔔',
      title: 'Configurações de Notificações',
      onPress: handleNotifications,
    },
    {
      icon: 'ℹ️',
      title: 'Sobre o Veritas',
      onPress: handleAbout,
    },
    {
      icon: '📄',
      title: 'Termos e Privacidade',
      onPress: handleTerms,
    },
    {
      icon: '🚪',
      title: 'Sair',
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <HeaderWithNotifications title="Perfil" unreadCount={3} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <HeaderWithNotifications title="Perfil" unreadCount={0} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userInfo}>
          <Avatar
            uri={profile?.avatar_url || undefined}
            name={profile?.name || user?.name || 'Usuário'}
            size={80}
          />
          <Text style={styles.userName}>{profile?.name || user?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{profile?.email || user?.email || ''}</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.menuIcon,
                  item.destructive && styles.menuIconDestructive,
                ]}>
                  <Text style={styles.menuIconText}>{item.icon}</Text>
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={[
                    styles.menuItemTitle,
                    item.destructive && styles.menuItemTitleDestructive,
                  ]}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Veritas v1.0.0</Text>
      </ScrollView>

      {/* Modal de edição de interesses */}
      <Modal visible={modal === 'interests'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Interesses</Text>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Categorias */}
              <Text style={styles.sectionTitle}>Categorias de Interesse</Text>
              <View style={styles.interestsGrid}>
                {categories.map((cat) => {
                  const selected = editInterests.includes(cat);
                  return (
                    <Pressable
                      key={cat}
                      style={[styles.interestChip, selected && styles.interestChipSelected]}
                      onPress={() => {
                        setEditInterests((prev) =>
                          selected ? prev.filter((c) => c !== cat) : [...prev, cat]
                        );
                      }}
                    >
                      <Text style={[styles.interestChipText, selected && styles.interestChipTextSelected]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Palavras-chave */}
              <Text style={styles.sectionTitle}>Palavras-Chave Personalizadas</Text>
              <TextInput
                style={styles.keywordsInput}
                placeholder="Ex: aposentadoria, salário mínimo, impostos..."
                placeholderTextColor={colors.textSecondary}
                value={editKeywords}
                onChangeText={setEditKeywords}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.helperText}>
                Separe com vírgula para adicionar múltiplas palavras
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModal(null)} disabled={savingInterests}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveInterests} disabled={savingInterests}>
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>{savingInterests ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de notificações */}
      <Modal visible={modal === 'notifications'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurações de Notificações</Text>
            <View style={{ marginVertical: 16 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>Receber notificações push:</Text>
              <TouchableOpacity style={styles.notifToggle} onPress={() => setNotifEnabled((v) => !v)}>
                <Text style={{ fontSize: 16 }}>{notifEnabled ? '✅ Ativado' : '❌ Desativado'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModal(null)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal sobre o Veritas */}
      <Modal visible={modal === 'about'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sobre o Veritas</Text>
            <Text style={{ fontSize: 16, color: colors.text, marginVertical: 16 }}>
              O Veritas é um app para acompanhamento de projetos e alertas do governo brasileiro. Desenvolvido por Gabriel Loures.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModal(null)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de termos */}
      <Modal visible={modal === 'terms'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Termos e Privacidade</Text>
            <ScrollView style={{ maxHeight: 220, marginVertical: 16 }}>
              <Text style={{ fontSize: 15, color: colors.text }}>
                Ao usar o Veritas, você concorda com os Termos de Serviço e a Política de Privacidade. Seus dados são protegidos e usados apenas para funcionamento do app.
              </Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModal(null)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuIconDestructive: {
    backgroundColor: colors.error + '20',
  },
  menuIconText: {
    fontSize: 20,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  menuItemSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItemTitleDestructive: {
    color: colors.error,
  },
  menuItemArrow: {
    fontSize: 32,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  version: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalScrollView: {
    width: '100%',
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  keywordsInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  interestChip: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interestChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestChipText: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  interestChipTextSelected: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  modalButtonPrimaryText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  notifToggle: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
});
