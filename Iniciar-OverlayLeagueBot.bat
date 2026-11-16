@echo off
title OverlayLeagueBot - Launcher
cd /d "%~dp0"

echo ==================================================
echo          OverlayLeagueBot - Inicializador
echo ==================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERRO] Node.js nao encontrado no sistema!
  echo Por favor, baixe e instale o Node.js LTS em: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [1/3] Instalando dependencias pela primeira vez...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

if not exist "dist\server.js" (
  echo [2/3] Compilando o projeto...
  call npm run build
  if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o projeto.
    pause
    exit /b 1
  )
)

echo [3/3] Iniciando OverlayLeagueBot e abrindo o painel no navegador...
echo Mantenha esta janela aberta enquanto estiver usando o overlay no OBS.
echo.
node dist\server.js --open
pause
