-- Script para criar tabelas faltando no banco de dados
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela database_configs
CREATE TABLE IF NOT EXISTS public.database_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    database_url TEXT NOT NULL,
    database_key TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

-- 2. Criar tabela storage_configs se não existir
CREATE TABLE IF NOT EXISTS public.storage_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    storage_url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    bucket_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT false
);

-- 3. Criar tabela ai_configs se não existir
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    provider TEXT NOT NULL,
    api_key TEXT,
    model TEXT,
    max_tokens INTEGER,
    is_active BOOLEAN DEFAULT false
);

-- 4. Habilitar RLS nas tabelas
ALTER TABLE public.database_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS básicas
-- Permitir acesso público para leitura e operações completas para desenvolvimento
CREATE POLICY "Allow all access for development" ON public.database_configs FOR ALL USING (true);
CREATE POLICY "Allow all access for development" ON public.storage_configs FOR ALL USING (true);
CREATE POLICY "Allow all access for development" ON public.ai_configs FOR ALL USING (true);

-- 6. Inserir configurações padrão
INSERT INTO public.database_configs (id, database_url, database_key, description, is_active)
VALUES 
    ('constantino-new', 'https://constantino-rezuski-db.62mil3.easypanel.host', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE', 'Constantino Rezuski Database', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('database_configs', 'storage_configs', 'ai_configs')
ORDER BY table_name;

-- 8. Verificar políticas RLS
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('database_configs', 'storage_configs', 'ai_configs')
ORDER BY tablename, policyname;