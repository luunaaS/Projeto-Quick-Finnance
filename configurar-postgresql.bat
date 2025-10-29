@echo off
chcp 65001 >nul
echo ============================================
echo   Quick Finance - Configuração PostgreSQL
echo ============================================
echo.

REM Verificar se PostgreSQL está instalado
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL não encontrado!
    echo.
    echo Por favor, instale o PostgreSQL:
    echo https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado!
echo.

REM Definir caminho do PostgreSQL
set PGPATH=C:\Program Files\PostgreSQL\15\bin
if not exist "%PGPATH%\psql.exe" (
    set PGPATH=C:\Program Files\PostgreSQL\14\bin
)
if not exist "%PGPATH%\psql.exe" (
    set PGPATH=C:\Program Files\PostgreSQL\16\bin
)

echo 📁 Usando PostgreSQL em: %PGPATH%
echo.

echo ============================================
echo   Criando Banco de Dados
echo ============================================
echo.
echo Você precisará digitar a senha do usuário 'postgres'
echo (definida durante a instalação do PostgreSQL)
echo.

REM Criar usuário e banco de dados
"%PGPATH%\psql.exe" -U postgres -c "CREATE USER qfinuser WITH PASSWORD 'qfinpass123';" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Usuário 'qfinuser' criado com sucesso!
) else (
    echo ⚠️  Usuário 'qfinuser' já existe ou erro ao criar
)

"%PGPATH%\psql.exe" -U postgres -c "CREATE DATABASE qfindb OWNER qfinuser;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Banco de dados 'qfindb' criado com sucesso!
) else (
    echo ⚠️  Banco 'qfindb' já existe ou erro ao criar
)

"%PGPATH%\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE qfindb TO qfinuser;" 2>nul
echo ✅ Privilégios concedidos!

echo.
echo ============================================
echo   Testando Conexão
echo ============================================
echo.

REM Testar conexão
set PGPASSWORD=qfinpass123
"%PGPATH%\psql.exe" -U qfinuser -d qfindb -c "\dt" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Conexão com banco de dados OK!
    echo.
    echo ============================================
    echo   Configuração Concluída! 🎉
    echo ============================================
    echo.
    echo Credenciais:
    echo   Banco: qfindb
    echo   Usuário: qfinuser
    echo   Senha: qfinpass123
    echo   Porta: 5432
    echo.
    echo Próximo passo:
    echo   Execute: iniciar-backend.bat
    echo.
) else (
    echo ❌ Erro ao conectar ao banco de dados
    echo.
    echo Verifique:
    echo   1. PostgreSQL está rodando?
    echo   2. Senha do postgres está correta?
    echo   3. Porta 5432 está disponível?
    echo.
)

pause
