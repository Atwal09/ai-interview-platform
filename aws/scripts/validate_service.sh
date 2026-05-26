#!/bin/bash
# =============================================================
# CodeDeploy: ValidateService
# Verify the backend is healthy after deployment
# =============================================================
set -e

echo "=== ValidateService: Health checking backend ==="

API_URL="http://localhost:5000/api/health"
MAX_RETRIES=10
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES..."
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
    
    if [ "$STATUS" = "200" ]; then
        echo "Health check passed! Status: $STATUS"
        echo "Backend is running successfully at $API_URL"
        echo "=== ValidateService complete ==="
        exit 0
    else
        echo "Health check returned: $STATUS. Retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    fi
done

echo "ERROR: Service validation failed after $MAX_RETRIES attempts!"
docker logs interview-api --tail=50
exit 1
