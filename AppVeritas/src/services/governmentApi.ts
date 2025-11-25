import axios from 'axios';
import AI_CONFIG from './aiConfig';

// Base URLs for Government APIs
// Documentation: https://dadosabertos.camara.leg.br/swagger/api.html
const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';
const SENADO_API_BASE = 'https://legis.senado.leg.br/dadosabertos';

// Rate limiter utility - limit concurrent requests
const createRateLimiter = (maxConcurrent: number = 3) => {
  let activeRequests = 0;
  const queue: Array<() => Promise<any>> = [];

  const processQueue = async () => {
    if (queue.length === 0 || activeRequests >= maxConcurrent) {
      return;
    }

    activeRequests++;
    const task = queue.shift();
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error('Rate limiter task error:', error);
      }
    }
    activeRequests--;
    processQueue();
  };

  return {
    async run<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise((resolve, reject) => {
        queue.push(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        processQueue();
      });
    }
  };
};

const limiter = createRateLimiter(3); // Max 3 concurrent requests

// Lazy import AI service (only when needed)
let aiService: any = null;
const getAIService = async () => {
  if (!aiService && AI_CONFIG.ENABLED) {
    aiService = await import('./aiCategorization');
  }
  return aiService;
};

// Types for API responses
export interface CamaraProposition {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  statusProposicao: {
    dataHora: string;
    sequencia: number;
    siglaOrgao: string;
    uriOrgao: string;
    regime: string;
    descricaoTramitacao: string;
    codTipoTramitacao: string;
    descricaoSituacao: string;
    codSituacao: number;
    despacho: string;
    url: string;
    ambito: string;
  };
  uriAutores: string;
  descricaoTipo: string;
  ementaDetalhada: string;
  keywords: string;
  uriPropPrincipal: string;
  uriPropAnterior: string;
  uriPropPosterior: string;
  urlInteiroTeor: string;
  urnFinal: string;
  texto: string;
  justificativa: string;
}

export interface CamaraAuthor {
  uri: string;
  nome: string;
  codTipo: number;
  tipo: string;
  ordemAssinatura: number;
  proponente: number;
}

export interface SenadoProposition {
  CodigoMateria: string;
  DescricaoIdentificacaoMateria: string;
  DescricaoSubtipoMateria: string;
  NumeroMateria: string;
  AnoMateria: string;
  Ementa: string;
  DataApresentacao: string;
  IndicadorTramitando: string;
  Autor: {
    NomeAutor: string;
    SiglaPartidoAutor: string;
    UfAutor: string;
  };
}

