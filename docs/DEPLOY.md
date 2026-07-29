# 📦 Guia de Deploy - Rezuski Imóveis

## ✅ Build Concluído com Sucesso!

O build de produção foi gerado na pasta `dist/` com todos os arquivos otimizados.

---

## 🚀 Como Fazer Deploy em Hospedagem Comum

### 1️⃣ **Preparar os Arquivos**

Todos os arquivos necessários estão na pasta `dist/`. Você precisa:

1. Copiar o arquivo `.htaccess` da raiz do projeto para dentro da pasta `dist/`
2. Fazer upload de **todo o conteúdo da pasta `dist/`** para o servidor

```bash
# No Windows, copie o .htaccess para dist
copy .htaccess dist\.htaccess
```

### 2️⃣ **Upload via FTP/cPanel**

#### **Opção A: Via FTP (FileZilla, WinSCP, etc)**

1. Conecte-se ao servidor FTP da sua hospedagem
2. Navegue até a pasta `public_html` (ou `www`, `htdocs` dependendo da hospedagem)
3. Faça upload de **todos os arquivos** da pasta `dist/`, incluindo:
   - `index.html`
   - `.htaccess`
   - pasta `assets/`
   - todos os outros arquivos

#### **Opção B: Via cPanel File Manager**

1. Acesse o cPanel da sua hospedagem
2. Abra o **File Manager**
3. Navegue até `public_html`
4. Clique em **Upload** e selecione todos os arquivos da pasta `dist/`
5. Ou use **Compress** → envie um ZIP e extraia no servidor

---

### 3️⃣ **Configurar Variáveis de Ambiente**

A aplicação usa variáveis de ambiente que estão no arquivo `.env`. Para hospedagem comum:

**⚠️ IMPORTANTE:** As variáveis de ambiente são compiladas no build. Certifique-se de que o arquivo `.env` está configurado corretamente ANTES de rodar `npm run build`.

Se precisar alterar as variáveis, você deve:
1. Editar o arquivo `.env`
2. Rodar `npm run build` novamente
3. Fazer novo upload dos arquivos

---

### 4️⃣ **Estrutura Necessária no Servidor**

```
public_html/
├── index.html
├── .htaccess          ← IMPORTANTE! Habilita SPA routing
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ... (outros assets)
└── ... (outros arquivos estáticos)
```

---

## 🔧 Configurações Importantes

### **Apache (.htaccess)**

O arquivo `.htaccess` já foi criado e contém:
- ✅ Suporte a roteamento SPA (Single Page Application)
- ✅ Cache otimizado para assets estáticos
- ✅ Compressão GZIP
- ✅ Headers de segurança
- ✅ (Opcional) Redirecionamento HTTP → HTTPS

### **Nginx (se sua hospedagem usar)**

Se sua hospedagem usar Nginx em vez de Apache, crie um arquivo de configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /path/to/dist;
    index index.html;

    # Compressão GZIP
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing - todas as rotas apontam para index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🌐 Após o Deploy

### **Testar a Aplicação**

1. Acesse `https://seu-dominio.com`
2. Verifique se a página inicial carrega
3. Teste a navegação entre páginas
4. Faça login no admin
5. Teste upload de imagens e PDFs

### **Verificar Console do Navegador**

Abra o DevTools (F12) e verifique:
- ✅ Sem erros 404
- ✅ Assets carregando corretamente
- ✅ Conexão com Supabase funcionando

---

## 📌 Checklist Final

- [ ] Build de produção gerado (`npm run build`)
- [ ] Arquivo `.htaccess` copiado para `dist/`
- [ ] Arquivo `.env` configurado com variáveis corretas
- [ ] Upload de todos os arquivos da pasta `dist/` para `public_html/`
- [ ] Domínio apontando para a hospedagem
- [ ] SSL/HTTPS configurado (opcional, mas recomendado)
- [ ] Teste de navegação e funcionalidades
- [ ] Backup dos arquivos originais

---

## 🔐 Segurança

### **Proteger Credenciais**

- ⚠️ **NUNCA** exponha suas chaves da API Supabase no frontend
- ⚠️ Use Row Level Security (RLS) no Supabase para todas as tabelas
- ⚠️ As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são públicas e devem usar a chave `anon` (não a chave `service_role`)

### **HTTPS**

Configure SSL/HTTPS na sua hospedagem:
- Se usa cPanel, ative o SSL gratuito (Let's Encrypt)
- Descomente as linhas de redirecionamento HTTPS no `.htaccess`

---

## 🛠️ Comandos Úteis

```bash
# Gerar build de produção
npm run build

# Preview do build localmente (antes do deploy)
npm run preview

# Reconstruir após alterar .env
npm run build
```

---

## 📞 Suporte

Se encontrar erros após o deploy:

1. **Erro 404 nas rotas**: Verifique se o `.htaccess` foi enviado corretamente
2. **Página em branco**: Abra o console (F12) e veja os erros
3. **Erro de conexão com Supabase**: Verifique as variáveis de ambiente no `.env`
4. **Assets não carregam**: Verifique se a pasta `assets/` foi enviada

---

## ✅ Pronto!

Seu sistema Rezuski Imóveis está pronto para produção! 🎉

**Tamanho do build:**
- ~168 kB (gzipped)
- Otimizado e minificado pelo Vite

**Performance:**
- Code splitting automático
- Lazy loading de rotas
- Assets com hash para cache invalidation
