#!/bin/bash
# =============================================================
# CodeDeploy: ApplicationStart
# Start the Docker container with the new image
# =============================================================
set -e

echo "=== ApplicationStart: Starting backend container ==="

APP_DIR="/home/ec2-user/app"
ECR_URI=$(aws ssm get-parameter --name "/interviewai/prod/ecr_repository_uri" --query Parameter.Value --output text)
CONTAINER_NAME="interview-api"

# Stop and remove old container if running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Start new container
echo "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    --env-file $APP_DIR/.env \
    -p 5000:5000 \
    --log-driver awslogs \
    --log-opt awslogs-region=us-east-1 \
    --log-opt awslogs-group=/interviewai/backend \
    --log-opt awslogs-stream=$(hostname) \
    --health-cmd="wget -qO- http://localhost:5000/api/health || exit 1" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    $ECR_URI:latest

echo "Container started. Waiting for health check..."
sleep 15

# Check container is running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Container is running successfully"
    docker ps | grep $CONTAINER_NAME
else
    echo "ERROR: Container failed to start!"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Clean up old Docker images
echo "Cleaning up old images..."
docker image prune -f --filter "until=24h"

echo "=== ApplicationStart complete ==="
