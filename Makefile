PROJECT_NAME=denniskasperdotcom

default: help

.PHONY: help build up down start stop destroy ps logs build-prod

help: ## Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build the target
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker compose -p $(PROJECT_NAME) -f docker-compose.yaml build $(c)

up: ## Run container
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml up -d $(c)

down: ## Bring containers down
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml down $(c)

start: ## Start container
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml start $(c)

stop:	## Stop running container
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml stop $(c)

destroy: ## Remove all
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml down --rmi all -v --remove-orphans $(c)

ps: ## Show running container
		docker compose -p $(PROJECT_NAME) -f docker-compose.yaml ps

logs: ## Print logs
	docker compose -p $(PROJECT_NAME) -f docker-compose.yaml logs --tail=100 -f $(c)

build-prod: ## Build the production bundle
	DOCKER_BUILDKIT=1 docker build --target runtime -t $(PROJECT_NAME) .
