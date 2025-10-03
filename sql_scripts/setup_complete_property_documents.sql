-- Script completo para configurar upload de PDFs para propriedades
-- Execute este script no Supabase SQL Editor

-- ========================================
-- 1. CRIAR TABELA PROPERTY_DOCUMENTS
-- ========================================

CREATE TABLE IF NOT EXISTS public.property_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name text NOT NULL,
    url text NOT NULL,
    size integer,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para a tabela
DROP POLICY IF EXISTS "Public read access" ON public.property_documents;
CREATE POLICY "Public read access" ON public.property_documents 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access" ON public.property_documents;
CREATE POLICY "Allow all access" ON public.property_documents 
FOR ALL USING (true);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id 
ON public.property_documents(property_id);

-- ========================================
-- 2. CONFIGURAR BUCKET DE STORAGE
-- ========================================

-- Inserir bucket property-documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents', 
    true,
    10485760, -- 10MB em bytes
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. POLÍTICAS DE STORAGE
-- ========================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow read property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update property documents" ON storage.objects;

-- Criar novas políticas
CREATE POLICY "Allow upload property documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-documents');

CREATE POLICY "Allow read property documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-documents');

CREATE POLICY "Allow delete property documents" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-documents');

CREATE POLICY "Allow update property documents" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-documents');

-- ========================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE public.property_documents IS 'Tabela para armazenar documentos PDF associados às propriedades';
COMMENT ON COLUMN public.property_documents.property_id IS 'ID da propriedade à qual o documento pertence';
COMMENT ON COLUMN public.property_documents.name IS 'Nome original do arquivo';
COMMENT ON COLUMN public.property_documents.url IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN public.property_documents.size IS 'Tamanho do arquivo em bytes';

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'property_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se o bucket foi criado
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'property-documents';

-- Verificar políticas RLS da tabela
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'property_documents';

-- Verificar políticas de storage
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property documents%';

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Copie todo este script
-- 2. Vá para o Supabase Dashboard > SQL Editor
-- 3. Cole o script e execute
-- 4. Verifique os resultados das consultas de verificação no final
-- 5. O sistema de upload de PDFs estará pronto para uso