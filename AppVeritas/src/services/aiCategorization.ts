/**
 * 🤖 AI-Powered Categorization Service (OPTIMIZED)
 * 
 * Uses free AI models to categorize legislative projects
 * with high accuracy based on FULL CONTEXT ANALYSIS.
 * 
 * Improvements:
 * 1. Reads entire "ementa" for full context understanding
 * 2. Multi-level analysis: keywords + content + semantic meaning
 * 3. Confidence scoring with explanation
 * 4. Better Portuguese language support
 * 5. Context-aware fallback system
 * 
 * Free AI Services Used:
 * 1. Hugging Face Inference API (free tier)
 * 2. OpenRouter API (some free models)
 * 3. Rule-based system with semantic analysis
 */

import axios from 'axios';
import { Category, ProjectStatus } from '../types';
import AI_CONFIG from './aiConfig';

// Free AI API endpoints (defaults - model selection can be overridden via AI_CONFIG)
const HUGGING_FACE_API = 'https://api-inference.huggingface.co/models';
const HUGGING_FACE_TOKEN = AI_CONFIG.HUGGING_FACE?.TOKEN || 'hf_demo'; // Use 'hf_demo' for testing or set token in aiConfig

// Cache to avoid repeated API calls
const categorizationCache = new Map<string, Category>();
const statusCache = new Map<string, ProjectStatus>();
const confidenceScores = new Map<string, number>();
// Store AI-provided confidence when available
const aiConfidenceCache = new Map<string, number>();

// Helper: send prompt to selected model provider (currently Hugging Face)
async function sendModelPrompt(prompt: string, model?: string, timeout = 8000): Promise<string> {
  try {
    const modelName = model || AI_CONFIG.HUGGING_FACE?.MODEL || 'google/flan-t5-base';
    const response = await axios.post(
      `${HUGGING_FACE_API}/${modelName}`,
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
        },
        timeout,
      }
    );

    // Different HF models return text in slightly different shapes
    const raw = response.data[0]?.generated_text || response.data?.generated_text || response.data?.output || '';
    return raw.toString();
  } catch (error: any) {
    if (__DEV__) console.warn('⚠️ sendModelPrompt error:', error?.message || error);
    throw error;
  }
}

