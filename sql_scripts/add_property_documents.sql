-- Script para adicionar funcionalidade de documentos PDF às propriedades
-- Criado para permitir múltiplos PDFs por propriedade

-- 1. Criar tabela para armazenar documentos das propriedades
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded_at ON property_documents(uploaded_at);

-- 3. Configurar RLS (Row Level Security)
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para property_documents
-- Permitir leitura pública dos documentos
CREATE POLICY "Public can view property documents" ON property_documents
    FOR SELECT USING (true);

-- Permitir que usuários autenticados insiram documentos
CREATE POLICY "Authenticated users can insert property documents" ON property_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem seus próprios documentos
CREATE POLICY "Users can update their own property documents" ON property_documents
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Permitir que usuários autenticados deletem seus próprios documentos
CREATE POLICY "Users can delete their own property documents" ON property_documents
    FOR DELETE USING (auth.uid() = uploaded_by);

-- 5. Criar bucket de storage para documentos PDF (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents',
    true,
    10485760, -- 10MB limit
    ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 6. Políticas de storage para o bucket property-documents
-- Permitir leitura pública
CREATE POLICY "Public can view property documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'property-documents');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload property documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'property-documents' AND
        auth.role() = 'authenticated'
    );

-- Permitir que usuários deletem seus próprios arquivos
CREATE POLICY "Users can delete their own property documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'property-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_property_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at
CREATE TRIGGER update_property_documents_updated_at_trigger
    BEFORE UPDATE ON property_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_property_documents_updated_at();

-- 9. Comentários para documentação
COMMENT ON TABLE property_documents IS 'Tabela para armazenar documentos PDF das propriedades';
COMMENT ON COLUMN property_documents.property_id IS 'ID da propriedade associada';
COMMENT ON COLUMN property_documents.document_name IS 'Nome do documento';
COMMENT ON COLUMN property_documents.document_url IS 'URL do documento no storage';
COMMENT ON COLUMN property_documents.file_size IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN property_documents.mime_type IS 'Tipo MIME do arquivo';
COMMENT ON COLUMN property_documents.uploaded_by IS 'ID do usuário que fez o upload';

-- Script concluído com sucesso!
-- Execute este script no seu banco Supabase para adicionar a funcionalidade de documentos PDF.