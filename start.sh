#!/usr/bin/env bash

# ==============================================================================
# 🚀 StockPilot — Script Shell Bash (Linux / macOS / Git Bash)
# ==============================================================================

echo "======================================================================"
echo "         STOCKPILOT - LANCEMENT GLOBAL (BACKEND + FRONTEND)           "
echo "======================================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Lancement du Backend en arrière-plan
echo "[1/2] Lancement du Backend Spring Boot (Port 8999)..."
cd "$ROOT_DIR/backend" || exit
if [ -f "./mvnw" ]; then
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
else
    mvn spring-boot:run &
    BACKEND_PID=$!
fi

# 2. Lancement du Frontend
echo "[2/2] Lancement du Frontend React (Port 5173)..."
cd "$ROOT_DIR/frontend" || exit
npm run dev &
FRONTEND_PID=$!

echo ""
echo "======================================================================"
echo "  Backend  (PID $BACKEND_PID) : http://localhost:8999"
echo "  Frontend (PID $FRONTEND_PID) : http://localhost:5173"
echo "======================================================================"
echo "Appuyez sur Ctrl+C pour arrêter les deux services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
