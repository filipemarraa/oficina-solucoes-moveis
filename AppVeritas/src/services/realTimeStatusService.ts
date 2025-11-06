/**
 * 🔄 Real-Time Status Service
 * 
 * Serviço para buscar e atualizar o status de projetos em tempo real
 * usando as APIs oficiais da Câmara e do Senado.
 * 
 * Funcionalidades:
 * - Busca status atualizado de projetos da Câmara via codSituacao
 * - Busca status atualizado de projetos do Senado via textoResultado
 * - Cache local para evitar requisições excessivas
 * - Atualização em lote de múltiplos projetos
 */

import {
  fetchCamaraRealTimeStatus,
  fetchSenadoRealTimeStatus,
  fetchRealTimeProjectStatus,
} from './governmentApi';
import { Project } from '../types';

// Cache de status (em memória)
interface StatusCache {
  [projectId: string]: {
    status: string;
    timestamp: number;
    details: any;
    progress?: number;
  };
}

const statusCache: StatusCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Simple progress mapping by status label
const computeProgressFromStatus = (status: string | undefined, codSituacao?: number): number => {
  if (!status && !codSituacao) return 0;

  const s = (status || '').toLowerCase();

  // If codSituacao available, we can special-case known final states
  if (codSituacao) {
    // Codes that are final
    const finalCodes = new Set([923, 930, 931, 940, 1250, 1292, 1299, 1140]);
    if (finalCodes.has(codSituacao)) return 100;
  }

  if (/(aprovad|sancionad|transformad)/i.test(s)) return 100;
  if (/(arquivad|arquivado|enviada ao arquivo)/i.test(s)) return 100;
  if (/(vetad)/i.test(s)) return 100;
  if (/(retirad)/i.test(s)) return 100;
  if (/(em votação|pronta para pauta|delibera)/i.test(s)) return 75;
  if (/(análise|analise|comiss|parecer|apreciac)/i.test(s)) return 40;
  if (/(aguardando|aguardando|recebimento|distribui)/i.test(s)) return 20;

  // default
  return 20;
};

/**
 * Busca status em tempo real com cache
 */
export const fetchProjectStatusWithCache = async (
  project: Project
): Promise<{
  status: string;
  fromCache: boolean;
  updated: boolean;
  details: any;
  progress?: number;
}> => {
  const cacheKey = project.id;
  const cached = statusCache[cacheKey];

  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      status: cached.status,
      fromCache: true,
      updated: true,
        details: cached.details,
        progress: cached.progress,
    };
  }

  // Buscar em tempo real
  try {
    // Validar se temos sourceId
    if (!project.sourceId) {
      throw new Error('Project missing sourceId');
    }

    const result = await fetchRealTimeProjectStatus({
      sourceId: project.sourceId,
      source: project.source as 'camara' | 'senado',
    });

    // Compute progress from status (simple mapping)
    const progress = computeProgressFromStatus(result.status, result.details?.codSituacao);

    // Atualizar cache
    if (result.updated) {
      statusCache[cacheKey] = {
        status: result.status,
        timestamp: Date.now(),
        details: result.details,
        progress,
      };
    }

    return {
      ...result,
      fromCache: false,
      progress,
    };
  } catch (error) {
    console.error('Erro ao buscar status em tempo real:', error);
    return {
      status: project.status || 'Em tramitação',
      fromCache: false,
      updated: false,
      details: null,
    };
  }
};

/**
 * Atualiza status de múltiplos projetos em lote
 * Útil para atualizar a lista de projetos ao fazer refresh
 */
export const batchUpdateProjectsStatus = async (
  projects: Project[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, { status: string; details: any; progress?: number }>> => {
  const results = new Map<string, { status: string; details: any; progress?: number }>();
  
  // Processar em lotes de 5 para não sobrecarregar a API
  const batchSize = 5;
  
  for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (project) => {
      try {
        const result = await fetchProjectStatusWithCache(project);
        return { projectId: project.id, status: result.status, details: result.details, progress: result.progress } as {
          projectId: string;
          status: string;
          details: any;
          progress?: number;
        };
      } catch (error) {
        console.error(`Erro ao atualizar projeto ${project.id}:`, error);
        return { projectId: project.id, status: project.status || 'Em tramitação', details: null, progress: undefined } as {
          projectId: string;
          status: string;
          details: any;
          progress?: number;
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.projectId, {
          status: result.value.status,
          details: result.value.details,
          progress: result.value.progress,
        });
      }
    });
    
    // Callback de progresso
    if (onProgress) {
      onProgress(Math.min(i + batchSize, projects.length), projects.length);
    }
    
    // Pequeno delay entre lotes para respeitar rate limits
    if (i + batchSize < projects.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

/**
 * Limpa o cache de status
 */
export const clearStatusCache = () => {
  Object.keys(statusCache).forEach((key) => delete statusCache[key]);
};

/**
 * Obtém estatísticas do cache
 */
export const getStatusCacheStats = () => {
  const now = Date.now();
  const entries = Object.entries(statusCache);
  
  return {
    total: entries.length,
    valid: entries.filter(([, value]) => now - value.timestamp < CACHE_TTL).length,
    expired: entries.filter(([, value]) => now - value.timestamp >= CACHE_TTL).length,
  };
};

export default {
  fetchProjectStatusWithCache,
  batchUpdateProjectsStatus,
  clearStatusCache,
  getStatusCacheStats,
};
