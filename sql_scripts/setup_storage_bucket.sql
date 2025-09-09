-- Script para configurar o bucket de storage para imagens
-- Execute este SQL no Supabase SQL Editor

-- 1. CRIAR BUCKET PARA IMAGENS DAS PROPRIEDADES
-- Nota: Este comando pode falhar se o bucket já existir, isso é normal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images', 
    true, 
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. CRIAR POLÍTICAS DE STORAGE
-- Remover políticas existentes
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Política para leitura pública de imagens
CREATE POLICY "Public read access for property images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'property-images');

-- Política para upload de imagens (desenvolvimento - permite tudo)
CREATE POLICY "Allow all operations on property images" ON storage.objects
    FOR ALL
    USING (bucket_id = 'property-images');

-- 3. VERIFICAR CONFIGURAÇÃO DO BUCKET
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'property-images';

-- 4. VERIFICAR POLÍTICAS DE STORAGE
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 5. TESTAR ACESSO AO STORAGE
-- Lista arquivos no bucket (deve retornar vazio se não houver arquivos)
SELECT 
    name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'property-images'
LIMIT 5;

SELECT 'Storage bucket configurado com sucesso!' as status;