// Category mapping from government data - Enhanced version
export const mapCategoria = (keywords: string = '', ementa: string = ''): string => {
  const text = `${keywords || ''} ${ementa || ''}`.toLowerCase().trim();

  // Return default if empty
  if (!text) {
    return 'Economia'; // Default para projetos sem descrição
  }

  // SAÚDE - termos expandidos
  if (
    text.includes('saúde') || text.includes('saude') ||
    text.includes('sus') || text.includes('hospital') ||
    text.includes('médico') || text.includes('medico') ||
    text.includes('medicamento') || text.includes('vacina') ||
    text.includes('enfermeiro') || text.includes('tratamento') ||
    text.includes('doença') || text.includes('doenca') ||
    text.includes('paciente') || text.includes('clínica') || text.includes('clinica') ||
    text.includes('ambulatório') || text.includes('ambulatorio') ||
    text.includes('sanitário') || text.includes('sanitaria')
  ) {
    return 'Saúde';
  }

  // EDUCAÇÃO - termos expandidos
  if (
    text.includes('educação') || text.includes('educacao') ||
    text.includes('escola') || text.includes('ensino') ||
    text.includes('professor') || text.includes('aluno') ||
    text.includes('universidade') || text.includes('faculdade') ||
    text.includes('estudante') || text.includes('curso') ||
    text.includes('aprendizagem') || text.includes('pedagógico') || text.includes('pedagogico') ||
    text.includes('didático') || text.includes('didatico') ||
    text.includes('enem') || text.includes('vestibular') ||
    text.includes('creche') || text.includes('pré-escola') || text.includes('pre-escola')
  ) {
    return 'Educação';
  }

  // SEGURANÇA - termos expandidos
  if (
    text.includes('segurança') || text.includes('seguranca') ||
    text.includes('polícia') || text.includes('policia') ||
    text.includes('crime') || text.includes('criminal') ||
    text.includes('violência') || text.includes('violencia') ||
    text.includes('penal') || text.includes('presídio') || text.includes('presidio') ||
    text.includes('prisão') || text.includes('prisao') ||
    text.includes('delegacia') || text.includes('investigação') || text.includes('investigacao') ||
    text.includes('armamento') || text.includes('arma de fogo') ||
    text.includes('tráfico') || text.includes('trafico') ||
    text.includes('código penal') || text.includes('codigo penal')
  ) {
    return 'Segurança';
  }

  // TRABALHO - termos expandidos
  if (
    text.includes('trabalho') || text.includes('trabalhista') ||
    text.includes('emprego') || text.includes('trabalhador') ||
    text.includes('salário') || text.includes('salario') ||
    text.includes('remuneração') || text.includes('remuneracao') ||
    text.includes('contrato de trabalho') || text.includes('clt') ||
    text.includes('sindicato') || text.includes('desemprego') ||
    text.includes('aposentadoria') || text.includes('previdência') || text.includes('previdencia') ||
    text.includes('inss') || text.includes('férias') || text.includes('ferias') ||
    text.includes('jornada') || text.includes('horário de trabalho')
  ) {
    return 'Trabalho';
  }

  // MEIO AMBIENTE - termos expandidos
  if (
    text.includes('meio ambiente') || text.includes('ambiental') ||
    text.includes('sustentável') || text.includes('sustentavel') ||
    text.includes('clima') || text.includes('climática') || text.includes('climatica') ||
    text.includes('ecológico') || text.includes('ecologico') ||
    text.includes('floresta') || text.includes('desmatamento') ||
    text.includes('poluição') || text.includes('poluicao') ||
    text.includes('biodiversidade') || text.includes('fauna') || text.includes('flora') ||
    text.includes('reciclagem') || text.includes('lixo') || text.includes('resíduo') ||
    text.includes('água') || text.includes('hidrico') || text.includes('saneamento') ||
    text.includes('energia renovável') || text.includes('energia renovavel') ||
    text.includes('descarbonização') || text.includes('descarbonizacao') ||
    text.includes('carbono') || text.includes('emissão') || text.includes('emissao') ||
    text.includes('neutralidade') || text.includes('gases') || text.includes('efeito estufa') ||
    text.includes('aquecimento global') || text.includes('mudança climática') || text.includes('mudanca climatica')
  ) {
    return 'Meio Ambiente';
  }

  // TECNOLOGIA - termos expandidos
  if (
    text.includes('tecnologia') || text.includes('tecnológico') || text.includes('tecnologico') ||
    text.includes('digital') || text.includes('internet') ||
    text.includes('dados') || text.includes('informação') || text.includes('informacao') ||
    text.includes('software') || text.includes('aplicativo') ||
    text.includes('computador') || text.includes('eletrônico') || text.includes('eletronico') ||
    text.includes('inteligência artificial') || text.includes('inteligencia artificial') ||
    text.includes('cibernético') || text.includes('cyber') ||
    text.includes('telecomunicação') || text.includes('telecomunicacao') ||
    text.includes('5g') || text.includes('banda larga') ||
    text.includes('privacidade de dados') || text.includes('lgpd')
  ) {
    return 'Tecnologia';
  }

  // DIREITOS HUMANOS - termos expandidos
  if (
    text.includes('direitos humanos') ||
    text.includes('igualdade') || text.includes('equidade') ||
    text.includes('discriminação') || text.includes('discriminacao') ||
    text.includes('lgbtqi') || text.includes('lgbt') ||
    text.includes('racismo') || text.includes('racial') ||
    text.includes('gênero') || text.includes('genero') ||
    text.includes('feminino') || text.includes('feminismo') ||
    text.includes('acessibilidade') || text.includes('deficiente') || text.includes('deficiência') ||
    text.includes('criança') || text.includes('adolescente') || text.includes('idoso') ||
    text.includes('minoria') || text.includes('inclusão') || text.includes('inclusao') ||
    text.includes('refugiado') || text.includes('imigrante')
  ) {
    return 'Direitos Humanos';
  }

  // ECONOMIA - termos expandidos (verificar por último pois é muito amplo)
  if (
    text.includes('economia') || text.includes('econômico') || text.includes('economico') ||
    text.includes('fiscal') || text.includes('tributário') || text.includes('tributario') ||
    text.includes('imposto') || text.includes('taxa') || text.includes('tributo') ||
    text.includes('orçamento') || text.includes('orcamento') ||
    text.includes('financeiro') || text.includes('monetário') || text.includes('monetario') ||
    text.includes('banco') || text.includes('crédito') || text.includes('credito') ||
    text.includes('dívida') || text.includes('divida') ||
    text.includes('mercado') || text.includes('comercial') || text.includes('comércio') || text.includes('comercio') ||
    text.includes('empresa') || text.includes('empresarial') ||
    text.includes('pib') || text.includes('inflação') || text.includes('inflacao') ||
    text.includes('lei complementar') || text.includes('lei ordinária') || text.includes('codigo civil')
  ) {
    return 'Economia';
  }

  // Se não encontrou nenhuma categoria específica, retorna Economia (mais genérico para leis)
  return 'Economia';
};

