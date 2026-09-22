@echo off
title StockPilot Stopper
color 0C

echo ======================================================================
echo          STOCKPILOT - ARRET DES SERVICES (PORTS 8999 & 5173)
echo ======================================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8999') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [OK] Backend (8999) et Frontend (5173) ont ete arretes proprement.
echo ======================================================================
timeout /t 3 >nul
