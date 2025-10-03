-- Criar tabela property_documents para armazenar documentos PDF das propriedades
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

-- Política de leitura pública
CREATE POLICY "Public read access" ON public.property_documents 
FOR SELECT USING (true);

-- Política de acesso completo (para desenvolvimento/testes)
CREATE POLICY "Allow all access" ON public.property_documents 
FOR ALL USING (true);

-- Criar índice para melhor performance nas consultas por property_id
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id 
ON public.property_documents(property_id);

-- Comentários para documentação
COMMENT ON TABLE public.property_documents IS 'Tabela para armazenar documentos PDF associados às propriedades';
COMMENT ON COLUMN public.property_documents.property_id IS 'ID da propriedade à qual o documento pertence';
COMMENT ON COLUMN public.property_documents.name IS 'Nome original do arquivo';
COMMENT ON COLUMN public.property_documents.url IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN public.property_documents.size IS 'Tamanho do arquivo em bytes';