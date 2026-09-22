@echo off
title StockPilot (Backend + Frontend)
cd /d "%~dp0"

where bash >nul 2>&1
if %errorlevel% equ 0 (
    bash "./start.sh"
) else (
    echo Lancement de StockPilot...
    start "StockPilot Backend" cmd /c "cd /d backend && mvnw.cmd spring-boot:run"
    cd frontend && npm run dev
)
