-- Corrigir coluna s3_key para ser opcional
-- Execute este SQL se quiser tornar s3_key opcional (não obrigatório)

-- Opção 1: Tornar s3_key opcional (recomendado)
ALTER TABLE photos 
ALTER COLUMN s3_key DROP NOT NULL;

-- Opção 2 (alternativa): Adicionar valor padrão
-- ALTER TABLE photos 
-- ALTER COLUMN s3_key SET DEFAULT '';

-- Verificar a estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'photos' 
ORDER BY ordinal_position;

