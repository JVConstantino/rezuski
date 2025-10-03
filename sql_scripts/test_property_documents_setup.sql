-- Script para testar se o bucket property-documents está configurado corretamente
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se o bucket property-documents existe
SELECT 
    'Bucket Status' as test_type,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'property-documents';

-- 2. Verificar se a tabela property_documents existe
SELECT 
    'Table Status' as test_type,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'property_documents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS da tabela property_documents
SELECT 
    'Table RLS Policies' as test_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'property_documents';

-- 4. Verificar políticas de storage para o bucket property-documents
SELECT 
    'Storage Policies' as test_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property documents%';

-- 5. Testar inserção na tabela property_documents (simulação)
-- Descomente as linhas abaixo para testar inserção real:
-- INSERT INTO public.property_documents (property_id, name, url, size)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'test.pdf', 'test/path.pdf', 1024);
-- DELETE FROM public.property_documents WHERE name = 'test.pdf';

SELECT 'Test Complete' as status, 'Verifique os resultados acima para identificar problemas' as message;