.PHONY: help
SHELL = /bin/bash

NAME=`jq .name package.json -r`
VERSION=`jq .version package.json -r`
REPOSITORY = container-registry.oslo.kommune.no
dockerImage = developer-portal-feedback
imagePath = ${REPOSITORY}/${dockerImage}
helmDir = helm-chart/feedback

# secrets
apiKey=feedback-email-api-key
apiKeyRef=app.apiKeyRef=${apiKey}

# Locally stored ref to repository sha256 digest and actual repository sha256 digest
localDigest = $(shell docker inspect --format='{{.RepoDigests}}' ${imagePath}:${TAG} | tail -c -73 | head -c 71)
remoteDigest = $(shell curl --verbose --header "Accept: application/vnd.docker.distribution.manifest.v2+json" "https://${REPOSITORY}/v2/${dockerImage}/manifests/${TAG}" 2>&1 | grep Docker-Content-Digest | tail -c 73)

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

check-tag:
ifeq ($(TAG), )
	@echo "TAG is required and must be sepcified with 'make <command> TAG=xxx'"
	@exit 1
endif

check-sha256: check-tag ## Check if image with tag is pushed and ready
ifeq ($(remoteDigest), )
	@echo Image for tag \"${TAG}\" is not in ${REPOSITORY}, did you forget to push the image?
	@exit 1
else ifneq (${localDigest}, ${remoteDigest})
	@echo Local__digest --- ${localDigest}
	@echo Remote_digest --- ${remoteDigest}
	@echo -n "Remote and local sha256 of image does not match, did you forget to push your latest image? \
	Remote image will be used, continue? [y/N] " && read ans && [ $${ans:-N} = y ]
else
	@echo Remote sha256 for image with TAG \"${TAG}\" matches local image.
endif

build: check-tag ## Build Docker image
	docker build \
		--tag ${imagePath}:${TAG} .

push-image: check-tag ## Push image to repository
	docker push ${imagePath}:${TAG}

deploy: check-tag check-sha256 ## Deploy image with given TAG to environment given by TAG. USAGE: make deploy TAG=0.1.XX
	helm upgrade \
		feedback \
		${helmDir} \
		-f ${helmDir}/values.yaml \
		--set image.repository=${imagePath}@${remoteDigest} \
		--set podLabels.imageTag=${TAG} \
		--tiller-namespace=developerportal-test \
		--set $(apiKeyRef) \
		--install \
		--reset-values

build-prod:
	docker build \
		--tag ${REPOSITORY}/${NAME}:${VERSION} \
		.
push-image-prod:
	docker push ${REPOSITORY}/${NAME}:${VERSION}
deploy-prod:
	helm --tiller-namespace=developerportal --namespace=developerportal upgrade \
		--install ${NAME} ${helmDir} \
		--set podLabels.imageTag=${VERSION} \
		--set $(apiKeyRef) \
		--set keycloakAuthUrl=https://login.oslo.kommune.no/auth \
		--set emailApiEndpoint=https://email.api.oslo.kommune.no/email \
		--set ingress.host=devportal-feedback.k8s.oslo.kommune.no \
		--set image.repository=${REPOSITORY}/${NAME}:${VERSION} \
		--reset-values


run: ## Run the service locally
	npx nodemon app.js

run-in-docker: check-tag ## Run the service in Docker
	docker stop ${NAME} || true
	docker rm ${NAME} || true
	docker run \
		-d -p 3000:3000 \
		--name ${NAME} \
		--env-file .env-docker \
		${imagePath}:${TAG}

test: ## Run tests
	npm run test

generate-dotenv-file: ## Generate .env file template
	echo "RECIPIENT_EMAIL_ADDRESS=developerportal@oslo.kommune.no" >> .env
	echo "EMAIL_API_API_KEY=" >> .env
	echo "EMAIL_API_ENDPOINT_URL=https://email-test.api-test.oslo.kommune.no/email" >> .env
	echo "KEYCLOAK_AUTH_URL=https://login-test.oslo.kommune.no/auth" >> .env

clean: ## Clean up project directory
	@rm -rf node_modules || true
