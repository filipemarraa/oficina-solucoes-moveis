/**
 * 🎛️ AI Configuration
 * 
 * Configure which AI service to use for categorization
 */

import { HUGGING_FACE_TOKEN } from '@env';

export const AI_CONFIG = {
  // Enable/disable AI categorization
  ENABLED: true, // Set to true to enable AI
  
  // AI Provider: 'huggingface' | 'ollama' | 'openrouter' | 'none'
  PROVIDER: 'huggingface' as const,
  
  // Hugging Face Configuration
  HUGGING_FACE: {
    TOKEN: HUGGING_FACE_TOKEN || 'hf_demo', // Token from .env file or 'hf_demo' for testing
    MODEL: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
    MODE: 'embeddings' as const, // 'embeddings' | 'zero-shot'
    TIMEOUT: 5000, // milliseconds
  },
  
  // Ollama Configuration (local)
  OLLAMA: {
    BASE_URL: 'http://localhost:11434',
    MODEL: 'gemma:2b',
    TIMEOUT: 3000,
  },
  
  // OpenRouter Configuration
  OPENROUTER: {
    API_KEY: '', // Get free key at openrouter.ai
    MODEL: 'meta-llama/llama-3.2-1b-instruct:free',
  },
  
  // Cache settings
  CACHE: {
    ENABLED: true,
    MAX_SIZE: 1000, // Maximum cached items
    TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  
  // Fallback settings
  FALLBACK: {
    USE_RULES_ON_ERROR: true, // Always fallback to rule-based system
    RETRY_ATTEMPTS: 1,
  },
  
  // Batch processing
  BATCH: {
    SIZE: 5, // Process 5 items at a time
    DELAY_MS: 1000, // Delay between batches
  },
};

/**
 * Feature flags for different AI capabilities
 */
export const AI_FEATURES = {
  CATEGORIZATION: true, // AI categorization of projects
  STATUS_ANALYSIS: true, // AI status interpretation
  IMPACT_ANALYSIS: false, // Future: Analyze project impact
  SIMILARITY: false, // Future: Find similar projects
};

/**
 * Get current AI configuration
 */
export const getAIConfig = () => {
  return {
    enabled: AI_CONFIG.ENABLED,
    provider: AI_CONFIG.PROVIDER,
    features: AI_FEATURES,
  };
};

export default AI_CONFIG;
