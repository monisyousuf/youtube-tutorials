#!/bin/sh
# Docker Hub login before pushing the image
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin