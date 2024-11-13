#!/bin/sh
# Build and push the Docker image
docker push "$IMAGE_TAG:$CI_COMMIT_SHORT_SHA"