IMAGE_NAME = zk-load-test
IMAGE_VERSION = latest
LOCATION ?= us-west1
PROJECT_ID ?= zerok-dev
REPOSITORY ?= zk-client

docker-build: 
    docker build --no-cache $(DockerFile) -t $(IMAGE_PREFIX)$(IMAGE_NAME)$(IMAGE_NAME_SUFFIX):$(IMAGE_VERSION) .

docker-push:
    docker push $(IMAGE_PREFIX)$(IMAGE_NAME)$(IMAGE_NAME_SUFFIX):$(IMAGE_VERSION)

docker-build-gke: IMAGE_PREFIX := $(LOCATION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/
docker-build-gke: DockerFile := -f DockerFile
docker-build-gke: docker-build

docker-push-gke: IMAGE_PREFIX := $(LOCATION)-docker.pkg.dev/$(PROJECT_ID)/$(REPOSITORY)/
docker-push-gke: docker-push
