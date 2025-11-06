/**
 * 📖 Exemplos Práticos de Uso - Status de Projetos
 *
 * Este arquivo contém exemplos reais de como usar as novas
 * funcionalidades implementadas para gerenciar status de projetos.
 *
 * Correções principais:
 * - Adicionadas tipagens (Project) para evitar `never[]` em useState
 * - Tratamento seguro de valores opcionais (null checks)
 * - Tipagem para contadores e estatísticas
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  fetchCamaraPropositions,
  transformCamaraToProject,
  fetchCamaraPropositionAuthors,
  mapStatus,
  refreshProjectStatus,
} from '../services/governmentApi';
import { debugProjectStatus, validateStatusMapping } from '../services/statusDebugHelper';
import { Project } from '../types';

// Local example type used in this file: extend Project with a couple optional fields
type ExampleProject = Project & {
  statusUpdatedAt?: string;
  statusDetails?: string;
  sourceId?: string | number;
};

// ============================================
// EXEMPLO 1: Carregar Projetos com Status Real
// ============================================

export const Example1_LoadProjectsWithRealStatus = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Buscar dados da API
      const data = await fetchCamaraPropositions(50, 1);

      // Transformar usando a função correta
      const transformed = await Promise.all(
        data.map(async (prop: any) => {
          const authors = await fetchCamaraPropositionAuthors(prop.id);
          return transformCamaraToProject(prop, authors) as Project;
        })
      );

      setProjects(transformed);
      console.log('✅ Projetos carregados com status real!');
    } catch (error) {
      console.error('❌ Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={loadProjects}>
        <Text>Carregar Projetos</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator />}
      {projects.map((p) => (
        <View key={p.id}>
          <Text>{p.title}</Text>
          <Text>Status: {p.status}</Text>
        </View>
      ))}
    </View>
  );
};

// ============================================
// EXEMPLO 2: Atualizar Status de um Projeto
// ============================================

export const Example2_RefreshSingleProjectStatus = () => {
  const [project, setProject] = useState<ExampleProject | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshStatus = async (projectId: number) => {
    setRefreshing(true);
    try {
      // Buscar status atualizado
      const updated: any = await refreshProjectStatus(projectId);

      setProject((prev) =>
        prev
          ? ({
              ...prev,
              status: updated.status ?? prev.status,
              currentStage: updated.currentStage ?? prev.currentStage,
              statusDetails: updated.statusDetails ?? prev.statusDetails,
              statusUpdatedAt: new Date().toISOString(),
            } as ExampleProject)
          : prev
      );

      console.log('✅ Status atualizado:', updated.status);
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View>
      {project && (
        <>
          <Text>{project.title}</Text>
          <Text>Status: {project.status}</Text>
          <TouchableOpacity
            onPress={() => project && handleRefreshStatus(Number(project.sourceId))}
            disabled={refreshing}
          >
            <Text>{refreshing ? 'Atualizando...' : '🔄 Atualizar Status'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ============================================
// EXEMPLO 3: Mapear Status Manualmente
// ============================================

export const Example3_ManualStatusMapping = () => {
  const examples = [
    { desc: 'Arquivada', code: 923 },
    { desc: 'Aprovada pelo Senado', code: 924 },
    { desc: 'Pronta para Pauta no Plenário', code: 920 },
    { desc: 'Tramitando em Comissão', code: 919 },
  ];

  return (
    <View>
      <Text>Exemplos de Mapeamento:</Text>
      {examples.map((ex, idx) => {
        const mapped = mapStatus(ex.desc, ex.code);
        return (
          <View key={idx}>
            <Text>Input: "{ex.desc}" (código: {ex.code})</Text>
            <Text>Output: "{mapped}"</Text>
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// EXEMPLO 4: Debug em Desenvolvimento
// ============================================

export const Example4_DebugInDevelopment = () => {
  useEffect(() => {
    // Executar apenas em modo desenvolvimento
    if (__DEV__) {
      console.log('🔍 Iniciando debug de status...');

      // Opção 1: Debug de projetos reais
      debugProjectStatus(10).then(() => {
        console.log('✅ Debug concluído');
      });

      // Opção 2: Validar mapeamento
      const results = validateStatusMapping();
      console.log(`📊 Testes: ${results.passed}/${results.total} passaram`);
    }
  }, []);

  return null; // Apenas logs
};

// ============================================
// EXEMPLO 5: Filtrar Projetos por Status
// ============================================

export const Example5_FilterByStatus = () => {
  const [projects, setProjects] = useState<ExampleProject[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  const statuses = [
    'Todos',
    'Em tramitação',
    'Em votação',
    'Em análise',
    'Aprovado',
    'Arquivado',
    'Vetado',
    'Retirado',
  ];

  const filteredProjects = selectedStatus === 'Todos' ? projects : projects.filter((p) => p.status === selectedStatus);

  return (
    <View>
      <Text>Filtrar por Status:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={{
              padding: 8,
              margin: 4,
              backgroundColor: selectedStatus === status ? '#3B82F6' : '#E5E7EB',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: selectedStatus === status ? '#FFF' : '#000' }}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text>Mostrando: {filteredProjects.length} projetos</Text>
    </View>
  );
};

// ============================================
// EXEMPLO 6: Cache Inteligente de Status
// ============================================

export const Example6_SmartStatusCache = () => {
  const [projects, setProjects] = useState<ExampleProject[]>([]);

  // Verifica se precisa atualizar (mais de 1 hora)
  const shouldRefresh = (project: ExampleProject) => {
    if (!project.statusUpdatedAt) return true;

    const hoursSinceUpdate = (Date.now() - new Date(project.statusUpdatedAt).getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate > 1;
  };

  // Atualizar apenas projetos desatualizados
  const refreshStaleProjects = async () => {
    const staleProjects = projects.filter(shouldRefresh);

    console.log(`📊 ${staleProjects.length} projetos precisam atualização`);

    const updated: any[] = await Promise.all(
      staleProjects.map(async (p) => {
        const newStatus = await refreshProjectStatus(Number(p.sourceId));
        return {
          ...p,
          ...newStatus,
          statusUpdatedAt: new Date().toISOString(),
        } as ExampleProject;
      })
    );

    // Mesclar com projetos existentes
    setProjects((prev) => prev.map((p) => updated.find((u) => u.id === p.id) || p));
  };

  return (
    <View>
      <TouchableOpacity onPress={refreshStaleProjects}>
        <Text>🔄 Atualizar Status Desatualizados</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================
// EXEMPLO 7: Estatísticas de Distribuição
// ============================================

export const Example7_StatusStatistics = () => {
  const [projects, setProjects] = useState<ExampleProject[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    // Calcular estatísticas
    const statusCount: Record<string, number> = {};
    projects.forEach((p) => {
      const status = p.status || 'Desconhecido';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    setStats(statusCount);
  }, [projects]);

  return (
    <View>
      <Text>📊 Distribuição de Status:</Text>
      {Object.entries(stats).map(([status, count]) => {
        const percentageNum = projects.length ? (count / projects.length) * 100 : 0;
        const percentage = percentageNum.toFixed(1);
        return (
          <View key={status}>
            <Text>
              {status}: {count} ({percentage}%)
            </Text>
            <View
              style={{
                width: `${percentage}%` as any,
                height: 8,
                backgroundColor: '#3B82F6',
                borderRadius: 4,
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// EXEMPLO 8: Indicador de Última Atualização
// ============================================

export const Example8_LastUpdateIndicator = () => {
  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - then) / (1000 * 60));

    if (diffMinutes < 1) return 'agora mesmo';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays} dias`;
  };

  const project: Partial<ExampleProject> = {
    title: 'PL 1234/2024',
    status: 'Em votação',
    statusUpdatedAt: '2025-10-28T10:30:00Z',
  };

  return (
    <View>
      <Text>{project.title}</Text>
      <Text>Status: {project.status}</Text>
      {project.statusUpdatedAt && (
        <Text style={{ fontSize: 12, color: '#6B7280' }}>
          Atualizado {getTimeAgo(project.statusUpdatedAt)}
        </Text>
      )}
    </View>
  );
};

// ============================================
// EXEMPLO 9: Cor por Status
// ============================================

export const Example9_StatusColors = () => {
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      Arquivado: '#6B7280', // Cinza
      Aprovado: '#10B981', // Verde
      Vetado: '#EF4444', // Vermelho
      Retirado: '#F59E0B', // Laranja
      'Em votação': '#3B82F6', // Azul
      'Em análise': '#8B5CF6', // Roxo
      'Em tramitação': '#6366F1', // Índigo
    };
    return colorMap[status] || '#6B7280';
  };

  const statuses = ['Arquivado', 'Aprovado', 'Vetado', 'Retirado', 'Em votação', 'Em análise', 'Em tramitação'];

  return (
    <View>
      <Text>🎨 Cores por Status:</Text>
      {statuses.map((status) => (
        <View key={status} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
          <View style={{ width: 16, height: 16, backgroundColor: getStatusColor(status), borderRadius: 8, marginRight: 8 }} />
          <Text>{status}</Text>
        </View>
      ))}
    </View>
  );
};

// ============================================
// EXEMPLO 10: Uso Completo no Componente
// ============================================

export const Example10_CompleteUsage = () => {
  const [projects, setProjects] = useState<ExampleProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar ao montar
  useEffect(() => {
  loadProjects();
    
    // Debug em desenvolvimento
    if (__DEV__) {
      debugProjectStatus(5);
      validateStatusMapping();
    }
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchCamaraPropositions(50, 1);
      const transformed = await Promise.all(
        data.map(async (prop: any) => {
          const authors = await fetchCamaraPropositionAuthors(prop.id);
          return transformCamaraToProject(prop, authors) as Project;
        })
      );

  // Adicionar timestamp
  const withTimestamp: ExampleProject[] = transformed.map((p) => ({ ...p, statusUpdatedAt: new Date().toISOString() } as ExampleProject));

  setProjects(withTimestamp);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const refreshSingleProject = async (projectId: number) => {
    try {
      const updated = await refreshProjectStatus(projectId);
      
  setProjects((prev) => prev.map((p) => (p.sourceId === projectId ? ({ ...p, ...updated, statusUpdatedAt: new Date().toISOString() } as ExampleProject) : p)));
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {/* Lista de projetos com todos os recursos */}
      {projects.map((project) => (
        <View key={project.id} style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>{project.title}</Text>
          <Text>{project.summary}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {/* Badge com cor */}
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: getStatusColor(project.status), borderRadius: 12 }}>
              <Text style={{ color: '#FFF', fontSize: 12 }}>{project.status}</Text>
            </View>

            {/* Última atualização */}
            {project.statusUpdatedAt && (
              <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 8 }}>{getTimeAgo(project.statusUpdatedAt)}</Text>
            )}

            {/* Botão de refresh */}
            <TouchableOpacity onPress={() => refreshSingleProject(Number(project.sourceId))} style={{ marginLeft: 'auto' }}>
              <Text>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

// Helper functions usadas nos exemplos
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'Arquivado': '#6B7280',
    'Aprovado': '#10B981',
    'Vetado': '#EF4444',
    'Retirado': '#F59E0B',
    'Em votação': '#3B82F6',
    'Em análise': '#8B5CF6',
    'Em tramitação': '#6366F1',
  };
  return colorMap[status] || '#6B7280';
};

const getTimeAgo = (timestamp: string) => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMinutes = Math.floor((now - then) / (1000 * 60));
  
  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} dias`;
};

export default {
  Example1_LoadProjectsWithRealStatus,
  Example2_RefreshSingleProjectStatus,
  Example3_ManualStatusMapping,
  Example4_DebugInDevelopment,
  Example5_FilterByStatus,
  Example6_SmartStatusCache,
  Example7_StatusStatistics,
  Example8_LastUpdateIndicator,
  Example9_StatusColors,
  Example10_CompleteUsage,
};
