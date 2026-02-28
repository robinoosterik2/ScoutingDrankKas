.PHONY: help up down build-docker logs sh install dev build lint test db-push db-studio

# Default target
help:
	@echo "Available commands:"
	@echo "  make up            - Start the Docker development environment"
	@echo "  make down          - Stop the Docker development environment"
	@echo "  make build-docker  - Rebuild the Docker images"
	@echo "  make logs          - View Docker logs"
	@echo "  make sh            - Open a shell inside the app container"
	@echo "  make install       - Install dependencies locally (in app/)"
	@echo "  make dev           - Run the development server locally"
	@echo "  make build         - Build the Nuxt application locally"
	@echo "  make lint          - Run the linter and fix issues"
	@echo "  make test          - Run tests"
	@echo "  make db-push       - Push database schema changes (Prisma)"
	@echo "  make db-studio     - Open Prisma Studio to view the database"

# Docker commands
up:
	docker compose up

down:
	docker compose down

build-docker:
	docker compose build

logs:
	docker compose logs -f

sh:
	docker exec -it drankkas-dev sh

# Local Node/pnpm commands
install:
	cd app && pnpm install

dev:
	cd app && pnpm dev

build:
	cd app && pnpm build

lint:
	cd app && pnpm lint:fix

test:
	cd app && pnpm test

# Database / Prisma commands
db-push:
	cd app && pnpm db:push

db-studio:
	cd app && pnpm prisma studio
