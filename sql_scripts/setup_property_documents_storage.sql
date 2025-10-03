-- Configurar bucket property-documents para upload de PDFs das propriedades

-- Inserir bucket property-documents (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents', 
    true,
    10485760, -- 10MB em bytes
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para o bucket property-documents

-- Política de upload
CREATE POLICY "Allow upload property documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'property-documents');

-- Política de leitura
CREATE POLICY "Allow read property documents" ON storage.objects 
FOR SELECT USING (bucket_id = 'property-documents');

-- Política de exclusão
CREATE POLICY "Allow delete property documents" ON storage.objects 
FOR DELETE USING (bucket_id = 'property-documents');

-- Política de atualização
CREATE POLICY "Allow update property documents" ON storage.objects 
FOR UPDATE USING (bucket_id = 'property-documents');

-- Comentários para documentação
COMMENT ON POLICY "Allow upload property documents" ON storage.objects IS 'Permite upload de documentos PDF para propriedades';
COMMENT ON POLICY "Allow read property documents" ON storage.objects IS 'Permite leitura de documentos PDF das propriedades';
COMMENT ON POLICY "Allow delete property documents" ON storage.objects IS 'Permite exclusão de documentos PDF das propriedades';
COMMENT ON POLICY "Allow update property documents" ON storage.objects IS 'Permite atualização de documentos PDF das propriedades';