// Status mapping - Improved version with more cases
export const mapStatus = (
  descricaoSituacao: string = '',
  codSituacao?: number
): string => {
  // If both missing, default
  if (!descricaoSituacao && !codSituacao) {
    return 'Em tramitação';
  }

  // Normalize description: lowercase and remove diacritics for robust matching
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize && s.normalize('NFD').replace(/\p{Diacritic}/gu, '') || s.toLowerCase();

  const situacaoRaw = (descricaoSituacao || '').toString();
  const situacao = normalize(situacaoRaw);

  // Explicit code-based mapping derived from the Câmara catalog.
  // NOTE: Many "Aguardando ..." codes are considered as 'Em tramitação' by default.
  // Codes that clearly indicate committee/parecer are mapped to 'Em análise'.
  // Codes that indicate pauta/deliberação are mapped to 'Em votação'.
  // Codes that indicate arquivamento/recusa are mapped to 'Arquivado'.
  // Codes that indicate veto/vetado are mapped to 'Vetado'.
  // Codes that indicate retirada are mapped to 'Retirado'.
  const codMap: Record<number, string> = {
    // Waiting / general tramitation -> Em tramitação
    900: 'Em tramitação',
    901: 'Em tramitação',
    902: 'Em tramitação',
    905: 'Em tramitação',
    906: 'Em tramitação',
    907: 'Em tramitação',
    910: 'Em tramitação',
    911: 'Em tramitação',
    912: 'Em tramitação',
    914: 'Em tramitação',
    917: 'Em tramitação',
    918: 'Em tramitação',
    921: 'Em tramitação',
    922: 'Em tramitação',
    925: 'Em tramitação',
    926: 'Em tramitação',
    927: 'Em tramitação',
    929: 'Em tramitação',
    932: 'Em tramitação',
    933: 'Em tramitação',
    934: 'Em tramitação',
    935: 'Em tramitação',
    936: 'Em tramitação',
    1000: 'Em tramitação',
    1010: 'Em tramitação',
    1020: 'Em tramitação',
    1030: 'Em tramitação',
    1040: 'Em tramitação',
    1050: 'Em tramitação',
    1052: 'Em tramitação',
    1060: 'Em tramitação',
    1070: 'Em tramitação',
    1080: 'Em tramitação',
    1110: 'Em tramitação',
    1120: 'Em tramitação',
    1150: 'Em tramitação',
    1160: 'Em tramitação',
    1161: 'Em tramitação',
    1170: 'Em tramitação',
    1180: 'Em tramitação',
    1185: 'Em tramitação',
    1200: 'Em tramitação',
    1201: 'Em tramitação',
    1210: 'Em tramitação',
    1220: 'Em tramitação',
    1221: 'Em tramitação',
    1223: 'Em tramitação',
    1230: 'Em tramitação',
    1260: 'Em tramitação',
    1270: 'Em tramitação',
    1290: 'Em tramitação',
    1291: 'Em tramitação',
    1293: 'Em tramitação',
    1294: 'Em tramitação',
    1296: 'Em tramitação',
    1298: 'Em tramitação',
    1299: 'Em tramitação',
    1301: 'Em tramitação',
    1302: 'Em tramitação',
    1303: 'Em tramitação',
    1304: 'Em tramitação',
    1305: 'Em tramitação',
    1311: 'Em tramitação',
    1312: 'Em tramitação',
    1314: 'Em tramitação',
    1350: 'Em tramitação',
    1360: 'Em tramitação',
    1381: 'Em tramitação',

    // Deliberation / voting related -> Em votação
    903: 'Em votação',
    904: 'Em votação',
    920: 'Em votação',
    924: 'Em votação',
    939: 'Em votação',
    1222: 'Em votação',

    // Analysis / committee / parecer -> Em análise
    915: 'Em análise',
    928: 'Em análise',
    1090: 'Em análise',
    1295: 'Em análise',
    1297: 'Em análise',
    1300: 'Em análise',
    1310: 'Em análise',
    1313: 'Em análise',
    1355: 'Em análise',
    1380: 'Em análise',

    // Arquivamento / encerramento -> Arquivado
    923: 'Arquivado',
    930: 'Arquivado',
    931: 'Arquivado',
    940: 'Arquivado',
    1250: 'Arquivado',
    1292: 'Arquivado',
    941: 'Arquivado',

    // Vetos
    937: 'Vetado',

    // Retirado
    950: 'Retirado',

    // Transformations / approvals
    1140: 'Aprovado',

    // Misc / finalization -> Em tramitação
    1285: 'Em tramitação',
  };

  if (codSituacao && codMap[codSituacao]) {
    return codMap[codSituacao];
  }

  // Regex-based matching (covers many textual variants and plurals/accents)
  // Arquivado
  if (/arquivad/.test(situacao)) {
    return 'Arquivado';
  }

  // Aprovado / Transformado em Lei / Sancionado / Promulgado
  if (/(aprovad|sancionad|promulgad|transformad|convertid).*norma|convertid.*lei|transformad|sancionad|promulgad|convertid|transformad|promulgad/.test(situacao)) {
    return 'Aprovado';
  }

  // Vetado
  if (/vetad/.test(situacao)) {
    return 'Vetado';
  }

  // Retirado / Devolvido
  if (/(retirad|devolvid)/.test(situacao)) {
    return 'Retirado';
  }

  // Em votação / Pronta para pauta / No plenário
  if (/(pronta para pauta|aguardando delibera|em vota|plenar|aguardando parecer)/.test(situacao)) {
    return 'Em votação';
  }

  // Em análise (comissões)
  if (/(analise|analisao|comiss|parecer|apreciac)/.test(situacao)) {
    return 'Em análise';
  }

  // If code exists but not mapped and description didn't match, log for later analysis
  if (codSituacao && !codMap[codSituacao]) {
    if (__DEV__) {
      console.warn(`mapStatus: código de situação não mapeado encontrado: ${codSituacao} - descricao: ${descricaoSituacao}`);
    }
  }

  // Default
  return 'Em tramitação';
};

