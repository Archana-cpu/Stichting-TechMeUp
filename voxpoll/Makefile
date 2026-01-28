# ══════════════════════════════════════════════════════════════════════════════
# VOXPOLL - MAKEFILE
# Quick commands for development
# ══════════════════════════════════════════════════════════════════════════════

.PHONY: setup dev dev-api dev-web dev-mobile start stop db-push db-studio reset help

# Default target
help:
	@echo "═══════════════════════════════════════════════════════════════════"
	@echo "  VOXPOLL - Available Commands"
	@echo "═══════════════════════════════════════════════════════════════════"
	@echo ""
	@echo "  make setup      - First time setup (install deps, start Docker)"
	@echo "  make dev        - Start all development servers"
	@echo "  make dev-api    - Start only API server"
	@echo "  make dev-web    - Start only Web app"
	@echo "  make dev-mobile - Start only Mobile (Expo)"
	@echo "  make start      - Start Docker services"
	@echo "  make stop       - Stop Docker services"
	@echo "  make db-push    - Push schema to database"
	@echo "  make db-studio  - Open Drizzle Studio"
	@echo "  make reset      - Reset everything (DESTRUCTIVE!)"
	@echo ""

# First time setup
setup:
	@./scripts/setup.sh

# Development
dev:
	@./scripts/dev.sh

dev-api:
	@./scripts/dev-api.sh

dev-web:
	@./scripts/dev-web.sh

dev-mobile:
	@./scripts/dev-mobile.sh

# Docker services
start:
	@docker compose up -d

stop:
	@docker compose stop

logs:
	@docker compose logs -f

# Database
db-push:
	@cd packages/database && pnpm db:push

db-studio:
	@cd packages/database && pnpm db:studio

db-generate:
	@cd packages/database && pnpm db:generate

db-seed:
	@cd packages/database && pnpm db:seed

# Cleanup
clean:
	@docker compose down
	@rm -rf node_modules
	@rm -rf packages/*/node_modules

reset:
	@echo "WARNING: This will delete ALL data!"
	@read -p "Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ] && \
		docker compose down -v --remove-orphans && \
		rm -rf node_modules packages/*/node_modules pnpm-lock.yaml && \
		echo "Reset complete. Run 'make setup' to start fresh."
