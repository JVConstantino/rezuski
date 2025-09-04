# Database Migration Tool

Este documento descreve como usar a ferramenta de migração de banco de dados para migrar todos os dados entre instâncias Supabase.

## Funcionalidades

- ✅ **Exportação de Schema**: Gera SQL para recriar todas as tabelas, funções e políticas RLS
- ✅ **Migração de Dados**: Exporta e importa todos os dados de todas as tabelas
- ✅ **Migração de Storage**: Copia arquivos entre buckets Supabase (requer chaves de serviço)
- ✅ **Interface Web**: Interface administrativa fácil de usar
- ✅ **CLI**: Ferramenta de linha de comando para automação
- ✅ **Logs Detalhados**: Acompanhe o progresso da migração em tempo real
- ✅ **Validação**: Testa conexões antes de iniciar a migração

## Tabelas Suportadas

A ferramenta migra automaticamente as seguintes tabelas:

- `profiles` - Perfis de usuários
- `categories` - Categorias de propriedades
- `amenities` - Comodidades
- `brokers` - Corretores
- `properties` - Propriedades
- `applications` - Aplicações de locação
- `tenants` - Inquilinos
- `conversations` - Conversas do chat
- `messages` - Mensagens
- `resources` - Recursos/documentos
- `property_type_translations` - Traduções de tipos de propriedade
- `ai_configs` - Configurações de IA
- `storage_configs` - Configurações de storage

## Como Usar

### 1. Interface Web (Recomendado)

1. Acesse o painel administrativo
2. Vá para **Configurações** > **Migração de Banco de Dados**
3. Selecione o banco de origem e destino
4. Configure as chaves de serviço (opcional, para storage)
5. Clique em **Iniciar Migração**

### 2. Linha de Comando (CLI)

```bash
# Migração completa
npm run migrate -- \
  --source-url="https://old-project.supabase.co" \
  --source-key="eyJhbGc..." \
  --target-url="https://new-project.supabase.co" \
  --target-key="eyJhbGc..."

# Apenas schema
npm run migrate -- \
  --source-url="https://old-project.supabase.co" \
  --source-key="eyJhbGc..." \
  --schema-only=true

# Com migração de storage
npm run migrate -- \
  --source-url="https://old-project.supabase.co" \
  --source-key="eyJhbGc..." \
  --source-service-key="eyJhbGc..." \
  --target-url="https://new-project.supabase.co" \
  --target-key="eyJhbGc..." \
  --target-service-key="eyJhbGc..." \
  --include-storage=true
```

## Pré-requisitos

### Para Migração de Dados
- URL e chave anônima (anon key) do Supabase de origem
- URL e chave anônima (anon key) do Supabase de destino
- O banco de destino deve estar vazio ou preparado para receber os dados

### Para Migração de Storage
- Chave de serviço (service role key) do Supabase de origem
- Chave de serviço (service role key) do Supabase de destino

## Processo de Migração

A migração segue estes passos:

1. **Teste de Conexões**: Verifica se ambos os bancos estão acessíveis
2. **Exportação de Schema**: Gera SQL para recriar a estrutura do banco
3. **Exportação de Dados**: Extrai todos os dados das tabelas
4. **Importação de Dados**: Insere os dados no banco de destino
5. **Migração de Storage** (opcional): Copia arquivos entre buckets

## ⚠️ Importante - Preparação do Banco de Destino

**Você precisa executar manualmente o SQL do schema no banco de destino antes da migração de dados!**

### Como Aplicar o Schema:

1. Execute a migração ou exporte apenas o schema
2. Baixe o arquivo `schema.sql` gerado
3. No painel do Supabase de destino, vá para **SQL Editor**
4. Cole e execute o SQL do schema
5. Verifique se todas as tabelas foram criadas
6. Execute novamente a migração (ou continue se usando CLI)

### SQL Editor do Supabase:
```
https://app.supabase.com/project/SEU-PROJETO-ID/sql/new
```

## Configurações Avançadas

### Tamanho do Lote (Batch Size)
Por padrão, os dados são processados em lotes de 100 registros. Você pode ajustar isso:

