# Correção de Roteamento Vercel - Documentação

## Problema Identificado

O usuário reportou erro de rota inválida na Vercel com a mensagem:
> "Invalid route source pattern - The source property follows the syntax from path-to-regexp, not the RegExp syntax."

## Soluções Implementadas

### 1. **Correção do Pattern de Rewrites**

**Antes:**
```json
{
  "source": "/(.*)",
  "destination": "/index.html"
}
```

**Depois:**
```json
{
  "source": "/((?!api).*)",
  "destination": "/index.html"
}
```

**Explicação:**
- Usado negative lookahead `(?!api)` para excluir rotas de API
- Sintaxe compatível com path-to-regexp da Vercel
- Evita conflitos com endpoints de API

### 2. **Correção do Pattern de Headers**

**Antes:**
```json
{
  "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))"
}
```

**Depois:**
```json
{
  "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))$"
}
```

**Explicação:**
- Adicionado `$` no final para match exato da extensão
- Evita matches parciais indesejados
- Melhora a precisão do cache de assets

## Configuração Final do vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))$",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "functions": {
    "pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Testes Realizados

### ✅ Build Local
- Comando: `npm run build`
- Status: **Sucesso**
- Tamanho do bundle: ~857KB (gzipped: ~200KB)
- Warnings: Apenas avisos sobre dynamic imports (não críticos)

### ✅ Preview Local
- Comando: `npm run preview`
- URL: http://localhost:4173/
- Status: **Funcionando**
- Roteamento SPA: **Operacional**

## Sintaxe path-to-regexp vs RegExp

### ❌ **Sintaxe RegExp (Incorreta para Vercel):**
```json
{
  "source": "/feedback/(?!general)"
}
```

### ✅ **Sintaxe path-to-regexp (Correta para Vercel):**
```json
{
  "source": "/feedback/((?!general).*)"
}
```

**Diferenças Principais:**
1. **Grupos de Captura:** path-to-regexp requer grupos explícitos `(.*)`
2. **Negative Lookaheads:** Devem ser envolvidos em grupos `((?!pattern).*)`
3. **Anchors:** Use `$` para fim de string quando necessário

## Padrões Comuns para Vercel

### SPA Routing (Single Page Application)
```json
{
  "source": "/((?!api|_next|static).*)",
  "destination": "/index.html"
}
```

### API Routes Exclusion
```json
{
  "source": "/((?!api).*)",
  "destination": "/index.html"
}
```

### Static Assets
```json
{
  "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))$",
  "headers": [{
    "key": "Cache-Control",
    "value": "public, max-age=31536000, immutable"
  }]
}
```

## Próximos Passos

1. **Deploy na Vercel** com as configurações corrigidas
2. **Testar rotas** diretamente via URL na produção
3. **Verificar logs** da Vercel para confirmar ausência de erros
4. **Monitorar performance** com as novas configurações de cache

## Referências

- [Vercel Configuration - vercel.json](https://vercel.com/docs/projects/project-configuration)
- [Path-to-RegExp Documentation](https://github.com/pillarjs/path-to-regexp)
- [Vercel Rewrites Documentation](https://vercel.com/docs/projects/project-configuration#rewrites)