import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import images from '../assets/images';
import { Button } from '../components';
import { Category } from '../types';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface InterestsScreenProps {
  onSave: (interests: Category[]) => void;
}

// 8 Categorias fixas conforme especificação
const FIXED_CATEGORIES: { category: Category; emoji: string }[] = [
  { category: 'Saúde', emoji: '❤️' },
  { category: 'Segurança', emoji: '🛡️' },
  { category: 'Educação', emoji: '📚' },
  { category: 'Economia', emoji: '🏗️' }, // Infraestrutura mapeada para Economia
  { category: 'Trabalho', emoji: '💼' },
  { category: 'Meio Ambiente', emoji: '🌳' },
  { category: 'Tecnologia', emoji: '🏠' }, // Moradia mapeada para Tecnologia
  { category: 'Direitos Humanos', emoji: '🚌' }, // Transporte mapeado para Direitos Humanos
];

export const InterestsScreen: React.FC<InterestsScreenProps> = ({ onSave }) => {
  const { updateProfile, loading } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<Category[]>([]);
  const [keywords, setKeywords] = useState<string>('');

  const toggleInterest = (category: Category) => {
    if (selectedInterests.includes(category)) {
      setSelectedInterests(selectedInterests.filter(c => c !== category));
    } else {
      setSelectedInterests([...selectedInterests, category]);
    }
  };

  const handleSave = async () => {
    try {
      // Processar keywords: separar por vírgula, limpar espaços, filtrar vazios
      const keywordsList = keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
      
      console.log('Salvando interesses:', selectedInterests);
      console.log('Salvando keywords:', keywordsList);
      
      // Atualizar no backend com interesses E keywords
      await updateProfile({ 
        interests: selectedInterests,
        keywords: keywordsList
      });
      
      // Salvar localmente também
      onSave(selectedInterests);
    } catch (error) {
      // Erro já tratado no AuthContext
    }
  };

  const handleSkip = async () => {
    try {
      // Salvar array vazio no backend
      await updateProfile({ interests: [] });
      onSave([]);
    } catch (error) {
      // Se falhar, apenas pular localmente
      onSave([]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {images.logo ? (
          <Image source={images.logo} style={styles.logoImage} resizeMode="contain" />
        ) : (
          <Text style={styles.logo}>⚖️</Text>
        )}
        <Text style={styles.headerTitle}>VERITAS</Text>
        {/* Removido o texto 'PASSO 1' conforme solicitado */}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Seus Interesses</Text>
        <Text style={styles.subtitle}>
          Selecione os temas que mais importam para você
        </Text>

        {/* Grid 2x2 com 8 categorias */}
        <View style={styles.categoriesGrid}>
          {FIXED_CATEGORIES.map(({ category, emoji }) => {
            const isSelected = selectedInterests.includes(category);
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => toggleInterest(category)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>
                  {isSelected ? '❤️' : emoji}
                </Text>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Campo de Keywords Personalizadas */}
        <View style={styles.keywordsSection}>
          <Text style={styles.keywordsTitle}>Palavras-Chaves Personalizadas</Text>
          <TextInput
            style={styles.keywordsInput}
            placeholder="Ex: aposentadoria, salário mínimo..."
            placeholderTextColor={colors.textSecondary}
            value={keywords}
            onChangeText={setKeywords}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            Separe com vírgula para adicionar múltiplas palavras
          </Text>
        </View>

        <Button
          title="Salvar Interesses"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={selectedInterests.length === 0 || loading}
          loading={loading}
        />

        <TouchableOpacity 
          onPress={handleSkip} 
          style={styles.skipButton} 
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.skipText}>Pular por enquanto</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 10,
    paddingBottom: 0,
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    marginBottom: spacing.xs,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 2,
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: colors.successGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  stepBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  categoryCardSelected: {
    borderColor: colors.primaryCyan,
    backgroundColor: 'rgba(0, 188, 212, 0.05)',
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    fontWeight: fontWeight.bold,
    color: colors.primaryCyan,
  },
  keywordsSection: {
    marginBottom: spacing.xl,
  },
  keywordsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  keywordsInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
