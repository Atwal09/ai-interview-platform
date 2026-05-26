#!/bin/bash
# =============================================================
# CodeDeploy: AfterInstall
# Pull Docker image from ECR and prepare environment
# =============================================================
set -e

echo "=== AfterInstall: Pulling Docker image ==="

AWS_REGION="us-east-1"
APP_DIR="/home/ec2-user/app"
ECR_URI=$(aws ssm get-parameter --name "/interviewai/prod/ecr_repository_uri" --query Parameter.Value --output text)
IMAGE_TAG="latest"

# Login to ECR
echo "Authenticating with ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Pull latest image
echo "Pulling Docker image: $ECR_URI:$IMAGE_TAG"
docker pull $ECR_URI:$IMAGE_TAG

# Load environment variables from SSM Parameter Store
echo "Loading environment from SSM..."
cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=$(aws ssm get-parameter --name "/interviewai/prod/db_host" --with-decryption --query Parameter.Value --output text)
DB_PORT=5432
DB_NAME=$(aws ssm get-parameter --name "/interviewai/prod/db_name" --query Parameter.Value --output text)
DB_USER=$(aws ssm get-parameter --name "/interviewai/prod/db_user" --with-decryption --query Parameter.Value --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "/interviewai/prod/db_password" --with-decryption --query Parameter.Value --output text)
DB_SSL=true
JWT_SECRET=$(aws ssm get-parameter --name "/interviewai/prod/jwt_secret" --with-decryption --query Parameter.Value --output text)
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=$(aws ssm get-parameter --name "/interviewai/prod/jwt_refresh_secret" --with-decryption --query Parameter.Value --output text)
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=$(aws ssm get-parameter --name "/interviewai/prod/google_client_id" --with-decryption --query Parameter.Value --output text)
GOOGLE_CLIENT_SECRET=$(aws ssm get-parameter --name "/interviewai/prod/google_client_secret" --with-decryption --query Parameter.Value --output text)
GOOGLE_CALLBACK_URL=https://api.workforme.space/api/auth/google/callback
GEMINI_API_KEY=$(aws ssm get-parameter --name "/interviewai/prod/gemini_api_key" --with-decryption --query Parameter.Value --output text)
GEMINI_MODEL=gemini-1.5-flash
AWS_REGION=us-east-1
AWS_S3_BUCKET=$(aws ssm get-parameter --name "/interviewai/prod/s3_bucket_name" --query Parameter.Value --output text)
AWS_CLOUDFRONT_URL=https://cdn.workforme.space
FRONTEND_URL=https://workforme.space
EMAIL_FROM=noreply@workforme.space
REDIS_URL=$(aws ssm get-parameter --name "/interviewai/prod/redis_url" --with-decryption --query Parameter.Value --output text)
EOF

chmod 600 $APP_DIR/.env
echo "=== AfterInstall complete ==="
