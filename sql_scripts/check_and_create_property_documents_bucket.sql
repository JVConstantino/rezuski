-- Script para verificar e criar o bucket property-documents
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o bucket existe
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'property-documents';

-- 2. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents', 
    true,
    10485760, -- 10MB em bytes
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar políticas de storage
DROP POLICY IF EXISTS "Allow upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow read property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete property documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update property documents" ON storage.objects;

CREATE POLICY "Allow upload property documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-documents');

CREATE POLICY "Allow read property documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-documents');

CREATE POLICY "Allow delete property documents" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-documents');

CREATE POLICY "Allow update property documents" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-documents');

-- 4. Verificar se as políticas foram criadas
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

-- 5. Verificar novamente se o bucket foi criado
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'property-documents';

SELECT 'Bucket property-documents configurado com sucesso!' as status;