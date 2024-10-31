#!/bin/sh
# Build the Docker image
docker build -f app.Dockerfile -t "$IMAGE_TAG:$CI_COMMIT_SHORT_SHA" .