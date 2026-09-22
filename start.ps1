# ==============================================================================
# 🚀 StockPilot — Lanceur Global PowerShell (Backend + Frontend)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         STOCKPILOT - LANCEMENT GLOBAL (BACKEND + FRONTEND)           " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot

# 1. Lancer le Backend Spring Boot
Write-Host "`n[1/2] Lancement du Backend Spring Boot (Port 8999)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\backend'; `$host.UI.RawUI.WindowTitle = 'StockPilot - Backend Spring Boot (8999)'; Write-Host '🚀 Backend Spring Boot en cours d execution sur http://localhost:8999...' -ForegroundColor Cyan; .\mvnw.cmd spring-boot:run"

# 2. Lancer le Frontend React Vite
Write-Host "[2/2] Lancement du Frontend React TailAdmin (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; `$host.UI.RawUI.WindowTitle = 'StockPilot - Frontend React (5173)'; Write-Host '✨ Frontend React Vite en cours d execution sur http://localhost:5173...' -ForegroundColor Green; npm run dev"

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "  Les serveurs ont ete lances dans deux fenetres separees :" -ForegroundColor Green
Write-Host "    - Backend  : http://localhost:8999 (API REST SAP MM)" -ForegroundColor White
Write-Host "    - Frontend : http://localhost:5173 (Interface Web React)" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "`nPour arreter les serveurs, executez .\stop.ps1 ou fermez les fenetres." -ForegroundColor Gray