// Fetch propositions from Câmara dos Deputados
export const fetchCamaraPropositions = async (
  limit: number = 50,
  page: number = 1
): Promise<CamaraProposition[]> => {
  try {
    const offset = (page - 1) * limit;
    const response = await axios.get(`${CAMARA_API_BASE}/proposicoes`, {
      params: {
        itens: limit,
        pagina: page,
        ordenarPor: 'id',
        ordem: 'DESC',
      },
    });

    return response.data.dados || [];
  } catch (error: any) {
    console.error('Error fetching Câmara propositions:', error.message);
    throw error;
  }
};

// Fetch specific proposition details from Câmara
export const fetchCamaraPropositionDetails = async (
  id: number
): Promise<CamaraProposition> => {
  try {
    const response = await axios.get(`${CAMARA_API_BASE}/proposicoes/${id}`);
    return response.data.dados;
  } catch (error: any) {
    console.error('Error fetching proposition details:', error.message);
    throw error;
  }
};

// Cache for authors to avoid repeated requests
const authorsCache = new Map<number, CamaraAuthor[]>();

// Fetch authors of a proposition from Câmara (with retry, cache, and rate limiting)
export const fetchCamaraPropositionAuthors = async (
  id: number,
  retries: number = 3,
  delayMs: number = 500
): Promise<CamaraAuthor[]> => {
  // Check cache first
  if (authorsCache.has(id)) {
    return authorsCache.get(id) || [];
  }

  return limiter.run(async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(`${CAMARA_API_BASE}/proposicoes/${id}/autores`, {
          timeout: 10000,
        });

        const authors = response.data.dados || [];
        authorsCache.set(id, authors); // Cache the result
        return authors;
      } catch (error: any) {
        const statusCode = error.response?.status;

        if (statusCode === 429) {
          // Rate limit - wait and retry
          if (attempt < retries) {
            console.warn(`⏱️ Rate limit 429 (attempt ${attempt}/${retries}) para projeto ${id}`);
            await new Promise((resolve: (value?: any) => void) => setTimeout(resolve, delayMs));
            delayMs *= 1.5; // Exponential backoff
            continue;
          }
        }

        if (attempt === retries) {
          console.error(`❌ Erro ao buscar autores do projeto ${id}: ${error.message}`);
          return []; // Return empty array on final failure
        }
      }
    }

    return [];
  });
};

