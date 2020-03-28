.PHONY: help
SHELL = /bin/bash

VERSION=`cat package.json | jq -r .version`
DOCKER_IMAGE=docker.pkg.github.com/tuuturu/dialogia-backend

help: ## Print this menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build-image:
	docker build \
		--tag ${DOCKER_IMAGE}:${VERSION} \
		.
push-image:
	docker push ${DOCKER_IMAGE}:${VERSION}

deploy:
	@echo MANUAL PREREQUISITES:
	@echo ssh into dialogia.tuuturu.org, and run
	@echo docker login docker.pkg.github.com -u yourusername
	@echo
	@echo and enter your github token. The token should ideally just have read access to images/packages.

	scp docker-compose.yaml dialogia.tuuturu.org:/srv/dialogia
	ssh -t dialogia.tuuturu.org "cd /srv/dialogia; docker-compose pull; docker-compose up -d"
	ssh -t dialogia.tuuturu.org "docker ps"

run: ## Run the service locally
	npx nodemon app.js
