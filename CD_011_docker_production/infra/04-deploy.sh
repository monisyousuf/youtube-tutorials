#!/bin/sh
# SSH into the server, login to Docker, pull the image, and run it
ssh -v -i /tmp/ec2-remote-login-key.pem -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/known_hosts "$SERVER_USER@$SERVER_DNS_OR_IP" << EOF
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
  docker pull "$IMAGE_TAG:$CI_COMMIT_SHORT_SHA"
  docker stop $CONTAINER_NAME || true  # Stop any running instance
  docker rm $CONTAINER_NAME || true    # Remove stopped instance
  docker run -d --name $CONTAINER_NAME -p 80:8080 "$IMAGE_TAG:$CI_COMMIT_SHORT_SHA"
EOF