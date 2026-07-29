# Deploy na HostGator - Hospedagem Compartilhada

## 📋 Instruções de Deploy

### 1. Preparação dos Arquivos

Após executar `npm run build`, todos os arquivos necessários estarão na pasta `dist/`:

```
dist/
├── assets/          # Arquivos CSS, JS e outros assets
├── index.html       # Arquivo principal da aplicação
├── logo.png         # Logo da aplicação
├── manifest.json    # Manifest PWA
├── pwa-icon-192.svg # Ícone PWA 192x192
├── pwa-icon-512.svg # Ícone PWA 512x512
└── sw.js           # Service Worker PWA
```

### 2. Upload para HostGator

1. **Acesse o cPanel da HostGator**
2. **Abra o Gerenciador de Arquivos**
3. **Navegue até a pasta `public_html`** (ou subpasta do seu domínio)
4. **Faça upload de TODOS os arquivos da pasta `dist/`** para a raiz do seu domínio

### 3. Configurações Importantes

#### ✅ Arquivo .htaccess
O arquivo `.htaccess` já está configurado com:
- Roteamento para SPA React
- MIME types corretos para módulos JavaScript
- Configurações de cache otimizadas
- Compressão GZIP
- Configurações de segurança para hospedagem compartilhada
- Proteção contra hotlinking
- Headers de segurança

#### ✅ PWA Configurada
- Manifest.json configurado
- Service Worker funcional
- Ícones PWA incluídos
- Funcionalidade offline

### 4. Verificações Pós-Deploy

1. **Teste o site**: Acesse seu domínio e verifique se carrega corretamente
2. **Teste as rotas**: Navegue pelas diferentes páginas da aplicação
3. **Teste PWA**: Verifique se o site pode ser instalado como app
4. **Teste responsividade**: Verifique em dispositivos móveis

### 5. Configurações Opcionais

#### HTTPS (Recomendado)
Para ativar redirecionamento HTTPS, descomente as linhas no `.htaccess`:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### Proteção contra Hotlinking
Atualize a linha no `.htaccess` com seu domínio:
```apache
RewriteCond %{HTTP_REFERER} !^http(s)?://(www\.)?SEUDOMINIO.com [NC]
```

### 6. Estrutura Final no Servidor

```
public_html/
├── .htaccess        # Configurações do servidor
├── assets/          # Arquivos compilados (CSS, JS)
├── index.html       # Página principal
├── logo.png
├── manifest.json
├── pwa-icon-192.svg
├── pwa-icon-512.svg
└── sw.js
```

### 7. Troubleshooting

#### Problema: Páginas retornam 404
- **Solução**: Verifique se o arquivo `.htaccess` foi enviado corretamente

#### Problema: Arquivos JS não carregam
- **Solução**: Verifique se os MIME types estão configurados no `.htaccess`

#### Problema: Site não funciona em HTTPS
- **Solução**: Ative o redirecionamento HTTPS no `.htaccess`

#### Problema: Imagens não carregam
- **Solução**: Verifique se todos os arquivos da pasta `assets/` foram enviados

### 8. Otimizações para HostGator

- ✅ Compressão GZIP ativada
- ✅ Cache de arquivos estáticos configurado
- ✅ MIME types otimizados
- ✅ Segurança aprimorada
- ✅ PWA funcional
- ✅ Roteamento SPA configurado

### 9. Suporte

Em caso de problemas:
1. Verifique os logs de erro no cPanel
2. Teste em modo incógnito do navegador
3. Limpe o cache do navegador
4. Verifique se todos os arquivos foram enviados corretamente

---

**✅ Deploy Pronto!** Seu site React está otimizado para hospedagem compartilhada na HostGator.