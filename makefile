.PHONY: help
SHELL = /bin/bash

NAME=`jq .name package.json -r`
VERSION=`jq .version package.json -r`
REPOSITORY=container-registry.oslo.kommune.no
dockerImage = container-registry.oslo.kommune.no/developer-portal-feedback
helmDir = helm-chart/feedback
TAG = test

# secrets
apiKey=feedback-email-api-key
apiKeyRef=app.apiKeyRef=${apiKey}

# Sha256 of docker image - if set as label on helm upgrade it will always trigger a deploy when docker image has changed.
# No need to delete pods, bump tags or change arbitary config with this method.
get-image-digest = "$(shell docker inspect --format='{{.RepoDigests}}' ${dockerImage}:${TAG} | tail -c -66 | head -c 63)"

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image
	docker build \
		--tag ${dockerImage}:${TAG} .

push-image: ## Push image to repository
	docker push ${dockerImage}:${TAG}

deploy: ## Deploy image with given TAG to environment given by TAG. USAGE: make deploy TAG=0.1.XX
	helm upgrade \
		feedback \
		${helmDir} \
		-f ${helmDir}/values.yaml \
		--set image.tag=${TAG} \
		--set podLabels.digest=$(call get-image-digest) \
		--tiller-namespace=developerportal-test \
		--set $(apiKeyRef) \
		--install \
		--reset-values

run: ## Run the service locally
	nodemon -r dotenv/config app.js

run-in-docker: ## Run the service in Docker
	docker stop ${NAME} || true
	docker rm ${NAME} || true
	docker run \
		-d -p 3000:3000 \
		--name ${NAME} \
		--env-file .env-docker \
		${dockerImage}:${TAG}

test: ## Run tests
	npm run test

generate-dotenv-file: ## Generate .env file template
	echo "RECIPIENT_EMAIL_ADDRESS=developerportal@oslo.kommune.no" >> .env
	echo "EMAIL_API_API_KEY=" >> .env
	echo "EMAIL_API_ENDPOINT_URL=https://email-test.api-test.oslo.kommune.no/email" >> .env
	echo "KEYCLOAK_AUTH_URL=https://login-test.oslo.kommune.no/auth" >> .env

clean: ## Clean up project directory
	@rm -rf node_modules || true