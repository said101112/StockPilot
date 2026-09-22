#!/usr/bin/env bash

# ==============================================================================
# 🚀 StockPilot — Script Shell Unique de Démarrage (Backend + Frontend)
# ==============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================================================"
echo "          STOCKPILOT — LANCEMENT GLOBAL (BACKEND + FRONTEND)          "
echo "======================================================================"

cleanup() {
    echo ""
    echo "🛑 Arrêt en cours des services StockPilot..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    if command -v cmd.exe >/dev/null 2>&1; then
        cmd.exe /c "taskkill /F /IM java.exe /T 2>nul" 2>/dev/null || true
        cmd.exe /c "taskkill /F /IM node.exe /T 2>nul" 2>/dev/null || true
    fi
    echo "✅ Tous les services ont été arrêtés avec succès."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Démarrage du Backend Spring Boot (Port 8999)
echo "📦 [1/2] Démarrage du Backend Spring Boot (Port 8999)..."
cd "$ROOT_DIR/backend" || exit 1

if command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /c "mvnw.cmd spring-boot:run" &
    BACKEND_PID=$!
elif [ -f "./mvnw" ]; then
    chmod +x ./mvnw 2>/dev/null
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
else
    mvn spring-boot:run &
    BACKEND_PID=$!
fi

# Temporisation pour laisser le serveur Spring Boot et PostgreSQL s'initialiser
echo "⏳ Initialisation de Spring Boot & PostgreSQL..."
sleep 4

# 2. Démarrage du Frontend React Vite (Port 5173)
echo "💻 [2/2] Démarrage du Frontend React Vite (Port 5173)..."
cd "$ROOT_DIR/frontend" || exit 1

if command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /c "npm run dev" &
    FRONTEND_PID=$!
else
    npm run dev &
    FRONTEND_PID=$!
fi

echo ""
echo "======================================================================"
echo "  🎉 StockPilot est en cours d'exécution :"
echo "     👉 Frontend (Cockpit Web) : http://localhost:5173"
echo "     👉 Backend  (API REST)     : http://localhost:8999"
echo "======================================================================"
echo "  ℹ️  Appuyez sur [Ctrl + C] dans ce terminal pour tout arrêter d'un coup !"
echo "======================================================================"

wait

