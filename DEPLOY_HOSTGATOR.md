# Guia de Deploy na Hostgator - Rezuski Imóveis

## ✅ Build Concluído com Sucesso

O build do projeto foi executado com sucesso! Os arquivos estão prontos na pasta `dist/`.

### Arquivos Gerados:
- `dist/index.html` (1.42 kB)
- `dist/assets/browser-iKh5e6uV.js` (0.34 kB)
- `dist/assets/vendor-D5d5vywP.js` (12.32 kB)
- `dist/assets/router-mkUhpX6s.js` (35.99 kB)
- `dist/assets/supabase-QxYxlCKt.js` (102.77 kB)
- `dist/assets/charts-Dhg7USA9.js` (339.31 kB)
- `dist/assets/index-Gz6anISz.js` (857.31 kB)

**Total comprimido (gzip): ~346 kB**

---

## 🚀 Instruções de Deploy na Hostgator

### Pré-requisitos
1. **Conta na Hostgator** com painel cPanel
2. **Domínio configurado** apontando para a Hostgator
3. **Acesso FTP** ou **File Manager** do cPanel

### Passo 1: Preparar os Arquivos

1. **Comprimir a pasta dist:**
   ```bash
   # No Windows (PowerShell)
   Compress-Archive -Path "dist\*" -DestinationPath "rezuski-build.zip"
   
   # Ou manualmente:
   # - Abra a pasta dist/
   # - Selecione todos os arquivos (Ctrl+A)
   # - Clique com botão direito > "Enviar para" > "Pasta compactada"
   ```

### Passo 2: Upload via cPanel File Manager

1. **Acesse o cPanel da Hostgator:**
   - Faça login no painel da Hostgator
   - Clique em "File Manager"

2. **Navegue para a pasta do domínio:**
   - Vá para `public_html/` (domínio principal)
   - Ou `public_html/seudominio.com/` (domínio adicional)

3. **Limpe a pasta (se necessário):**
   - Remova arquivos antigos (index.html, etc.)
   - **CUIDADO:** Mantenha arquivos importantes como `.htaccess`

4. **Upload do arquivo ZIP:**
   - Clique em "Upload"
   - Selecione o arquivo `rezuski-build.zip`
   - Aguarde o upload completar

5. **Extrair arquivos:**
   - Clique com botão direito no arquivo ZIP
   - Selecione "Extract"
   - Confirme a extração
   - Delete o arquivo ZIP após extrair

### Passo 3: Configurar .htaccess para SPA

**IMPORTANTE:** Como é uma Single Page Application (SPA), você precisa configurar o redirecionamento.

1. **Criar/editar .htaccess:**
   - No File Manager, crie um arquivo `.htaccess` na pasta raiz
   - Adicione o seguinte conteúdo:

```apache
# Configuração para SPA React
RewriteEngine On

# Handle Angular and React Router
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Configurações de cache para assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Segurança adicional
<Files ".htaccess">
Order Allow,Deny
Deny from all
</Files>
```

### Passo 4: Configurar Variáveis de Ambiente

**CRÍTICO:** Configure as variáveis de ambiente do Supabase.

1. **No cPanel, procure por "Environment Variables"** ou configure via código:

2. **Crie um arquivo de configuração** (se necessário):
   - Crie `config.js` na pasta raiz com as variáveis de produção
   - **NUNCA** exponha chaves secretas no frontend

### Passo 5: Verificar Upload de Arquivos

1. **Pasta uploads/:**
   - Certifique-se que a pasta `uploads/` foi criada
   - Verifique se `logo.png` está presente
   - Configure permissões (755 ou 644)

### Passo 6: Testar o Deploy

1. **Acesse seu domínio:**
   - `https://seudominio.com`
   - Verifique se a página carrega corretamente

2. **Teste navegação:**
   - Clique em diferentes páginas
   - Teste refresh da página (F5)
   - Verifique se não há erro 404

3. **Teste funcionalidades:**
   - Login/logout
   - Busca de propriedades
   - Upload de imagens (se aplicável)

---

## 🔧 Solução de Problemas Comuns

### Erro 404 em rotas
**Problema:** Páginas internas retornam 404
**Solução:** Verifique se o `.htaccess` está configurado corretamente

### Imagens não carregam
**Problema:** Logos ou imagens não aparecem
**Solução:** 
- Verifique se a pasta `uploads/` existe
- Confirme permissões da pasta (755)
- Teste URLs das imagens diretamente

### Erro de CORS
**Problema:** Erro de CORS com Supabase
**Solução:**
- Configure o domínio no painel do Supabase
- Adicione seu domínio nas "Allowed Origins"

### Performance lenta
**Problema:** Site carrega devagar
**Solução:**
- Verifique se a compressão GZIP está ativa
- Configure cache headers no `.htaccess`
- Otimize imagens se necessário

---

## 📋 Checklist Final

- [ ] Build executado com sucesso
- [ ] Arquivos enviados para `public_html/`
- [ ] `.htaccess` configurado para SPA
- [ ] Variáveis de ambiente configuradas
- [ ] Pasta `uploads/` criada com permissões corretas
- [ ] Domínio testado e funcionando
- [ ] Navegação entre páginas funcionando
- [ ] Refresh de página não gera 404
- [ ] Funcionalidades principais testadas
- [ ] Performance verificada

---

## 🆘 Suporte

Se encontrar problemas:
1. **Verifique os logs de erro** no cPanel
2. **Teste em modo incógnito** para evitar cache
3. **Use ferramentas de desenvolvedor** (F12) para debugar
4. **Contate o suporte da Hostgator** se necessário

---

**✅ Deploy concluído com sucesso!**

Seu site Rezuski Imóveis está pronto para produção na Hostgator.