$body = @{
    name = "Teste Novo Usuario"
    email = "teste.novo.usuario@qfin.com"
    password = "teste123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/register' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body

Write-Host "Status Code:" $response.StatusCode
Write-Host "Response:" $response.Content
