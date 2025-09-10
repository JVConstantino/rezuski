# Script para build versionado - Rezuski Imoveis
# Compativel com HostGator hospedagem compartilhada

Write-Host "=== BUILD VERSIONADO PARA HOSTGATOR ===" -ForegroundColor Green
Write-Host ""

# Gera timestamp para versionamento
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan

# Executa o build
Write-Host "" 
Write-Host "Executando npm run build..." -ForegroundColor Yellow
npm run build

# Verifica se o build foi bem-sucedido
if ($LASTEXITCODE -eq 0) {
    Write-Host "" 
    Write-Host "Build concluido com sucesso!" -ForegroundColor Green
    
    # Cria diretorio de builds se nao existir
    if (!(Test-Path "dist\builds")) {
        New-Item -ItemType Directory -Path "dist\builds" -Force | Out-Null
    }
    
    # Cria pasta versionada
    $buildPath = "dist\builds\build_$timestamp"
    Write-Host "" 
    Write-Host "Criando build versionado em: $buildPath" -ForegroundColor Cyan
    
    # Copia arquivos do build atual para pasta versionada
    Copy-Item -Path "dist\*" -Destination $buildPath -Recurse -Force -Exclude "builds"
    
    Write-Host "" 
    Write-Host "=== RESUMO DO BUILD ===" -ForegroundColor Green
    Write-Host "Versao: $timestamp" -ForegroundColor White
    Write-Host "Pasta: $buildPath" -ForegroundColor White
    Write-Host "Status: Pronto para deploy na HostGator" -ForegroundColor Green
    
    # Mostra tamanho dos arquivos principais
    $indexSize = (Get-Item "$buildPath\index.html").Length
    $assetsCount = (Get-ChildItem "$buildPath\assets" -File).Count
    Write-Host "" 
    Write-Host "Arquivos gerados:" -ForegroundColor Cyan
    Write-Host "  - index.html: $([math]::Round($indexSize/1KB, 2)) KB" -ForegroundColor White
    Write-Host "  - Assets: $assetsCount arquivos" -ForegroundColor White
    
    # Lista builds anteriores
    $previousBuilds = Get-ChildItem -Path "dist\builds" -Directory | Sort-Object Name -Descending | Select-Object -Skip 1
    if ($previousBuilds.Count -gt 0) {
        Write-Host "" 
        Write-Host "Builds anteriores disponiveis:" -ForegroundColor Magenta
        $previousBuilds | ForEach-Object {
            $buildDate = $_.Name -replace "build_", ""
            Write-Host "   - $buildDate" -ForegroundColor Gray
        }
    }
    
} else {
    Write-Host "Erro durante o build. Verifique os logs acima." -ForegroundColor Red
    exit 1
}

Write-Host "" 
Write-Host "=== INSTRUCOES PARA DEPLOY ===" -ForegroundColor Yellow
Write-Host "1. Acesse o cPanel da HostGator" -ForegroundColor White
Write-Host "2. Abra o Gerenciador de Arquivos" -ForegroundColor White
Write-Host "3. Navegue ate public_html" -ForegroundColor White
Write-Host "4. Faca upload de TODOS os arquivos da pasta: $buildPath" -ForegroundColor White
Write-Host "5. Verifique se o arquivo .htaccess foi enviado" -ForegroundColor White
Write-Host "" 
Write-Host "Consulte DEPLOY_HOSTGATOR_INSTRUCTIONS.md para detalhes completos." -ForegroundColor Cyan
Write-Host ""
