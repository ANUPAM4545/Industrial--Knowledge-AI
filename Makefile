# ═══════════════════════════════════════════════════════════════
#  ForgeMind AI — Makefile
#  Run `make help` to see all available commands.
# ═══════════════════════════════════════════════════════════════

.PHONY: help dev prod build stop clean logs migrate seed test lint \
        shell-be shell-ai shell-fe frontend-install backend-install

# Colors
GREEN  := \033[0;32m
YELLOW := \033[1;33m
CYAN   := \033[0;36m
RESET  := \033[0m

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)╔══════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)║       ForgeMind AI — Commands         ║$(RESET)"
	@echo "$(CYAN)╚══════════════════════════════════════╝$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ─── Docker Compose ──────────────────────────────────────────────

dev: ## Start development environment (with hot reload)
	@echo "$(YELLOW)Starting ForgeMind AI in development mode...$(RESET)"
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

prod: ## Start production environment
	@echo "$(YELLOW)Starting ForgeMind AI in production mode...$(RESET)"
	docker compose -f docker-compose.yml up --build -d

build: ## Build all Docker images
	@echo "$(YELLOW)Building all images...$(RESET)"
	docker compose -f docker-compose.yml build

stop: ## Stop all running containers
	docker compose down

clean: ## Remove containers, volumes, and orphans
	@echo "$(YELLOW)Cleaning up Docker resources...$(RESET)"
	docker compose down -v --remove-orphans
	docker system prune -f

logs: ## Tail logs from all services
	docker compose logs -f

logs-be: ## Tail backend logs
	docker compose logs -f backend

logs-ai: ## Tail AI service logs
	docker compose logs -f ai-service

logs-fe: ## Tail frontend logs
	docker compose logs -f frontend

# ─── Database ────────────────────────────────────────────────────

migrate: ## Run Alembic database migrations
	@echo "$(YELLOW)Running database migrations...$(RESET)"
	docker compose exec backend alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create MSG="your message")
	docker compose exec backend alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Downgrade last migration
	docker compose exec backend alembic downgrade -1

seed: ## Seed the database with initial data
	@echo "$(YELLOW)Seeding database...$(RESET)"
	docker compose exec backend python scripts/seed.py

# ─── Testing ─────────────────────────────────────────────────────

test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(RESET)"
	docker compose exec backend pytest tests/ -v
	cd frontend && npm run test

test-be: ## Run backend tests only
	docker compose exec backend pytest tests/ -v --cov=app

test-fe: ## Run frontend tests only
	cd frontend && npm run test

# ─── Linting ─────────────────────────────────────────────────────

lint: ## Run all linters
	@echo "$(YELLOW)Running linters...$(RESET)"
	docker compose exec backend ruff check app/
	docker compose exec backend mypy app/
	cd frontend && npm run lint

format: ## Auto-format all code
	docker compose exec backend ruff format app/
	cd frontend && npm run format

# ─── Shells ──────────────────────────────────────────────────────

shell-be: ## Open a shell in the backend container
	docker compose exec backend bash

shell-ai: ## Open a shell in the AI service container
	docker compose exec ai-service bash

shell-fe: ## Open a shell in the frontend container
	docker compose exec frontend sh

shell-db: ## Open a psql shell
	docker compose exec postgres psql -U forgemind -d forgemind_db

# ─── Local Development ───────────────────────────────────────────

frontend-install: ## Install frontend dependencies
	cd frontend && npm install

backend-install: ## Install backend Python dependencies
	cd backend && pip install -r requirements.txt

ai-install: ## Install AI service Python dependencies
	cd ai-service && pip install -r requirements.txt

frontend-dev: ## Run frontend in local dev mode
	cd frontend && npm run dev

backend-dev: ## Run backend locally
	cd backend && uvicorn app.main:app --reload --port 8000

ai-dev: ## Run AI service locally
	cd ai-service && uvicorn app.main:app --reload --port 8001

# ─── Health Checks ───────────────────────────────────────────────

health: ## Check all service health endpoints
	@./scripts/health_check.sh

# ─── Setup ───────────────────────────────────────────────────────

setup: ## Initial project setup (copy env, install deps)
	@echo "$(YELLOW)Setting up ForgeMind AI...$(RESET)"
	@cp -n .env.example .env || true
	@echo "$(GREEN)✓ .env file created (edit with your values)$(RESET)"
	@$(MAKE) frontend-install
	@echo "$(GREEN)✓ Setup complete! Run 'make dev' to start.$(RESET)"
