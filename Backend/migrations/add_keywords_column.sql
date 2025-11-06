-- Migration: Add keywords column to users table
-- Execute este SQL no Postico para adicionar o campo keywords

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';

-- Comentário sobre o campo
COMMENT ON COLUMN users.keywords IS 'Palavras-chave personalizadas do usuário para filtrar projetos';