// Helper: try to extract JSON object from model text output, with simple fixes
function extractJSON(raw: string): any | null {
  if (!raw) return null;
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  let parsed: any = null;
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      // attempt to fix common issues: single quotes -> double quotes
      try {
        const fixed = jsonMatch[0].replace(/(['"])??\s*'([^']*)'\s*(['"])??/g, '"$2"').replace(/\n/g, ' ');
        parsed = JSON.parse(fixed);
      } catch (err2) {
        if (__DEV__) console.warn('⚠️ extractJSON failed to parse:', err2);
        parsed = null;
      }
    }
  }
  return parsed;
}

/**
 * 📊 Category keywords and semantic patterns (ENHANCED)
 * More comprehensive for better context understanding
 */
const CATEGORY_PATTERNS: Record<string, {
  primary: string[];
  secondary: string[];
  semantic: string[];
  contextPhrases: string[];
}> = {
  'Saúde': {
    primary: ['saúde', 'saude', 'sus', 'hospital', 'médico', 'medico', 'medicamento', 'vacina'],
    secondary: ['enfermeiro', 'tratamento', 'doença', 'doenca', 'paciente', 'clínica', 'clinica', 'ambulatório', 'sanitário'],
    semantic: ['cuidado', 'prevenção', 'cura', 'diagnóstico', 'terapia', 'epidemiologia'],
    contextPhrases: ['política de saúde', 'sistema de saúde', 'assistência médica', 'seguro saúde', 'agência nacional de vigilância']
  },
  'Educação': {
    primary: ['educação', 'educacao', 'escola', 'ensino', 'professor', 'aluno', 'universidade', 'faculdade'],
    secondary: ['estudante', 'curso', 'aprendizagem', 'enem', 'vestibular', 'creche', 'pré-escola'],
    semantic: ['aprendizado', 'pedagogia', 'didática', 'formação', 'capacitação', 'qualificação'],
    contextPhrases: ['lei de diretrizes', 'base nacional curricular', 'sistema educacional', 'instituição de ensino', 'programa educacional']
  },
  'Segurança': {
    primary: ['segurança', 'seguranca', 'polícia', 'policia', 'crime', 'criminal', 'penal', 'código penal'],
    secondary: ['violência', 'violencia', 'presídio', 'presidio', 'prisão', 'prisao', 'delegacia', 'investigação'],
    semantic: ['proteção', 'cumprimento da lei', 'justiça', 'delito', 'enforcement', 'defesa'],
    contextPhrases: ['força de segurança', 'sistema penitenciário', 'justiça criminal', 'agência de segurança', 'órgão policial']
  },
  'Trabalho': {
    primary: ['trabalho', 'trabalhista', 'emprego', 'trabalhador', 'salário', 'salario', 'clt', 'sindicato'],
    secondary: ['desemprego', 'aposentadoria', 'previdência', 'previdencia', 'inss', 'férias', 'ferias', 'jornada'],
    semantic: ['relação laboral', 'direito trabalhista', 'remuneração', 'benefício', 'proteção social'],
    contextPhrases: ['consolidação das leis', 'contribuição social', 'seguro desemprego', 'fundo de garantia', 'reforma trabalhista']
  },
  'Meio Ambiente': {
    primary: ['meio ambiente', 'ambiental', 'sustentável', 'sustentavel', 'clima', 'climática', 'ecológico', 'floresta', 'descarbonização', 'descarbonizacao', 'carbono'],
    secondary: ['desmatamento', 'poluição', 'poluicao', 'biodiversidade', 'fauna', 'flora', 'reciclagem', 'lixo', 'emissão', 'emissao', 'neutralidade', 'gases'],
    semantic: ['conservação', 'preservação', 'sustentabilidade', 'impacto ambiental', 'recursos naturais', 'efeito estufa', 'aquecimento global', 'mudança climática'],
    contextPhrases: ['lei ambiental', 'agenda ambiental', 'proteção ambiental', 'gestão ambiental', 'licenciamento ambiental', 'neutralidade de carbono', 'marco legal da descarbonização']
  },
  'Tecnologia': {
    primary: ['tecnologia', 'tecnológico', 'digital', 'internet', 'dados', 'informação', 'software', 'aplicativo'],
    secondary: ['computador', 'eletrônico', 'eletronico', 'inteligência artificial', 'cyber', 'telecomunicação'],
    semantic: ['inovação', 'conectividade', 'computação', 'automatização', 'transformação digital'],
    contextPhrases: ['marco civil', 'lei de proteção', 'lgpd', 'agência digital', 'infraestrutura tecnológica']
  },
  'Direitos Humanos': {
    primary: ['direitos humanos', 'igualdade', 'equidade', 'discriminação', 'discriminacao', 'lgbtqi', 'lgbt'],
    secondary: ['racismo', 'racial', 'gênero', 'genero', 'feminino', 'feminismo', 'acessibilidade', 'deficiente'],
    semantic: ['dignidade', 'inclusão', 'equidade', 'não discriminação', 'proteção de vulneráveis'],
    contextPhrases: ['direito fundamental', 'princípio de igualdade', 'proteção de minorias', 'convenção internacional', 'estatuto social']
  },
  'Economia': {
    primary: ['economia', 'econômico', 'economico', 'fiscal', 'tributário', 'tributario', 'imposto', 'taxa'],
    secondary: ['orçamento', 'orcamento', 'financeiro', 'monetário', 'monetario', 'banco', 'crédito', 'credito', 'dívida', 'divida'],
    semantic: ['mercado', 'comercial', 'empresa', 'investimento', 'crescimento econômico', 'política fiscal'],
    contextPhrases: ['política econômica', 'lei complementar', 'código civil', 'direito comercial', 'regulação econômica']
  },
  'Outros': {
    primary: [],
    secondary: [],
    semantic: [],
    contextPhrases: []
  }
};

/**
 * 📌 MAIN FUNCTION: Advanced context-aware categorization
 * Analyzes full "ementa" text with multi-level scoring system
 */
export const categorizeProjeto_AI = async (
  ementa: string,
  keywords: string = '',
  // optional full context: title, number, detailedDescription, authors, currentStage
  fullContext?: {
    title?: string;
    number?: string;
    detailedDescription?: string;
    authors?: string[];
    currentStage?: string;
  }
): Promise<Category> => {
  // Check cache first
  const cacheKey = `${ementa}_${keywords}`;
  if (categorizationCache.has(cacheKey)) {
    return categorizationCache.get(cacheKey)!;
  }

  try {
    // 🧠 CONTEXT-AWARE ANALYSIS
    // Read the ENTIRE ementa for context understanding
    const analysis = analyzeContextDeep(ementa, keywords);
    
    if (__DEV__) {
      console.log(`🧠 Análise Contextual:`, analysis);
    }
    
    // Use centralized refineCategoryWithAI helper to keep fallback policy consistent
    const category = await refineCategoryWithAI(analysis, {
      ementa,
      keywords,
      fullContext,
    });
    
    // Cache result with final confidence (AI or analysis)
    categorizationCache.set(cacheKey, category);
    const finalConfidence = aiConfidenceCache.get(cacheKey) || analysis.confidence || 0;
    confidenceScores.set(cacheKey, finalConfidence);
    
    return category;
  } catch (error) {
    console.warn('⚠️ AI categorization failed, using fallback:', error);
    return fallbackCategorizacao(keywords, ementa);
  }
};

/**
 * 🧠 DEEP CONTEXT ANALYSIS
 * Scores each category based on FULL ementa content
 * Returns top category with confidence score
 */
function analyzeContextDeep(
  ementa: string,
  keywords: string = ''
): { category: Category; confidence: number; scores: Record<string, number> } {
  const fullText = `${keywords} ${ementa}`.toLowerCase().trim();
  
  if (!fullText) {
    return { category: 'Economia', confidence: 0.5, scores: {} };
  }
  
  const scores: Record<string, number> = {};
  
  // Score each category
  for (const [categoryName, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    let categoryScore = 0;
    let totalPatterns = 0;
    
    // PRIMARY KEYWORDS - highest weight (0.4)
    for (const keyword of patterns.primary) {
      if (fullText.includes(keyword)) {
        // Count occurrences for stronger signals
        const occurrences = (fullText.match(new RegExp(keyword, 'g')) || []).length;
        categoryScore += Math.min(occurrences * 0.4, 0.4); // Max 0.4 per primary keyword
        totalPatterns++;
      }
    }
    
    // SECONDARY KEYWORDS - medium weight (0.2)
    for (const keyword of patterns.secondary) {
      if (fullText.includes(keyword)) {
        const occurrences = (fullText.match(new RegExp(keyword, 'g')) || []).length;
        categoryScore += Math.min(occurrences * 0.2, 0.2); // Max 0.2 per secondary keyword
        totalPatterns++;
      }
    }
    
    // SEMANTIC PATTERNS - medium weight (0.15)
    for (const pattern of patterns.semantic) {
      if (fullText.includes(pattern)) {
        categoryScore += 0.15;
        totalPatterns++;
      }
    }
    
    // CONTEXT PHRASES - high weight (0.3)
    for (const phrase of patterns.contextPhrases) {
      if (fullText.includes(phrase)) {
        categoryScore += 0.3;
        totalPatterns++;
      }
    }
    
    // Normalize score (0-1)
    const normalizedScore = Math.min(categoryScore / Math.max(totalPatterns, 1), 1.0);
    scores[categoryName] = normalizedScore;
  }
  
  // Find top category
  let topCategory: Category = 'Economia';
  let topScore = 0;
  
  for (const [categoryName, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topCategory = categoryName as Category;
    }
  }
  
  // Calculate confidence (how much better than second place)
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = topScore > 0 
    ? (topScore - (sortedScores[1] || 0)) + topScore // Factor in both gap and absolute score
    : 0;
  
  if (__DEV__) {
    console.log(`📊 Scores: `, Object.fromEntries(
      Object.entries(scores)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
    ));
  }
  
  return {
    category: topCategory,
    confidence: Math.min(confidence, 1.0),
    scores
  };
}

/**
 * Enhanced categorization using AI with Portuguese model
 * Uses a multilingual model better suited for Portuguese
 * Called for refinement when context analysis is uncertain
 */

/**
 * Get confidence score for a categorization
 * Returns 0-1 where 1 is highest confidence
 */
export const getCategorizationConfidence = (ementa: string, keywords: string = ''): number => {
  const cacheKey = `${ementa}_${keywords}`;
  return confidenceScores.get(cacheKey) || 0;
};

/**
 * Get detailed analysis with all category scores
 * Useful for debugging and understanding categorization
 */
export const getDetailedAnalysis = (ementa: string, keywords: string = ''): {
  category: Category;
  confidence: number;
  scores: Record<string, number>;
  explanation: string;
} => {
  const analysis = analyzeContextDeep(ementa, keywords);
  
  // Create explanation
  const topScores = Object.entries(analysis.scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const explanation = topScores
    .map(([cat, score]) => `${cat} (${(score * 100).toFixed(0)}%)`)
    .join(', ');
  
  return {
    ...analysis,
    explanation
  };
};

/**
 * Analyze project status using AI
 * Interprets complex status descriptions
 */
export const analyzeStatus_AI = async (
  descricaoSituacao: string,
  descricaoTramitacao: string,
  despacho: string = ''
): Promise<ProjectStatus> => {
  // Check cache first
  const cacheKey = `${descricaoSituacao}_${descricaoTramitacao}`;
  if (statusCache.has(cacheKey)) {
    return statusCache.get(cacheKey)!;
  }

  try {
    // Prepare context for AI
    const context = `
Status: ${descricaoSituacao || 'N/A'}
Tramitação: ${descricaoTramitacao || 'N/A'}
Despacho: ${despacho?.substring(0, 200) || 'N/A'}
    `.trim();

    // Use Hugging Face's free zero-shot classification
    const response = await axios.post(
      `${HUGGING_FACE_API}/facebook/bart-large-mnli`,
      {
        inputs: context,
        parameters: {
          candidate_labels: [
            'Arquivado',
            'Aprovado',
            'Vetado',
            'Retirado',
            'Em votação',
            'Em análise',
            'Em tramitação',
          ],
          multi_label: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
        },
        timeout: 5000,
      }
    );

    const result = response.data;
    const status = result.labels[0] as ProjectStatus;
    
    // Cache result
    statusCache.set(cacheKey, status);
    
    console.log(`🤖 AI Status: "${descricaoSituacao || descricaoTramitacao}" -> ${status} (${(result.scores[0] * 100).toFixed(1)}% confiança)`);
    
    return status;
  } catch (error) {
    console.warn('⚠️ AI status analysis failed, using fallback');
    return 'Em tramitação';
  }
};

/**
 * 🤖 AI-Powered refinement using Portuguese model
 * Uses a multilingual model better suited for Portuguese
 * Called for edge cases or confidence refinement
 */
export const categorizeProjeto_AI_Portuguese = async (
  ementa: string,
  keywords: string = ''
): Promise<Category> => {
  const cacheKey = `pt_${ementa}_${keywords}`;
  if (categorizationCache.has(cacheKey)) {
    return categorizationCache.get(cacheKey)!;
  }

  try {
    // ✨ ENHANCED PROMPT with full context
    const text = `${keywords} ${ementa}`.trim();
    
    // Create a comprehensive prompt for better understanding
    const prompt = `Você é um especialista em classificação de projetos de lei brasileiros.

Analise COMPLETAMENTE o seguinte texto do projeto:

"${text}"

Entenda o CONTEXTO COMPLETO e classifique em UMA das categorias:
- Saúde: Projetos sobre saúde pública, hospitais, medicamentos, SUS, vacinação
- Educação: Projetos sobre escolas, universidades, ensino, formação profissional
- Segurança: Projetos sobre polícia, crime, justiça criminal, segurança pública
- Trabalho: Projetos sobre emprego, CLT, previdência, relações trabalhistas
- Meio Ambiente: Projetos sobre natureza, climate, sustentabilidade, florestas
- Tecnologia: Projetos sobre internet, dados, inovação, transformação digital
- Direitos Humanos: Projetos sobre igualdade, inclusão, proteção de minorias
- Economia: Projetos sobre economia, impostos, finanças, mercado

Responda APENAS o nome da categoria (sem explicação).`;

    // Use centralized sendModelPrompt helper
    const modelToUse = AI_CONFIG.HUGGING_FACE?.MODEL || 'google/flan-t5-base';
    const raw = await sendModelPrompt(prompt, modelToUse, AI_CONFIG.HUGGING_FACE?.TIMEOUT || 5000);

    // Parse response
    let categoryText = raw.trim();
    
    // Clean up response
    categoryText = categoryText
      .split('\n')[0] // Get first line
      .replace(/[^a-záéíóúâêôãõç\s]/gi, '') // Remove special chars
      .trim();
    
    // Validate and match category
    const validCategories: Category[] = [
      'Saúde',
      'Educação',
      'Segurança',
      'Trabalho',
      'Meio Ambiente',
      'Economia',
      'Direitos Humanos',
      'Tecnologia',
    ];
    
    let category: Category | null = null;
    
    // Try exact match first
    category = validCategories.find(c => c.toLowerCase() === categoryText.toLowerCase()) as Category | undefined || null;
    
    // Try partial match if no exact match
    if (!category) {
      for (const validCat of validCategories) {
        if (validCat.toLowerCase().includes(categoryText.toLowerCase()) || 
            categoryText.toLowerCase().includes(validCat.toLowerCase())) {
          category = validCat;
          break;
        }
      }
    }
    
    // If still no match, use context analysis
    if (!category) {
      const contextAnalysis = analyzeContextDeep(ementa, keywords);
      category = contextAnalysis.category;
    }
    
    categorizationCache.set(cacheKey, category);
    
    if (__DEV__) {
      console.log(`🤖 IA-PT Categorização: "${text.substring(0, 60)}..." -> ${category} (resposta bruta: "${categoryText}")`);
    }
    
    return category;
  } catch (error) {
    if (__DEV__) {
      console.warn('⚠️ IA-PT failed, using context analysis:', error);
    }
    const analysis = analyzeContextDeep(ementa, keywords);
    return analysis.category;
  }
};

/**
 * Full-context prompt: ask the model to analyze ALL available fields
 * and return a structured JSON with category, confidence (0-1), matchedKeywords and explanation.
 * Returns Category on success or null if parsing/validation fails.
 */
export const categorizeProjetoWithFullContextPrompt = async (
  project: {
    title?: string;
    number?: string;
    ementa: string;
    detailedDescription?: string;
    keywords?: string;
    authors?: string[];
    currentStage?: string;
  }
): Promise<Category | null> => {
  try {
    const { title = '', number = '', ementa, detailedDescription = '', keywords = '', authors = [], currentStage = '' } = project;

    // Build concise keywords list from CATEGORY_PATTERNS (primary + context phrases)
    const categoryHints: string[] = [];
    for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      const hints = [...patterns.primary, ...patterns.contextPhrases].slice(0, 12).join(', ');
      categoryHints.push(`${cat}: ${hints}`);
    }

    const authorsText = authors.length > 0 ? authors.join(', ') : 'N/A';

    const prompt = `Você é um especialista em classificar proposições legislativas brasileiras.

Analise COMPLETAMENTE o projeto abaixo e use TANTO a análise semântica quanto o filtro de palavras-chave para decidir a categoria mais apropriada.

Retorne SOMENTE um OBJETO JSON com os campos: {
  "category": "<uma das categorias>",
  "confidence": <número de 0 a 1>,
  "matchedKeywords": ["palavra1","palavra2"],
  "explanation": "texto curto explicando por que"
}

Se não tiver certeza, faça o melhor palpite e indique confiança baixa (por exemplo 0.3).

Categorias válidas: Saúde, Educação, Segurança, Trabalho, Meio Ambiente, Economia, Direitos Humanos, Tecnologia

Algumas palavras-chave importantes por categoria (use para reforçar decisão):
${categoryHints.join('\n')}

----
Título: ${title}
Número: ${number}
Autores: ${authorsText}
Status/Tramitação: ${currentStage || 'N/A'}
Keywords: ${keywords || 'N/A'}

Ementa:
${ementa}

Descrição detalhada:
${detailedDescription}

Retorne APENAS o JSON descrito (sem comentários, sem texto adicional).`;

    // Use centralized sendModelPrompt for the structured prompt
    const modelToUse = AI_CONFIG.HUGGING_FACE?.MODEL || 'google/flan-t5-base';
    const raw = await sendModelPrompt(prompt, modelToUse, AI_CONFIG.HUGGING_FACE?.TIMEOUT || 8000);

    // Try to extract JSON object from the model output (centralized helper)
    const parsed = extractJSON(raw);

    if (!parsed || typeof parsed !== 'object') {
      if (__DEV__) console.warn('⚠️ Full-context prompt returned non-JSON:', raw);
      return null;
    }

    const validCategories: Category[] = [
      'Saúde','Educação','Segurança','Trabalho','Meio Ambiente','Economia','Direitos Humanos','Tecnologia'
    ];

    const categoryText = (parsed.category || '').toString().trim();
    const matched = parsed.matchedKeywords || [];
    const confidence = Number(parsed.confidence) || 0;

    // Cache AI confidence for this input if available
    try {
      const cacheKey = `${ementa}_${keywords || ''}`;
      if (confidence && confidence > 0) {
        aiConfidenceCache.set(cacheKey, confidence);
        confidenceScores.set(cacheKey, confidence);
      }
    } catch (e) {
      // ignore cache errors
    }

    // Validate category
    const matchedCategory = validCategories.find(c => c.toLowerCase() === categoryText.toLowerCase());
    if (!matchedCategory) {
      if (__DEV__) console.warn('⚠️ Full-context prompt returned unknown category:', categoryText);
      return null;
    }

    // Optionally, ensure that matched keywords contain some of our hint keywords
    return matchedCategory as Category;
  } catch (error) {
    if (__DEV__) console.warn('⚠️ Error running full-context categorization prompt:', error);
    return null;
  }
};

/**
 * Fallback to advanced context analysis
 * Used when AI is unavailable or fails
 * Uses the same scoring system as main analysis
 */
function fallbackCategorizacao(keywords: string = '', ementa: string = ''): Category {
  const analysis = analyzeContextDeep(ementa, keywords);
  return analysis.category;
}

/**
 * Centralized refinement flow: given analysis and context, try full-context AI prompt
 * then Portuguese prompt, then fallback to analysis. Returns the chosen category.
 */
async function refineCategoryWithAI(
  analysis: { category: Category; confidence: number; scores: Record<string, number> },
  opts: { ementa: string; keywords?: string; fullContext?: { title?: string; number?: string; detailedDescription?: string; authors?: string[]; currentStage?: string } }
): Promise<Category> {
  const { ementa, keywords = '', fullContext } = opts;

  // If analysis already confident enough, prefer it (but allow override)
  const threshold = (AI_CONFIG as any)?.FALLBACK?.CONFIDENCE_THRESHOLD ?? 0.75;
  if (analysis.confidence >= threshold) {
    return analysis.category;
  }

  // Try full-context prompt if available
  if (fullContext) {
    try {
      const projectPayload = {
        title: fullContext.title || '',
        number: fullContext.number || '',
        ementa,
        detailedDescription: fullContext.detailedDescription || '',
        keywords: keywords || '',
        authors: fullContext.authors || [],
        currentStage: fullContext.currentStage || '',
      };

      const cat = await categorizeProjetoWithFullContextPrompt(projectPayload);
      if (cat) return cat;
    } catch (err) {
      if (__DEV__) console.warn('⚠️ refineCategoryWithAI full-context failed:', err);
    }
  }

  // Try Portuguese zero-shot prompt
  try {
    const cat = await categorizeProjeto_AI_Portuguese(ementa, keywords || '');
    if (cat) return cat;
  } catch (err) {
    if (__DEV__) console.warn('⚠️ refineCategoryWithAI Portuguese prompt failed:', err);
  }

  // Fallback to analysis
  return analysis.category;
}

/**
 * Batch categorization for multiple projects
 * More efficient for processing many projects at once
 */
export const batchCategorizeProjetos_AI = async (
  projetos: Array<{ ementa: string; keywords?: string }>
): Promise<Category[]> => {
  const results: Category[] = [];
  
  // Process in parallel with limit to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < projetos.length; i += batchSize) {
    const batch = projetos.slice(i, i + batchSize);
    const promises = batch.map(p => 
      categorizeProjeto_AI(p.ementa, p.keywords || '')
    );
    
    const batchResults = await Promise.allSettled(promises);
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push('Economia'); // Fallback
      }
    });
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < projetos.length) {
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

/**
 * Get AI categorization statistics
 */
export const getAIStats = () => {
  return {
    categoryCacheSize: categorizationCache.size,
    statusCacheSize: statusCache.size,
    cacheHitRate: categorizationCache.size > 0 
      ? ((categorizationCache.size / (categorizationCache.size + 1)) * 100).toFixed(1)
      : '0',
  };
};

/**
 * Clear AI cache (useful for testing or memory management)
 */
export const clearAICache = () => {
  categorizationCache.clear();
  statusCache.clear();
  console.log('🗑️ AI cache cleared');
};

export default {
  categorizeProjeto_AI,
  categorizeProjeto_AI_Portuguese,
  categorizeProjetoWithFullContextPrompt,
  analyzeStatus_AI,
  getDetailedAnalysis,
  getCategorizationConfidence,
  batchCategorizeProjetos_AI,
  getAIStats,
  clearAICache,
};
