IMAGE_NAME=devclient03/zk-load-test
IMAGE_VERSION=latest
LOCATION=us-west1
PROJECT_ID=zerok-dev
REPOSITORY=zk-client

IMAGE_PREFIX=${LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/

.PHONY: build-and-push

build-and-push:
	docker build -t ${IMAGE_PREFIX}${IMAGE_NAME}:${IMAGE_VERSION} . && \
	docker push ${IMAGE_PREFIX}${IMAGE_NAME}:${IMAGE_VERSION}