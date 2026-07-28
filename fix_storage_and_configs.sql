-- Arquivo para corrigir permissões de Storage e criar tabela necessária
-- Rode este script no SQL Editor do seu painel Supabase/Easypanel

-- 1. Criar e configurar o bucket 'property-documents'
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('property-documents', 'property-documents', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- 2. Configurar políticas de segurança (RLS) para o bucket property-documents
-- Importante: Removemos policies antigas para evitar conflitos antes de criar novas
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON storage.objects;

-- Política de Leitura Pública (Qualquer um pode baixar PDFs se tiver o link)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'property-documents' );

-- Política de Upload (Apenas usuários autenticados - ADMIN)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-documents' );

-- Política de Update (Apenas usuários autenticados)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'property-documents' );

-- Política de Delete (Apenas usuários autenticados)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-documents' );

-- 3. Criar a tabela 'database_configs' que está faltando (Resolve erro 404)
CREATE TABLE IF NOT EXISTS public.database_configs (
    id text PRIMARY KEY,
    database_url text NOT NULL,
    database_key text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT false,
    category_order text
);

-- Habilitar RLS na tabela
ALTER TABLE public.database_configs ENABLE ROW LEVEL SECURITY;

-- Policies para database_configs
DROP POLICY IF EXISTS "Public Read Configs" ON public.database_configs;
DROP POLICY IF EXISTS "Authenticated Manage Configs" ON public.database_configs;

CREATE POLICY "Public Read Configs"
ON public.database_configs FOR SELECT
USING (true);

CREATE POLICY "Authenticated Manage Configs"
ON public.database_configs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Inserir uma configuração padrão se a tabela estiver vazia
INSERT INTO public.database_configs (id, database_url, database_key, description, is_active)
SELECT 'rezuski-main', 
       'https://rezuski-server-rezuski-db-server.h7c5nc.easypanel.host', 
       'SUPABASE_ANON_KEY_PLACEHOLDER', -- Você precisará editar isso se rodar manualmente e quiser a chave real, mas o app usa a env var como fallback
       'Rezuski Main Database',
       true
WHERE NOT EXISTS (SELECT 1 FROM public.database_configs);

-- 5. Criar a tabela 'property_documents' para armazenar metadados dos PDFs (Resolve erro de coluna ausente)
CREATE TABLE IF NOT EXISTS public.property_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id uuid NOT NULL,
    document_name text NOT NULL,
    document_url text NOT NULL,
    file_size bigint,
    uploaded_at timestamptz DEFAULT now(),
    CONSTRAINT fk_property
        FOREIGN KEY(property_id) 
        REFERENCES public.properties(id)
        ON DELETE CASCADE
);

-- Habilitar RLS na tabela property_documents
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

-- Policies para property_documents
DROP POLICY IF EXISTS "Public Read Documents" ON public.property_documents;
DROP POLICY IF EXISTS "Authenticated Manage Documents" ON public.property_documents;

CREATE POLICY "Public Read Documents"
ON public.property_documents FOR SELECT
USING (true);

CREATE POLICY "Authenticated Manage Documents"
ON public.property_documents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

