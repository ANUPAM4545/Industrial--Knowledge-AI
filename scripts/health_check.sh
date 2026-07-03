#!/usr/bin/env bash
# ForgeMind AI — Health Check Script
# Checks all service endpoints and reports status.

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
RESET='\033[0m'

check_service() {
  local name=$1
  local url=$2

  if curl -sf "$url" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${RESET} $name — ${GREEN}healthy${RESET}"
  else
    echo -e "  ${RED}✗${RESET} $name — ${RED}unreachable${RESET} ($url)"
  fi
}

echo ""
echo "╔══════════════════════════════════╗"
echo "║   ForgeMind AI — Health Check    ║"
echo "╚══════════════════════════════════╝"
echo ""

check_service "Frontend"   "http://localhost:3000"
check_service "Backend API" "http://localhost:8000/health"
check_service "AI Service"  "http://localhost:8001/health"
check_service "Qdrant"      "http://localhost:6333/healthz"

echo ""
echo "─────────────────────────────────────"
echo " Tip: Run 'make logs' for service logs"
echo ""
