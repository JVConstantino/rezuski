-- Script de verificação da tabela property_documents
-- Execute este script no SQL Editor do Supabase para verificar a estrutura da tabela

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'property_documents'
) as table_exists;

-- 2. Se a tabela existir, mostrar a estrutura das colunas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'property_documents'
ORDER BY ordinal_position;

-- 3. Verificar as policies de RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'property_documents';

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'property_documents';
