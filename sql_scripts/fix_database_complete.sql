-- SCRIPT MESTRE PARA CORRIGIR TODOS OS PROBLEMAS DO BANCO DE DADOS
-- Execute este SQL completo no Supabase SQL Editor
-- 
-- Este script irá:
-- 1. Criar tabelas faltando
-- 2. Corrigir políticas RLS
-- 3. Configurar storage bucket
-- 4. Testar funcionalidades

-- =====================================================
-- PARTE 1: CRIAR TABELAS FALTANDO
-- =====================================================

-- Criar tabela database_configs
CREATE TABLE IF NOT EXISTS public.database_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_url TEXT NOT NULL,
    database_key TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

-- Criar tabela storage_configs
CREATE TABLE IF NOT EXISTS public.storage_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    storage_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    bucket_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

-- Criar tabela ai_configs
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    provider TEXT NOT NULL,
    api_key TEXT,
    model TEXT,
    max_tokens INTEGER,
    is_active BOOLEAN DEFAULT false
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.database_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: CORRIGIR POLÍTICAS RLS
-- =====================================================

-- PROPERTIES - Corrigir políticas para permitir DELETE
DROP POLICY IF EXISTS "Public read access" ON public.properties;
DROP POLICY IF EXISTS "Admin full access" ON public.properties;
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.properties;

CREATE POLICY "Allow public read access" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Allow all operations for development" ON public.properties FOR ALL USING (true);

-- OUTRAS TABELAS - Políticas permissivas para desenvolvimento
DROP POLICY IF EXISTS "Public read access" ON public.categories;
CREATE POLICY "Allow all access" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.amenities;
CREATE POLICY "Allow all access" ON public.amenities FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.brokers;
CREATE POLICY "Allow all access" ON public.brokers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.resources;
CREATE POLICY "Allow all access" ON public.resources FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Allow all access" ON public.profiles FOR ALL USING (true);

-- NOVAS TABELAS - Políticas permissivas
CREATE POLICY "Allow all access for development" ON public.database_configs FOR ALL USING (true);
CREATE POLICY "Allow all access for development" ON public.storage_configs FOR ALL USING (true);
CREATE POLICY "Allow all access for development" ON public.ai_configs FOR ALL USING (true);

-- =====================================================
-- PARTE 3: CONFIGURAR STORAGE BUCKET
-- =====================================================

-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images', 
    true, 
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de storage
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on property images" ON storage.objects;

CREATE POLICY "Public read access for property images" ON storage.objects
    FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Allow all operations on property images" ON storage.objects
    FOR ALL USING (bucket_id = 'property-images');

-- =====================================================
-- PARTE 4: INSERIR DADOS PADRÃO
-- =====================================================

-- Configuração padrão do banco
INSERT INTO public.database_configs (id, database_url, database_key, description, is_active)
VALUES 
    ('constantino-new', 'https://constantino-rezuski-db.62mil3.easypanel.host', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE', 'Constantino Rezuski Database', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PARTE 5: VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar tabelas criadas
SELECT 'TABELAS CRIADAS:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('database_configs', 'storage_configs', 'ai_configs', 'properties')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 'POLÍTICAS RLS:' as status;
SELECT tablename, COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('properties', 'categories', 'amenities', 'brokers')
GROUP BY tablename
ORDER BY tablename;

-- Verificar bucket de storage
SELECT 'STORAGE BUCKET:' as status;
SELECT id, name, public, file_size_limit
FROM storage.buckets 
WHERE id = 'property-images';

-- Status final
SELECT '✅ CORREÇÕES APLICADAS COM SUCESSO!' as status_final;
SELECT '🔄 Reinicie a aplicação para aplicar as mudanças' as proxima_acao;