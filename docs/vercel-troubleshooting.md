# Guia de Troubleshooting - Vercel Deploy

## Problemas Identificados e Soluções Implementadas

### ✅ **1. Configuração da Vercel**
**Problema:** Ausência de arquivo `vercel.json` causando problemas de roteamento SPA

**Solução Implementada:**
- Criado `vercel.json` com configurações otimizadas
- Configurado rewrites para SPA routing
- Adicionado headers de cache para assets
- Definido framework como "vite"

### ✅ **2. Arquivo index.html Problemático**
**Problemas:**
- Import maps conflitantes com Vite
- Scripts duplicados
- Dependências externas via ESM que podem falhar

**Soluções Implementadas:**
- Removido import maps (Vite gerencia as dependências)
- Corrigido caminho do script principal
- Removido scripts duplicados
- Simplificado estrutura HTML

### ✅ **3. Roteamento com HashRouter**
**Problema:** HashRouter pode causar problemas de SEO e roteamento na Vercel

**Solução Implementada:**
- Alterado de `HashRouter` para `BrowserRouter`
- Configurado rewrites no `vercel.json` para suportar SPA routing

### ✅ **4. Configurações do Vite**
**Melhorias Implementadas:**
- Adicionado configurações específicas para produção
- Otimizado build para Vercel
- Configurado sourcemaps condicionais
- Melhorado code splitting
- Adicionado configurações de preview

## Arquivos Modificados

1. **`vercel.json`** - Criado com configurações completas
2. **`index.html`** - Removido import maps e scripts duplicados
3. **`App.tsx`** - Alterado HashRouter para BrowserRouter
4. **`vite.config.ts`** - Otimizado para produção na Vercel

## Variáveis de Ambiente na Vercel

Certifique-se de configurar as seguintes variáveis no painel da Vercel:

```bash
# Obrigatórias
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Opcionais (para funcionalidades AI)
GEMINI_API_KEY=sua_chave_do_gemini
OPENAI_API_KEY=sua_chave_do_openai

# Sistema
NODE_ENV=production
```

## Comandos de Deploy

### Deploy Manual
```bash
# Build local para testar
npm run build
npm run preview

# Deploy via Vercel CLI
npx vercel
npx vercel --prod
```

### Deploy Automático
- Conecte o repositório GitHub à Vercel
- Configure as variáveis de ambiente
- Push para a branch principal

## Verificações Pós-Deploy

1. **Teste de Roteamento:**
   - Acesse `/` (home)
   - Acesse `/search` 
   - Acesse `/about`
   - Teste navegação direta via URL

2. **Teste de Funcionalidades:**
   - Carregamento de propriedades
   - Busca de propriedades
   - Conexão com Supabase
   - Chat AI (se configurado)

3. **Performance:**
   - Verifique tempos de carregamento
   - Teste em diferentes dispositivos
   - Analise Core Web Vitals

## Logs de Debug

### Vercel Function Logs
```bash
# Ver logs em tempo real
npx vercel logs

# Ver logs de uma função específica
npx vercel logs --follow
```

### Browser DevTools
- Console: Verificar erros JavaScript
- Network: Verificar falhas de requisição
- Application: Verificar Service Workers

## Problemas Comuns e Soluções

### 1. **404 em Rotas SPA**
**Causa:** Falta de configuração de rewrites
**Solução:** ✅ Implementado no `vercel.json`

### 2. **Variáveis de Ambiente Undefined**
**Causa:** Prefixo incorreto ou não configuradas na Vercel
**Solução:** Usar prefixo `VITE_` e configurar no painel

### 3. **Build Failures**
**Causa:** Dependências incompatíveis ou configurações incorretas
**Solução:** ✅ Otimizado `vite.config.ts`

### 4. **Slow Loading**
**Causa:** Bundle size grande ou assets não otimizados
**Solução:** ✅ Implementado code splitting e cache headers

## Monitoramento

- **Vercel Analytics:** Ativar no painel da Vercel
- **Core Web Vitals:** Monitorar via Vercel Speed Insights
- **Error Tracking:** Considerar Sentry ou similar

## Próximos Passos

1. Fazer deploy na Vercel com as configurações atualizadas
2. Testar todas as rotas e funcionalidades
3. Configurar variáveis de ambiente
4. Monitorar logs e performance
5. Implementar melhorias baseadas nos resultados