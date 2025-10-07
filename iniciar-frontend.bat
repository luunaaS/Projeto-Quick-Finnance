@echo off
echo ========================================
echo Iniciando Frontend Quick Finance
echo ========================================
echo.

cd qfin-frontend

echo Verificando Node.js...
node --version
echo.

echo Verificando npm...
npm --version
echo.

echo Instalando dependencias (se necessario)...
call npm install
echo.

if %ERRORLEVEL% EQU 0 (
    echo Dependencias instaladas com sucesso!
    echo.
    echo Iniciando o servidor de desenvolvimento...
    echo Frontend estara disponivel em: http://localhost:5173
    echo.
    call npm run dev
) else (
    echo.
    echo ERRO: Falha na instalacao das dependencias!
    echo Verifique se o Node.js e npm estao instalados corretamente.
    echo.
    pause
)
