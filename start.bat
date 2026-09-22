@echo off
title StockPilot Launcher
color 0A

echo ======================================================================
echo          STOCKPILOT - LANCEMENT GLOBAL (BACKEND + FRONTEND)
echo ======================================================================
echo.
echo [1/2] Lancement du Backend Spring Boot (Port 8999)...
start "StockPilot - Backend (Spring Boot :8999)" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo [2/2] Lancement du Frontend React TailAdmin (Port 5173)...
start "StockPilot - Frontend (Vite React :5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  Les serveurs demarrent dans deux fenetres dediees :
echo    - Backend  : http://localhost:8999 (API REST SAP MM)
echo    - Frontend : http://localhost:5173 (Interface Web Cockpit)
echo ======================================================================
echo.
echo Vous pouvez reduire cette fenetre. Pour tout arreter, utilisez stop.bat.
timeout /t 5 >nul
