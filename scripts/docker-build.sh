#!/usr/bin/env bash
# Build & push thủ công lên Docker Hub (CI thường làm qua GitHub Actions)
set -euo pipefail

DOCKER_USERNAME="${DOCKER_USERNAME:?Set DOCKER_USERNAME}"
IMAGE_NAME="${DOCKER_USERNAME}/fpt-admission-api"
VERSION="${1:-$(git describe --tags --always --dirty 2>/dev/null || echo latest)}"
PLATFORMS="${PLATFORMS:-linux/amd64}"

echo "Building ${IMAGE_NAME}:${VERSION} (${PLATFORMS})"

docker buildx build \
  --platform "${PLATFORMS}" \
  -t "${IMAGE_NAME}:${VERSION}" \
  -t "${IMAGE_NAME}:latest" \
  --push \
  -f docker/Dockerfile .

docker buildx imagetools inspect "${IMAGE_NAME}:latest"