// Fetch propositions from Senado Federal
export const fetchSenadoPropositions = async (): Promise<SenadoProposition[]> => {
  try {
    const response = await axios.get(
      `${SENADO_API_BASE}/materia/pesquisa/lista`,
      {
        params: {
          tramitando: 'S',
        },
      }
    );

    // Senado API returns XML, might need to parse
    // For now, returning empty array - implement XML parser if needed
    console.warn('Senado API requires XML parsing - not implemented yet');
    return [];
  } catch (error: any) {
    console.error('Error fetching Senado propositions:', error.message);
    return [];
  }
};

// Transform Câmara data to app format
export const transformCamaraToProject = (
  proposition: CamaraProposition,
  authors: CamaraAuthor[] = []
): any => {
  const mainAuthor = authors.find(a => a.proponente === 1) || authors[0];

  // Format date properly
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0]; // fallback to today
      }
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Use AI categorization if enabled, otherwise fallback to rules
  const category = mapCategoria(proposition.keywords || '', proposition.ementa || '');

  // Debug log (apenas em desenvolvimento)
  if (__DEV__) {
    console.log(`📊 Categorização: "${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}" -> ${category}`);
    console.log(`   Ementa: ${(proposition.ementa || '').substring(0, 60)}...`);
  }

  return {
    id: `camara-${proposition.id}`,
    title: proposition.ementa || `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
    number: `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
    summary: proposition.ementa,
    category: category,
    status: mapStatus(
      proposition.statusProposicao?.descricaoSituacao || '',
      proposition.statusProposicao?.codSituacao
    ),
    date: formatDate(proposition.dataApresentacao),
    authorName: mainAuthor?.nome || 'Autor não informado',
    currentStage: proposition.statusProposicao?.descricaoTramitacao || 'Aguardando informações',
    source: 'camara',
    sourceId: proposition.id,
    detailedDescription: proposition.ementaDetalhada || proposition.ementa,
    documentUrl: proposition.urlInteiroTeor,
    statusDetails: proposition.statusProposicao,
  };
};

