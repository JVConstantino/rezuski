# Script de Deploy Automatizado - Rezuski Imóveis
# Para uso no Windows PowerShell

Write-Host "🚀 Iniciando processo de deploy..." -ForegroundColor Green

# Verificar se a pasta dist existe
if (Test-Path "dist") {
    Write-Host "✅ Pasta dist encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Pasta dist não encontrada. Executando build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro no build. Abortando deploy." -ForegroundColor Red
        exit 1
    }
}

# Criar pasta de deploy temporária
$deployFolder = "deploy-temp"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

Write-Host "📦 Preparando arquivos para deploy..." -ForegroundColor Blue

# Copiar arquivos da pasta dist
Copy-Item "dist\*" -Destination $deployFolder -Recurse

# Copiar .htaccess
if (Test-Path ".htaccess") {
    Copy-Item ".htaccess" -Destination $deployFolder
    Write-Host "✅ .htaccess copiado" -ForegroundColor Green
} else {
    Write-Host "⚠️  .htaccess não encontrado" -ForegroundColor Yellow
}

# Copiar pasta uploads se existir
if (Test-Path "uploads") {
    Copy-Item "uploads" -Destination $deployFolder -Recurse
    Write-Host "✅ Pasta uploads copiada" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pasta uploads não encontrada" -ForegroundColor Yellow
}

# Criar arquivo ZIP para upload
$zipFile = "rezuski-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Compress-Archive -Path "$deployFolder\*" -DestinationPath $zipFile

Write-Host "✅ Arquivo de deploy criado: $zipFile" -ForegroundColor Green

# Limpar pasta temporária
Remove-Item $deployFolder -Recurse -Force

Write-Host ""
Write-Host "🎉 Deploy preparado com sucesso!" -ForegroundColor Green
Write-Host "📁 Arquivo: $zipFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Faça login no cPanel da Hostgator" -ForegroundColor White
Write-Host "2. Abra o File Manager" -ForegroundColor White
Write-Host "3. Navegue para public_html/" -ForegroundColor White
Write-Host "4. Faça upload do arquivo $zipFile" -ForegroundColor White
Write-Host "5. Extraia o arquivo ZIP" -ForegroundColor White
Write-Host "6. Delete o arquivo ZIP após extrair" -ForegroundColor White
Write-Host "7. Teste seu site!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consulte docs/DEPLOY_HOSTGATOR.md para instruções detalhadas" -ForegroundColor Cyan