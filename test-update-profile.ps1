# Script para testar atualizacao de perfil

Write-Host "=== TESTE DE ATUALIZACAO DE PERFIL ===" -ForegroundColor Cyan
Write-Host ""

# Primeiro, fazer login para obter um token
Write-Host "1. Fazendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = "teste.novo.usuario@qfin.com"
    password = "teste123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    
    Write-Host "OK Login bem-sucedido!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  Usuario: $($loginData.user.name)" -ForegroundColor Gray
    Write-Host "  Email: $($loginData.user.email)" -ForegroundColor Gray
    Write-Host ""
    
    # Testar atualizacao de perfil
    Write-Host "2. Atualizando perfil (apenas nome)..." -ForegroundColor Yellow
    $updateBody = @{
        name = "Teste Usuario Atualizado"
        email = "teste.novo.usuario@qfin.com"
    } | ConvertTo-Json
    
    $updateResponse = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/profile' -Method PUT -Headers @{
        'Content-Type'='application/json'
        'Authorization'="Bearer $token"
    } -Body $updateBody
    
    $updateData = $updateResponse.Content | ConvertFrom-Json
    
    Write-Host "OK Perfil atualizado com sucesso!" -ForegroundColor Green
    Write-Host "  Status Code: $($updateResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "  Novo nome: $($updateData.user.name)" -ForegroundColor Gray
    Write-Host "  Email: $($updateData.user.email)" -ForegroundColor Gray
    Write-Host "  Novo token: $($updateData.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
    # Testar atualizacao com novo email
    Write-Host "3. Atualizando perfil (nome e email)..." -ForegroundColor Yellow
    $updateBody2 = @{
        name = "Teste Usuario Final"
        email = "teste.atualizado@qfin.com"
    } | ConvertTo-Json
    
    $updateResponse2 = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/profile' -Method PUT -Headers @{
        'Content-Type'='application/json'
        'Authorization'="Bearer $($updateData.token)"
    } -Body $updateBody2
    
    $updateData2 = $updateResponse2.Content | ConvertFrom-Json
    
    Write-Host "OK Perfil atualizado com novo email!" -ForegroundColor Green
    Write-Host "  Status Code: $($updateResponse2.StatusCode)" -ForegroundColor Gray
    Write-Host "  Novo nome: $($updateData2.user.name)" -ForegroundColor Gray
    Write-Host "  Novo email: $($updateData2.user.email)" -ForegroundColor Gray
    Write-Host "  Token atualizado: $($updateData2.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "=== TODOS OS TESTES CONCLUIDOS ===" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERRO no teste" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
