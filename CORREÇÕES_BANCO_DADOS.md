# 🔧 Correções do Banco de Dados - Rezuski

## 📋 Problemas Identificados e Soluções

Este documento contém as correções necessárias para resolver os problemas identificados na aplicação:

### ❌ Problemas Encontrados:
1. **Tabela `database_configs` não existe** - Erro: `relation "public.database_configs" does not exist`
2. **Função de deletar não funciona** - Políticas RLS muito restritivas
3. **Storage de imagens com problemas** - Bucket não configurado corretamente
4. **Perfis de usuário não carregam** - Problemas de conectividade e permissões

## 🛠️ Como Aplicar as Correções

### Opção 1: Script Completo (RECOMENDADO)

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login no seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute o Script Mestre**
   - Copie todo o conteúdo do arquivo: `sql_scripts/fix_database_complete.sql`
   - Cole no SQL Editor
   - Clique em "Run" para executar

4. **Verifique os Resultados**
   - O script mostrará o status de cada correção
   - Procure por "✅ CORREÇÕES APLICADAS COM SUCESSO!"

### Opção 2: Scripts Individuais

Se preferir aplicar as correções uma por vez:

1. **Criar Tabelas Faltando**
   ```sql
   -- Execute: sql_scripts/create_missing_tables.sql
   ```

2. **Corrigir Políticas RLS**
   ```sql
   -- Execute: sql_scripts/fix_all_rls_policies.sql
   ```

3. **Configurar Storage**
   ```sql
   -- Execute: sql_scripts/setup_storage_bucket.sql
   ```

## 🔄 Após Aplicar as Correções

### 1. Reiniciar a Aplicação
```bash
# Pare o servidor (Ctrl+C no terminal)
# Depois reinicie:
npm run dev
```

### 2. Testar Funcionalidades

✅ **Teste estas funcionalidades:**
- [ ] Página inicial carrega sem erros
- [ ] Painel admin `/admin/properties` abre corretamente
- [ ] Lista de propriedades aparece
- [ ] Função de deletar propriedade funciona
- [ ] Função de deletar em massa funciona
- [ ] Upload de imagens funciona
- [ ] Ordenação por data/preço funciona

### 3. Verificar Logs

Após reiniciar, verifique se não há mais erros no console:
- Abra as ferramentas de desenvolvedor (F12)
- Vá para a aba "Console"
- Não deve haver erros vermelhos relacionados ao banco

## 📁 Arquivos Criados

Este processo criou os seguintes arquivos de correção:

- `sql_scripts/fix_database_complete.sql` - **Script mestre (use este)**
- `sql_scripts/create_missing_tables.sql` - Criar tabelas faltando
- `sql_scripts/fix_all_rls_policies.sql` - Corrigir permissões
- `sql_scripts/setup_storage_bucket.sql` - Configurar storage

## 🆘 Solução de Problemas

### Se ainda houver erros após as correções:

1. **Verifique a conectividade:**
   ```bash
   ping constantino-rezuski-db.62mil3.easypanel.host
   ```

2. **Confirme que as tabelas foram criadas:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

3. **Verifique as políticas RLS:**
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'properties';
   ```

### Contato para Suporte

Se os problemas persistirem:
- Verifique se o servidor Supabase está online
- Confirme se as credenciais no `.env.local` estão corretas
- Execute novamente o script mestre

---

**Status:** ✅ Scripts de correção criados e prontos para uso
**Próximo passo:** Execute o script `fix_database_complete.sql` no Supabase SQL Editor