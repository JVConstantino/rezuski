-- Script para corrigir os nomes das colunas da tabela property_documents
-- Execute este script no SQL Editor do Supabase

-- OPÇÃO 1: Renomear as colunas existentes (mantém dados se houver)
ALTER TABLE public.property_documents 
  RENAME COLUMN name TO document_name;

ALTER TABLE public.property_documents 
  RENAME COLUMN url TO document_url;

ALTER TABLE public.property_documents 
  RENAME COLUMN size TO file_size;

ALTER TABLE public.property_documents 
  RENAME COLUMN created_at TO uploaded_at;

-- Alterar o tipo da coluna file_size de integer para bigint (para suportar arquivos maiores)
ALTER TABLE public.property_documents 
  ALTER COLUMN file_size TYPE bigint;

-- Tornar property_id NOT NULL e adicionar foreign key se ainda não existir
ALTER TABLE public.property_documents 
  ALTER COLUMN property_id SET NOT NULL;

-- Tentar adicionar foreign key (pode falhar se já existir, mas não tem problema)
DO $$
BEGIN
    ALTER TABLE public.property_documents
    ADD CONSTRAINT fk_property
        FOREIGN KEY(property_id) 
        REFERENCES public.properties(id)
        ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Verificar o resultado final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'property_documents'
ORDER BY ordinal_position;