/**
 * 🤖 AI-Enhanced version of transformCamaraToProject
 * Uses AI when enabled, falls back to rules automatically
 */
export const transformCamaraToProject_AI = async (
  proposition: CamaraProposition,
  authors: CamaraAuthor[] = []
): Promise<any> => {
  const mainAuthor = authors.find(a => a.proponente === 1) || authors[0];

  // Format date properly
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Try AI categorization if enabled
  let category;
  let status;

  if (AI_CONFIG.ENABLED) {
    try {
      const ai = await getAIService();
      if (ai) {
        // AI Categorization - provide full context so the model can analyze all fields
        category = await ai.categorizeProjeto_AI(
          proposition.ementa || '',
          proposition.keywords || '',
          {
            title: proposition.ementa || `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
            number: `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
            detailedDescription: proposition.ementaDetalhada || proposition.ementa || '',
            authors: (authors || []).map((a: any) => a.nome).filter(Boolean),
            currentStage: proposition.statusProposicao?.descricaoTramitacao || '',
          }
        );

        // AI Status Analysis
        status = await ai.analyzeStatus_AI(
          proposition.statusProposicao?.descricaoSituacao || '',
          proposition.statusProposicao?.descricaoTramitacao || '',
          proposition.statusProposicao?.despacho || ''
        );

        if (__DEV__) {
          console.log(`🤖 AI: ${proposition.siglaTipo} ${proposition.numero}/${proposition.ano} -> ${category} | ${status}`);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('⚠️ AI failed, using fallback:', error);
      }
    }
  }

  // Fallback to rule-based if AI not available
  if (!category) {
    category = mapCategoria(proposition.keywords || '', proposition.ementa || '');
  }
  if (!status) {
    status = mapStatus(
      proposition.statusProposicao?.descricaoSituacao || '',
      proposition.statusProposicao?.codSituacao
    );
  }

  return {
    id: `camara-${proposition.id}`,
    title: proposition.ementa || `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
    number: `${proposition.siglaTipo} ${proposition.numero}/${proposition.ano}`,
    summary: proposition.ementa,
    category: category,
    status: status,
    date: formatDate(proposition.dataApresentacao),
    authorName: mainAuthor?.nome || 'Autor não informado',
    currentStage: proposition.statusProposicao?.descricaoTramitacao || 'Aguardando informações',
    source: 'camara',
    sourceId: proposition.id,
    detailedDescription: proposition.ementaDetalhada || proposition.ementa,
    documentUrl: proposition.urlInteiroTeor,
    statusDetails: proposition.statusProposicao,
    // Flag indicating if AI was used
    aiEnhanced: AI_CONFIG.ENABLED,
  };
};

// Main function to fetch all projects
export const fetchAllProjects = async (page: number = 1) => {
  try {
    // Fetch from Câmara (50 projetos por página)
    const camaraProps = await fetchCamaraPropositions(50, page);

    // Transform with authors
    const projects = await Promise.all(
      camaraProps.map(async (prop) => {
        const authors = await fetchCamaraPropositionAuthors(prop.id);
        return transformCamaraToProject(prop, authors);
      })
    );

    return projects;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return [];
  }
};

/**
 * 🎯 Fetch projects ensuring minimum coverage per category
 * Busca múltiplas páginas até atingir no mínimo N projetos por categoria
 */
export const fetchProjectsWithCategoryMinimum = async (
  minPerCategory: number = 5,
  maxPages: number = 3
): Promise<any[]> => {
  try {
    const allProjects: any[] = [];
    const categoryCounts: { [key: string]: number } = {};

    // Categories to track
    const CATEGORIES = [
      'Saúde',
      'Educação',
      'Segurança',
      'Trabalho',
      'Meio Ambiente',
      'Economia',
      'Tecnologia',
      'Direitos Humanos',
    ];

    // Initialize counts
    CATEGORIES.forEach(cat => {
      categoryCounts[cat] = 0;
    });

    // Fetch multiple pages until we have minimum per category
    for (let page = 1; page <= maxPages; page++) {
      console.log(`📄 Buscando página ${page}...`);

      const camaraProps = await fetchCamaraPropositions(50, page);

      if (camaraProps.length === 0) {
        console.log('⚠️ Sem mais projetos disponíveis');
        break;
      }

      // Transform and count
      const pageProjects = await Promise.all(
        camaraProps.map(async (prop) => {
          const authors = await fetchCamaraPropositionAuthors(prop.id);
          const transformed = await transformCamaraToProject_AI(prop, authors);

          // Count by category
          if (CATEGORIES.includes(transformed.category)) {
            categoryCounts[transformed.category]++;
          }

          return transformed;
        })
      );

      allProjects.push(...pageProjects);

      // Check if we have minimum for all categories
      const hasMinimum = CATEGORIES.every(
        cat => categoryCounts[cat] >= minPerCategory
      );

      if (hasMinimum) {
        console.log('✅ Atingido mínimo de projetos por categoria!');
        break;
      }

      // Log current status
      console.log('📊 Status de categorias:');
      CATEGORIES.forEach(cat => {
        const count = categoryCounts[cat];
        const status = count >= minPerCategory ? '✅' : '⏳';
        console.log(`   ${status} ${cat}: ${count}/${minPerCategory}`);
      });
    }

    return allProjects;
  } catch (error) {
    console.error('Error fetching projects with category minimum:', error);
    return [];
  }
};

// Search projects
export const searchProjects = async (query: string) => {
  try {
    const response = await axios.get(`${CAMARA_API_BASE}/proposicoes`, {
      params: {
        keywords: query,
        itens: 20,
        ordenarPor: 'id',
        ordem: 'DESC',
      },
    });

    const propositions = response.data.dados || [];

    const projects = await Promise.all(
      propositions.map(async (prop: CamaraProposition) => {
        const authors = await fetchCamaraPropositionAuthors(prop.id);
        return transformCamaraToProject(prop, authors);
      })
    );

    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
};

// Refresh status of a specific project by fetching latest details
export const refreshProjectStatus = async (id: number): Promise<{
  status: string;
  currentStage: string;
  statusDetails: any;
}> => {
  try {
    const details = await fetchCamaraPropositionDetails(id);
    return {
      status: mapStatus(
        details.statusProposicao?.descricaoSituacao || '',
        details.statusProposicao?.codSituacao
      ),
      currentStage: details.statusProposicao?.descricaoTramitacao || 'Aguardando informações',
      statusDetails: details.statusProposicao,
    };
  } catch (error) {
    console.error('Error refreshing project status:', error);
    return {
      status: 'Em tramitação',
      currentStage: 'Erro ao atualizar',
      statusDetails: null,
    };
  }
};

/**
 * 🔄 REAL-TIME STATUS UPDATE - Câmara
 * Busca a situação atualizada em tempo real diretamente da API da Câmara
 * Usa o endpoint de detalhes da proposição para obter codSituacao e descricaoSituacao
 */
export const fetchCamaraRealTimeStatus = async (
  propositionId: number
): Promise<{
  status: string;
  codSituacao: number;
  descricaoSituacao: string;
  dataHora: string;
  currentStage: string;
}> => {
  try {
    const response = await axios.get(
      `${CAMARA_API_BASE}/proposicoes/${propositionId}`,
      { timeout: 10000 }
    );

    const statusProposicao = response.data.dados?.statusProposicao;

    if (!statusProposicao) {
      throw new Error('Status da proposição não encontrado');
    }

    return {
      status: mapStatus(
        statusProposicao.descricaoSituacao || '',
        statusProposicao.codSituacao
      ),
      codSituacao: statusProposicao.codSituacao,
      descricaoSituacao: statusProposicao.descricaoSituacao,
      dataHora: statusProposicao.dataHora,
      currentStage: statusProposicao.descricaoTramitacao || 'Aguardando informações',
    };
  } catch (error: any) {
    console.error(`Erro ao buscar status em tempo real (Câmara ${propositionId}):`, error.message);
    throw error;
  }
};

/**
 * 🔄 REAL-TIME STATUS UPDATE - Senado
 * Busca a situação atualizada em tempo real da API do Senado
 * Usa o endpoint de resultado de plenário para obter textoResultado
 * 
 * NOTA: A API do Senado retorna XML e requer parsing. 
 * O endpoint /plenario/resultado/{data} retorna resultados de votações em uma data específica.
 * Para buscar o status de uma matéria específica, precisamos da data da sessão ou usar
 * o endpoint de matérias: /materia/{codigo}
 */
export const fetchSenadoRealTimeStatus = async (
  materiaId: number,
  dataSessao?: string // Formato: YYYYMMDD (ex: 20241015)
): Promise<{
  status: string;
  textoResultado: string;
  descricaoDeliberacao: string;
}> => {
  try {
    // Se temos data da sessão, buscar resultado do plenário
    if (dataSessao) {
      const response = await axios.get(
        `${SENADO_API_BASE}/plenario/resultado/${dataSessao}?v=2`,
        { timeout: 10000 }
      );

      // Parse XML (simplificado - em produção use um parser XML apropriado)
      const xmlData = response.data;

      // Buscar pelo codigoMateria no XML
      const codigoMateriaRegex = new RegExp(
        `<codigoMateria>${materiaId}</codigoMateria>[\\s\\S]*?<textoResultado>([\\s\\S]*?)</textoResultado>[\\s\\S]*?<descricaoDeliberacao>([\\s\\S]*?)</descricaoDeliberacao>`,
        'i'
      );

      const match = xmlData.match(codigoMateriaRegex);

      if (match) {
        const textoResultado = match[1].trim();
        const descricaoDeliberacao = match[2].trim();

        // Inferir status baseado no textoResultado
        let status = 'Em tramitação';

        if (/aprovad[ao]/i.test(textoResultado) || /sanção/i.test(textoResultado)) {
          status = 'Aprovado';
        } else if (/arquivad[ao]/i.test(textoResultado)) {
          status = 'Arquivado';
        } else if (/vetad[ao]/i.test(textoResultado)) {
          status = 'Vetado';
        } else if (/retirad[ao] de pauta/i.test(textoResultado)) {
          status = 'Retirado';
        } else if (/votação|deliberação/i.test(textoResultado)) {
          status = 'Em votação';
        }

        return {
          status,
          textoResultado,
          descricaoDeliberacao,
        };
      }
    }

    // Fallback: buscar matéria diretamente
    // Endpoint alternativo: /materia/{codigo} (retorna XML com detalhes)
    throw new Error('Matéria não encontrada no resultado do plenário da data especificada');
  } catch (error: any) {
    console.error(`Erro ao buscar status em tempo real (Senado ${materiaId}):`, error.message);
    throw error;
  }
};

/**
 * 🔄 UNIFIED REAL-TIME STATUS UPDATE
 * Busca o status em tempo real baseado na origem (source) do projeto
 */
export const fetchRealTimeProjectStatus = async (
  project: {
    sourceId: number;
    source: 'camara' | 'senado';
    dataSessao?: string; // Para Senado
  }
): Promise<{
  status: string;
  updated: boolean;
  details: any;
}> => {
  try {
    if (project.source === 'camara') {
      const result = await fetchCamaraRealTimeStatus(project.sourceId);
      return {
        status: result.status,
        updated: true,
        details: result,
      };
    } else if (project.source === 'senado') {
      const result = await fetchSenadoRealTimeStatus(
        project.sourceId,
        project.dataSessao
      );
      return {
        status: result.status,
        updated: true,
        details: result,
      };
    }

    throw new Error('Fonte desconhecida');
  } catch (error) {
    console.error('Erro ao buscar status em tempo real:', error);
    return {
      status: 'Em tramitação',
      updated: false,
      details: null,
    };
  }
};

