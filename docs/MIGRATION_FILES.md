# Guia de Migração de Arquivos 📁

## ✅ Migração Automática de Arquivos Implementada!

A ferramenta de migração agora inclui migração automática completa de todos os seus arquivos entre instâncias Supabase.

## 🚀 Como Funciona a Migração de Arquivos

### ✨ **Funcionalidades Implementadas:**

1. **Migração Completa de Storage**
   - ✅ Copia todos os buckets automaticamente
   - ✅ Migra todos os arquivos e pastas recursivamente
   - ✅ Preserva a estrutura de diretórios
   - ✅ Mantém metadados e permissões dos buckets
   - ✅ Sobrescreve arquivos existentes no destino

2. **Estatísticas em Tempo Real**
   - ✅ Mostra número total de buckets
   - ✅ Conta todos os arquivos antes da migração
   - ✅ Exibe tamanho total em MB
   - ✅ Progresso em tempo real da migração
   - ✅ Contador de arquivos migrados

3. **Migração Inteligente**
   - ✅ Detecta e processa pastas recursivamente
   - ✅ Handles arquivos de qualquer tipo e tamanho
   - ✅ Verifica arquivos existentes no destino
   - ✅ Retry automático para arquivos que falharam
   - ✅ Logs detalhados de cada arquivo migrado

## 📋 O Que É Migrado Automaticamente

### 🪣 **Buckets de Storage**
- **property-images**: Todas as imagens de propriedades
- **category-icons**: Ícones de categorias
- **broker-avatars**: Fotos de corretores
- **resources**: Documentos e PDFs
- **user-uploads**: Uploads de usuários
- **temp-files**: Arquivos temporários

### 📁 **Estrutura de Arquivos**
- **Pastas e subpastas**: Toda a hierarquia de diretórios
- **Imagens**: JPG, PNG, GIF, WebP, SVG
- **Documentos**: PDF, DOC, XLS, TXT
- **Outros arquivos**: Qualquer tipo de arquivo

### ⚙️ **Configurações de Bucket**
- **Políticas de acesso**: Público vs Privado
- **Tipos de arquivo permitidos**: MIME types
- **Limites de tamanho**: File size limits
- **Cache control**: Headers de cache

## 🔑 Requisitos para Migração de Arquivos

### **Chaves de Serviço Obrigatórias**
Para migrar arquivos, você precisa das **service role keys** (não apenas anon keys):

#### **Como Obter as Service Role Keys:**

1. **No Supabase Dashboard:**
   - Vá para Settings → API
   - Na seção "Project API keys"
   - Copie a **service_role** key (não a anon key)

2. **Para Origem (Source):**
   ```
   Chave de Serviço - Origem: service_role_key_da_origem
   ```

3. **Para Destino (Target):**
   ```
   Chave de Serviço - Destino: service_role_key_do_destino
   ```

### **Permissões Necessárias**
As service role keys têm permissões administrativas completas:
- ✅ Listar todos os buckets
- ✅ Criar novos buckets
- ✅ Ler/baixar qualquer arquivo
- ✅ Fazer upload/sobrescrever arquivos
- ✅ Gerenciar políticas de storage

## 📊 Interface da Migração de Arquivos

### **Estatísticas Pré-Migração**
Antes de iniciar, você verá:
```
📊 Storage: 3 buckets, 247 arquivos, 45.7 MB
```

### **Progresso em Tempo Real**
Durante a migração:
```
🪣 Migrating bucket: property-images
📁 Processing folder: properties/2024
✅ Migrated file: properties/2024/house1.jpg
✅ Updated file: categories/residential.png
```

### **Barra de Progresso Visual**
```
Progresso da Migração de Arquivos    142 / 247
[████████████████████████░░░░░░░░] 57%
```

## 🎯 Como Usar a Migração de Arquivos

### **Passo a Passo:**

1. **Acesse a ferramenta:**
   ```
   http://localhost:5173/admin/database-migration
   ```

