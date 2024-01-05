IMAGE_NAME=devclient03/zk-load-test
IMAGE_VERSION=latest
LOCATION=us-west1
PROJECT_ID=zerok-dev
REPOSITORY=zk-client

IMAGE_PREFIX=${LOCATION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/

docker build -t ${IMAGE_PREFIX}${IMAGE_NAME}${IMAGE_NAME_SUFFIX}:${IMAGE_VERSION} .
docker push us-west1-docker.pkg.dev/zerok-dev/zk-client/devclient03/zk-load-test:latest