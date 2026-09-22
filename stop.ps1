# ==============================================================================
# 🛑 StockPilot — Arrêt Propre des Services PowerShell (Ports 8999 & 5173)
# ==============================================================================

Write-Host "Arret des services StockPilot..." -ForegroundColor Yellow

$ports = @(8999, 5173)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pidToKill in $processes) {
        if ($pidToKill -gt 0) {
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            Write-Host "Processus sur le port $port (PID: $pidToKill) arrete." -ForegroundColor Green
        }
    }
}

Write-Host "Services Backend et Frontend arretes avec succes." -ForegroundColor Green
