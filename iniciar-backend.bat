@echo off
echo ========================================
echo Iniciando Backend Quick Finance
echo ========================================
echo.

cd qfin-backend\qfin-backend

echo Verificando Java...
java -version
echo.

echo Limpando e compilando o projeto...
call mvnw.cmd clean install -DskipTests
echo.

if %ERRORLEVEL% EQU 0 (
    echo Compilacao concluida com sucesso!
    echo.
    echo Iniciando o servidor Spring Boot...
    echo Backend estara disponivel em: http://localhost:8080
    echo Console H2 disponivel em: http://localhost:8080/h2-console
    echo.
    call mvnw.cmd spring-boot:run
) else (
    echo.
    echo ERRO: Falha na compilacao do projeto!
    echo Verifique se o Java 17+ esta instalado corretamente.
    echo.
    pause
)