2. **Configure as conexões:**
   - Selecione banco de origem e destino
   - **IMPORTANTE:** Adicione as service role keys

3. **Habilite migração de storage:**
   ```
   ☑️ Incluir migração de storage (requer chaves de serviço)
   ```

4. **Inicie a migração:**
   - Clique em "Iniciar Migração"
   - Observe as estatísticas sendo calculadas
   - Acompanhe o progresso em tempo real

### **Exemplo de Log Completo:**
```
[14:30:12] 🚀 Iniciando migração de banco de dados...
[14:30:15] 🔧 Testando conexões...
[14:30:17] ✅ Conexões testadas com sucesso
[14:30:18] 📊 Obtendo estatísticas de storage...
[14:30:20] 📊 Storage: 3 buckets, 247 arquivos, 45.7 MB
[14:30:22] 📄 Exportando schema...
[14:30:25] ✅ Schema exportado
[14:30:27] 📋 Exportando dados...
[14:30:35] ✅ Dados exportados: 1,247 registros
[14:30:37] 📥 Importando dados...
[14:31:05] ✅ Dados importados com sucesso
[14:31:07] 🪣 Migrando storage...
[14:31:08] 🪣 Migrating bucket: property-images
[14:31:09] 📁 Processing folder: properties
[14:31:10] ✅ Migrated file: properties/house1.jpg
[14:31:11] ✅ Migrated file: properties/house2.jpg
[14:31:12] 📁 Processing folder: categories
[14:31:13] ✅ Migrated file: categories/residential.png
[14:31:45] ✅ Storage migrado com sucesso
[14:31:46] 🎉 Migração concluída com sucesso!
```

## ⚠️ Importante - Sobre Arquivos

### **Sobrescrita de Arquivos**
- ✅ Arquivos existentes no destino **serão sobrescritos**
- ✅ Isso garante que tudo fique atualizado
- ⚠️ Faça backup se necessário antes da migração

### **Estrutura Preservada**
- ✅ Todas as pastas e subpastas são mantidas
- ✅ Caminhos relativos ficam idênticos
- ✅ URLs de acesso funcionam igual no destino

### **Tipos de Arquivo Suportados**
- ✅ **Imagens**: JPG, PNG, GIF, WebP, SVG, ICO
- ✅ **Documentos**: PDF, DOC, DOCX, XLS, XLSX, TXT
- ✅ **Outros**: Qualquer tipo de arquivo

### **Limitações Conhecidas**
- ⚠️ Arquivos muito grandes (>50MB) podem levar mais tempo
- ⚠️ Muitos arquivos (>1000) podem precisar de várias tentativas
- ⚠️ Conexão instável pode interromper a migração

## 🔧 Solução de Problemas

### **Erro: "Service keys required"**
```
❌ Solução: Adicione as service role keys nos campos apropriados
```

### **Erro: "Bucket creation failed"**
```
❌ Causa: Bucket já existe ou permissões insuficientes
✅ Solução: Normal se bucket já existir, arquivos ainda serão migrados
```

### **Erro: "File upload failed"**
```
❌ Causas possíveis:
- Arquivo muito grande
- Tipo de arquivo não permitido
- Espaço insuficiente no destino
- Conexão instável
```

### **Migração Interrompida**
```
✅ Solução: Execute novamente - arquivos já migrados serão ignorados
```

## 🎉 Sucesso Total!

Agora você tem **migração completa e automática** incluindo:

### ✅ **Dados Completos**
- Todas as tabelas e registros
- Schema com funções e políticas
- Configurações e metadados

### ✅ **Arquivos Completos**
- Todos os buckets de storage
- Toda a estrutura de pastas
- Todos os arquivos e imagens
- Progresso visual em tempo real

### ✅ **Experiência Completa**
- Interface amigável e intuitiva
- Logs detalhados e em tempo real
- Estatísticas antes e durante migração
- Validação e tratamento de erros

**A migração agora é 100% automática - você não precisa fazer nada manualmente com os arquivos! 🚀**