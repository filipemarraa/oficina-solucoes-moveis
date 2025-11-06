/**
 * 🔍 Helper para Debug e Testes de Status de Projetos
 * 
 * Use este arquivo para testar e validar o mapeamento de status
 * Útil para desenvolvimento e troubleshooting
 */

import { fetchCamaraPropositions, mapStatus } from './governmentApi';

/**
 * Busca projetos e exibe informações detalhadas de status
 * Útil para debug e entender os dados da API
 */
export const debugProjectStatus = async (limit: number = 10) => {
  console.log('🔍 === DEBUG: Status de Projetos ===\n');
  
  try {
    const propositions = await fetchCamaraPropositions(limit, 1);
    
    propositions.forEach((prop, index) => {
      const statusOriginal = prop.statusProposicao?.descricaoSituacao || 'N/A';
      const codSituacao = prop.statusProposicao?.codSituacao || 'N/A';
      const statusMapeado = mapStatus(statusOriginal, prop.statusProposicao?.codSituacao);
      
      console.log(`\n📄 Projeto ${index + 1}: ${prop.siglaTipo} ${prop.numero}/${prop.ano}`);
      console.log(`   Status Original: "${statusOriginal}"`);
      console.log(`   Código Situação: ${codSituacao}`);
      console.log(`   Status Mapeado: "${statusMapeado}"`);
      console.log(`   Tramitação: ${prop.statusProposicao?.descricaoTramitacao || 'N/A'}`);
      console.log(`   Última Atualização: ${prop.statusProposicao?.dataHora || 'N/A'}`);
    });
    
    // Estatísticas
    console.log('\n\n📊 === ESTATÍSTICAS ===');
    const statusCount: Record<string, number> = {};
    propositions.forEach(prop => {
      const status = mapStatus(
        prop.statusProposicao?.descricaoSituacao || '',
        prop.statusProposicao?.codSituacao
      );
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} (${((count / limit) * 100).toFixed(1)}%)`);
    });
    
    console.log('\n=================================\n');
  } catch (error) {
    console.error('❌ Erro ao buscar projetos:', error);
  }
};

/**
 * Retorna estatísticas de status de uma lista de projetos
 */
export const getStatusStatistics = (projects: any[]) => {
  const stats: Record<string, number> = {};
  
  projects.forEach(project => {
    const status = project.status || 'Desconhecido';
    stats[status] = (stats[status] || 0) + 1;
  });
  
  return stats;
};

/**
 * Valida se o mapeamento de status está funcionando corretamente
 */
export const validateStatusMapping = () => {
  console.log('✅ === TESTE DE MAPEAMENTO DE STATUS ===\n');
  
  const testCases = [
    { input: 'Arquivada', code: 923, expected: 'Arquivado' },
    { input: 'Aprovada pelo Senado', code: 924, expected: 'Aprovado' },
    { input: 'Transformada em Norma Jurídica', code: 925, expected: 'Aprovado' },
    { input: 'Vetada Totalmente', code: 926, expected: 'Vetado' },
    { input: 'Retirada pelo Autor', code: 927, expected: 'Retirado' },
    { input: 'Pronta para Pauta no Plenário', code: 920, expected: 'Em votação' },
    { input: 'Aguardando Deliberação do Recurso', code: 921, expected: 'Em votação' },
    { input: 'Tramitando em Comissão', code: 919, expected: 'Em análise' },
    { input: 'Aguardando Parecer', code: undefined, expected: 'Em votação' },
    { input: '', code: undefined, expected: 'Em tramitação' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((test, index) => {
    const result = mapStatus(test.input, test.code);
    const isCorrect = result === test.expected;
    
    if (isCorrect) {
      passed++;
      console.log(`✅ Teste ${index + 1}: PASSOU`);
    } else {
      failed++;
      console.log(`❌ Teste ${index + 1}: FALHOU`);
      console.log(`   Input: "${test.input}" (código: ${test.code})`);
      console.log(`   Esperado: "${test.expected}"`);
      console.log(`   Obtido: "${result}"`);
    }
  });
  
  console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou de ${testCases.length} testes`);
  console.log('=====================================\n');
  
  return { passed, failed, total: testCases.length };
};

/**
 * Exemplos de uso real da API
 */
export const exampleUsage = () => {
  console.log(`
📖 === EXEMPLOS DE USO ===

1. Debug de status (em desenvolvimento):
   import { debugProjectStatus } from './services/statusDebugHelper';
   await debugProjectStatus(20);

2. Validar mapeamento:
   import { validateStatusMapping } from './services/statusDebugHelper';
   validateStatusMapping();

3. Obter estatísticas:
   import { getStatusStatistics } from './services/statusDebugHelper';
   const stats = getStatusStatistics(projects);
   console.log(stats);

4. No React Native Debugger, adicione no useEffect:
   useEffect(() => {
     if (__DEV__) {
       debugProjectStatus(10);
     }
   }, []);

==========================
  `);
};

// Executar validação ao importar (apenas em DEV)
if (__DEV__) {
  // Descomente para executar automaticamente em desenvolvimento
  // validateStatusMapping();
}

export default {
  debugProjectStatus,
  getStatusStatistics,
  validateStatusMapping,
  exampleUsage,
};
