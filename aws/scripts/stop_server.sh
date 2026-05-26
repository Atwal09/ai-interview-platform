#!/bin/bash
# =============================================================
# CodeDeploy: ApplicationStop
# Gracefully stop the running container
# =============================================================
set -e

CONTAINER_NAME="interview-api"

echo "=== ApplicationStop: Stopping backend container ==="

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Stopping container gracefully..."
    docker stop --time=30 $CONTAINER_NAME
    echo "Container stopped"
else
    echo "Container not running, skipping..."
fi

echo "=== ApplicationStop complete ==="
