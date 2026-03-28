# ============================================
# ft_transcendence - Makefile
# ============================================

.PHONY: all build up down restart logs clean ssl help test test-auth test-ai migrate makemigrations

# Default target
all: ssl build up

# Generate SSL certificates
ssl:
	@bash generate_ssl.sh

# Build all containers
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Start with build
up-build: ssl
	docker-compose up --build -d

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose down
	docker-compose up -d

# View logs (all services)
logs:
	docker-compose logs -f

# View logs for specific service
logs-%:
	docker-compose logs -f $*

# Remove all containers, volumes, and images
clean:
	docker-compose down -v --rmi all --remove-orphans
	rm -rf ssl/server.crt ssl/server.key

# Remove volumes only
clean-volumes:
	docker-compose down -v

# Run migrations for auth service
migrate-auth:
	docker-compose exec auth_service python manage.py migrate

# Run migrations for chat service
migrate-chat:
	docker-compose exec chat_service python manage.py migrate

# Run makemigrations + migrate for all Django services
makemigrations:
	docker-compose exec auth_service python manage.py makemigrations
	docker-compose exec chat_service python manage.py makemigrations

migrate: makemigrations
	docker-compose exec auth_service python manage.py migrate
	docker-compose exec chat_service python manage.py migrate

# Run AI service tests (specific file: make test-ai T=test_image)
test-ai:
ifdef T
	docker-compose exec ai_service pytest tests/$(T).py -v
else
	docker-compose exec ai_service pytest -v
endif

# Create superuser for auth service
superuser:
	docker-compose exec auth_service python manage.py createsuperuser

# Run all tests (auth + ai)
test:
	docker-compose exec auth_service python manage.py test auth_app.tests -v 2
	docker-compose exec ai_service pytest -v

# Run auth tests only (specific file: make test-auth T=test_login)
test-auth:
ifdef T
	docker-compose exec auth_service python manage.py test auth_app.tests.$(T) -v 2
else
	docker-compose exec auth_service python manage.py test auth_app.tests -v 2
endif

# Check status of all services
status:
	docker-compose ps

# Help
help:
	@echo ""
	@echo "ft_transcendence - Available Commands:"
	@echo "======================================="
	@echo "  make            - Generate SSL, build, and start all services"
	@echo "  make ssl        - Generate self-signed SSL certificates"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all services (detached)"
	@echo "  make up-build   - Build and start all services"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs for all services"
	@echo "  make logs-auth_service  - View logs for auth service"
	@echo "  make migrate           - makemigrations + migrate (auth + chat)"
	@echo "  make makemigrations    - Generate migrations (auth + chat)"
	@echo "  make migrate-auth      - Migrate auth service only"
	@echo "  make migrate-chat      - Migrate chat service only"
	@echo "  make test-ai           - Run all AI tests"
	@echo "  make test-ai T=test_image  - Run specific AI test file"
	@echo "  make clean      - Remove everything (containers, volumes, images)"
	@echo "  make status     - Show status of all containers"
	@echo "  make superuser  - Create Django superuser (auth)"
	@echo "  make test       - Run all auth tests"
	@echo "  make test-auth T=test_login  - Run specific test file"
	@echo ""
