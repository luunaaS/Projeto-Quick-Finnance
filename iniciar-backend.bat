@echo off
setlocal

echo ========================================
echo Iniciando Backend Quick Finance
echo ========================================
echo.

REM Ir para a raiz do projeto a partir da pasta deste .bat
cd /d "%~dp0"

REM Verificar se Java esta disponivel no PATH
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Java nao encontrado no PATH.
    echo Instale o Java 17+ e configure a variavel PATH.
    pause
    exit /b 1
)

echo Verificando Java...
java -version
echo.

REM Ir para a pasta do backend
cd /d "qfin-backend\qfin-backend"

if not exist "mvnw.cmd" (
    echo ERRO: mvnw.cmd nao encontrado em %cd%
    pause
    exit /b 1
)

echo Iniciando o servidor Spring Boot...
echo Backend estara disponivel em: http://localhost:8080
echo Console H2 disponivel em: http://localhost:8080/h2-console
echo.

call mvnw.cmd spring-boot:run
