.PHONY: help
SHELL = /bin/bash

NAME=`jq .name package.json -r`
VERSION=`jq .version package.json -r`
REPOSITORY=container-registry.oslo.kommune.no

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker build \
		--tag ${REPOSITORY}/${NAME}:${VERSION} .

push-image: ## Push image to repository
	docker push ${REPOSITORY}/${NAME}:${VERSION}

deploy:
	helm --tiller-namespace=developerportal-test --namespace=developerportal-test upgrade \
	--install ${NAME} helm-charts

run: ## Run the service locally
	nodemon -r dotenv/config app.js

run-in-docker: ## Run the service in Docker
	docker stop ${NAME} || true
	docker rm ${NAME} || true
	docker run \
		-d -p 3000:3000 \
		--name ${NAME} \
		--env-file .env-docker \
		${REPOSITORY}/${NAME}:${VERSION}

test: ## Run tests
	npm run test

generate-dotenv-file: ## Generate .env file template
	echo "RECIPIENT_EMAIL_ADDRESS=developerportal@oslo.kommune.no" >> .env
	echo "EMAIL_API_API_KEY=" >> .env
	echo "EMAIL_API_ENDPOINT_URL=https://email-test.api-test.oslo.kommune.no/email" >> .env
	echo "KEYCLOAK_AUTH_URL=https://login-test.oslo.kommune.no/auth" >> .env

clean: ## Clean up project directory
	@rm -rf node_modules || true