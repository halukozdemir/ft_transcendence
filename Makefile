# ============================================
# ft_transcendence - Makefile
# ============================================

.PHONY: all build up down restart logs clean ssl help

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

# Run migrations for game service
migrate-game:
	docker-compose exec game_service python manage.py migrate

# Create superuser for auth service
superuser:
	docker-compose exec auth_service python manage.py createsuperuser

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
	@echo "  make clean      - Remove everything (containers, volumes, images)"
	@echo "  make status     - Show status of all containers"
	@echo "  make superuser  - Create Django superuser (auth)"
	@echo ""