```bash
npm run migrate -- --batch-size=500 ...outras-opcoes
```

### Pular Tabelas Específicas
Se você quiser pular certas tabelas (apenas via código):

```typescript
const exportedData = await migration.exportData({
  skipTables: ['messages', 'conversations']
});
```

### Diretório de Saída (CLI)
Por padrão, arquivos são salvos em `./migration_output`. Para mudar:

```bash
npm run migrate -- --output-dir="./minha-migracao" ...outras-opcoes
```

## Solução de Problemas

### Erro: "Duplicate key value violates unique constraint"
- O banco de destino já tem dados
- Limpe o banco de destino ou use IDs únicos

### Erro: "relation does not exist"
- O schema não foi aplicado no banco de destino
- Execute o SQL do schema manualmente no Supabase

### Erro: "insufficient_privilege"
- As chaves de API não têm permissões adequadas
- Verifique se está usando as chaves corretas
- Para storage, use as chaves de serviço (service role)

### Erro: "connect ECONNREFUSED"
- Problema de conectividade
- Verifique URLs e chaves
- Teste as conexões primeiro

### Migração de Storage Falhando
- Verifique se está usando chaves de serviço (service role key)
- Confirme que os buckets existem
- Verifique permissões de storage

## Segurança

### Chaves de API
- **Anon Key**: Para operações básicas de dados
- **Service Role Key**: Para operações administrativas e storage
- Nunca exponha chaves em código cliente
- Use variáveis de ambiente em produção

### RLS (Row Level Security)
- O schema inclui políticas RLS básicas
- Revise e ajuste as políticas conforme necessário
- Teste o acesso após a migração

## Automação

### CI/CD Pipeline
```yaml
# Exemplo GitHub Actions
- name: Run Database Migration
  run: |
    npm run migrate -- \
      --source-url="${{ secrets.SOURCE_SUPABASE_URL }}" \
      --source-key="${{ secrets.SOURCE_SUPABASE_KEY }}" \
      --target-url="${{ secrets.TARGET_SUPABASE_URL }}" \
      --target-key="${{ secrets.TARGET_SUPABASE_KEY }}"
```

### Scripts de Deploy
```bash
#!/bin/bash
# deploy.sh

# 1. Aplicar schema
psql $TARGET_DATABASE_URL < migration_output/schema.sql

# 2. Migrar dados
npm run migrate -- \
  --source-url="$SOURCE_URL" \
  --source-key="$SOURCE_KEY" \
  --target-url="$TARGET_URL" \
  --target-key="$TARGET_KEY" \
  --data-only=true
```

## Monitoramento

### Logs
- Todos os passos são logados com timestamps
- Erros incluem detalhes para debugging
- Progresso é reportado em tempo real

### Validação Pós-Migração
```sql
-- Verificar contagem de registros
SELECT 
  'properties' as table_name, 
  COUNT(*) as record_count 
FROM properties
UNION ALL
SELECT 
  'categories' as table_name, 
  COUNT(*) as record_count 
FROM categories;
-- ... repita para outras tabelas
```

## Casos de Uso

### 1. Migração de Desenvolvimento para Produção
```bash
npm run migrate -- \
  --source-url="https://dev-project.supabase.co" \
  --source-key="dev-key" \
  --target-url="https://prod-project.supabase.co" \
  --target-key="prod-key"
```

### 2. Backup e Restauração
```bash
# Backup (só dados)
npm run migrate -- \
  --source-url="https://projeto.supabase.co" \
  --source-key="key" \
  --schema-only=false \
  --output-dir="./backup-$(date +%Y%m%d)"

# Restauração
npm run migrate -- \
  --target-url="https://novo-projeto.supabase.co" \
  --target-key="key" \
  --data-only=true
```

### 3. Sincronização Entre Ambientes
Use a ferramenta regularmente para manter ambientes sincronizados durante o desenvolvimento.

## Contribuição

Para melhorar a ferramenta de migração:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Teste thoroughly
4. Submeta um pull request

Áreas que podem ser melhoradas:
- Suporte para migrações incrementais
- Interface de rollback
- Compressão de dados
- Paralelização de processos
- Suporte para outros bancos de dados