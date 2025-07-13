.PHONY: logs
help:
	@echo "Makefile commands:"
	@echo "  build     - Build docker containers"
	@echo "  up        - Start containers in detached mode"
	@echo "  down      - Stop containers"
	@echo "  logs      - View logs"
	@echo "  restart   - Restart containers"
	@echo "  swagger   - Generate Swagger docs"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f api

restart:
	docker-compose down && docker-compose up -d

