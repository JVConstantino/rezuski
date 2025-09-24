# Configuração do Storage Bucket para Documentos PDF no Supabase

Este arquivo contém as instruções para configurar o bucket de storage para documentos PDF no painel do Supabase.

## Passos para Configuração

### 1. Acessar o Painel do Supabase
- Acesse https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto do Rezuski

### 2. Criar o Bucket de Storage
- No menu lateral, clique em "Storage"
- Clique no botão "New bucket"
- Configure o bucket com as seguintes informações:
  - **Nome do bucket**: `property-documents`
  - **Público**: Marque como público (para permitir downloads diretos)
  - **File size limit**: 10MB (ou conforme necessário)
  - **Allowed MIME types**: `application/pdf`

### 3. Configurar Políticas de Acesso (RLS)

As políticas já foram criadas no script SQL (`add_property_documents.sql`), mas caso precise configurar manualmente:

#### Política de SELECT (Visualização)
```sql
CREATE POLICY "Allow public to view property documents" ON storage.objects
FOR SELECT USING (bucket_id = 'property-documents');
```

#### Política de INSERT (Upload)
```sql
CREATE POLICY "Allow authenticated users to upload property documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'property-documents' AND
    auth.role() = 'authenticated'
);
```

#### Política de DELETE (Exclusão)
```sql
CREATE POLICY "Allow authenticated users to delete property documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'property-documents' AND
    auth.role() = 'authenticated'
);
```

### 4. Verificar Configurações

Após criar o bucket, verifique se:
- O bucket `property-documents` está listado na seção Storage
- As políticas de acesso estão ativas
- O bucket está configurado como público

### 5. Testar Upload

Para testar se tudo está funcionando:
1. Acesse o painel de administração do Rezuski
2. Vá para a seção de propriedades
3. Edite ou crie uma nova propriedade
4. Teste o upload de um arquivo PDF na seção "Documentos PDF"
5. Verifique se o arquivo aparece no bucket do Supabase
6. Teste o download do PDF na página pública da propriedade

## Estrutura de Arquivos no Bucket

Os arquivos serão organizados da seguinte forma:
```
property-documents/
├── property-{id}/
│   ├── documento1.pdf
│   ├── documento2.pdf
│   └── ...
```

## Troubleshooting

### Erro de Upload
- Verifique se o bucket existe e está público
- Confirme se as políticas de RLS estão ativas
- Verifique se o usuário está autenticado

### Erro de Download
- Confirme se o arquivo existe no bucket
- Verifique se a URL pública está sendo gerada corretamente
- Teste a URL diretamente no navegador

### Erro de Permissão
- Verifique as políticas de RLS no painel do Supabase
- Confirme se o usuário tem as permissões necessárias
- Teste com diferentes níveis de usuário (admin, authenticated)

## Notas Importantes

- O bucket deve ser público para permitir downloads diretos
- Os arquivos são validados no frontend (apenas PDFs, máximo 10MB)
- A exclusão de arquivos remove tanto do banco quanto do storage
- Mantenha backups regulares dos documentos importantes