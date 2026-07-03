#!/usr/bin/env bash
# ForgeMind AI — Initial Setup Script
# Run this once after cloning the repository.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo "${CYAN}╔═══════════════════════════════════╗${RESET}"
echo "${CYAN}║   ForgeMind AI — Setup Script     ║${RESET}"
echo "${CYAN}╚═══════════════════════════════════╝${RESET}"
echo ""

# Copy env file
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "${GREEN}✓${RESET} Created .env from .env.example"
  echo "${YELLOW}  ⚠  Edit .env with your actual values before starting!${RESET}"
else
  echo "${GREEN}✓${RESET} .env already exists"
fi

# Make scripts executable
chmod +x scripts/*.sh
echo "${GREEN}✓${RESET} Scripts made executable"

# Install frontend dependencies
echo ""
echo "${YELLOW}Installing frontend dependencies...${RESET}"
cd frontend && npm install && cd ..
echo "${GREEN}✓${RESET} Frontend dependencies installed"

echo ""
echo "${GREEN}Setup complete! Next steps:${RESET}"
echo ""
echo "  1. Edit .env with your configuration:"
echo "     ${CYAN}nano .env${RESET}"
echo ""
echo "  2. Start the development environment:"
echo "     ${CYAN}make dev${RESET}"
echo ""
echo "  3. In another terminal, run migrations:"
echo "     ${CYAN}make migrate${RESET}"
echo ""
