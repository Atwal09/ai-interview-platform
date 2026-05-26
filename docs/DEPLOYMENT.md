# AWS Production Deployment Guide
# AI Mock Interview Platform — workforme.space

## Prerequisites

- AWS Account with admin access
- AWS CLI configured: `aws configure`
- Domain: workforme.space (in Route53 or any registrar)
- GitHub repository with the project code

---

## Step 1: Request SSL Certificate (ACM)

```bash
# Request cert for both root and www + api subdomain
aws acm request-certificate \
  --domain-name workforme.space \
  --subject-alternative-names www.workforme.space api.workforme.space \
  --validation-method DNS \
  --region us-east-1  # MUST be us-east-1 for CloudFront

# Get certificate ARN (save this for later)
aws acm list-certificates --region us-east-1
```

Add the CNAME validation records to Route53 (or your DNS provider).
Wait for status to become `ISSUED` (~2-5 minutes with Route53).

---

## Step 2: Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name interviewai-backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 \
  --region us-east-1

# Note the repositoryUri
```

---

## Step 3: Deploy VPC Stack

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/vpc.yml \
  --stack-name interviewai-vpc \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM

# Check outputs
aws cloudformation describe-stacks \
  --stack-name interviewai-vpc \
  --query 'Stacks[0].Outputs'
```

---

## Step 4: Deploy RDS PostgreSQL

```bash
# Generate a strong password
DB_PASSWORD=$(openssl rand -base64 20)
echo "DB Password: $DB_PASSWORD"  # Save this!

aws cloudformation deploy \
  --template-file aws/cloudformation/rds.yml \
  --stack-name interviewai-rds \
  --region us-east-1 \
  --parameter-overrides \
    VpcStackName=interviewai-vpc \
    DBPassword=$DB_PASSWORD \
    DBInstanceClass=db.t3.micro

# Get DB endpoint
aws cloudformation describe-stacks \
  --stack-name interviewai-rds \
  --query 'Stacks[0].Outputs[?OutputKey==`DBEndpoint`].OutputValue' \
  --output text
```

---

## Step 5: Deploy S3 + CloudFront

```bash
# Replace with your ACM certificate ARN
CERT_ARN="arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID"

aws cloudformation deploy \
  --template-file aws/cloudformation/s3-cloudfront.yml \
  --stack-name interviewai-frontend \
  --region us-east-1 \
  --parameter-overrides \
    DomainName=workforme.space \
    ACMCertificateArn=$CERT_ARN

# Get CloudFront distribution domain (for Route53)
aws cloudformation describe-stacks \
  --stack-name interviewai-frontend \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text
```

---

## Step 6: Deploy EC2 + ALB

```bash
# Create EC2 Key Pair (or use existing)
aws ec2 create-key-pair \
  --key-name interviewai-keypair \
  --query 'KeyMaterial' \
  --output text > interviewai-keypair.pem
chmod 400 interviewai-keypair.pem

aws cloudformation deploy \
  --template-file aws/cloudformation/ec2.yml \
  --stack-name interviewai-backend \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    VpcStackName=interviewai-vpc \
    KeyPairName=interviewai-keypair \
    ACMCertificateArn=$CERT_ARN \
    InstanceType=t3.small

# Get ALB DNS name (for Route53)
aws cloudformation describe-stacks \
  --stack-name interviewai-backend \
  --query 'Stacks[0].Outputs[?OutputKey==`ALBDnsName`].OutputValue' \
  --output text
```

---

## Step 7: Initialize RDS Database

```bash
# Get EC2 instance ID and use SSM to run commands
EC2_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=interviewai-backend" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

DB_HOST=$(aws cloudformation describe-stacks \
  --stack-name interviewai-rds \
  --query 'Stacks[0].Outputs[?OutputKey==`DBEndpoint`].OutputValue' \
  --output text)

# Upload schema to S3
aws s3 cp database/schema.sql s3://workforme.space-uploads/setup/schema.sql
aws s3 cp database/seed.sql s3://workforme.space-uploads/setup/seed.sql

# Run schema via SSM
aws ssm send-command \
  --instance-ids $EC2_ID \
  --document-name "AWS-RunShellScript" \
  --parameters commands=[
    "aws s3 cp s3://workforme.space-uploads/setup/schema.sql /tmp/schema.sql",
    "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U interviewai_admin -d interview_platform -f /tmp/schema.sql",
    "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U interviewai_admin -d interview_platform -f /tmp/seed.sql"
  ]
```

---

## Step 8: Store Secrets in SSM Parameter Store

```bash
# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH=$(openssl rand -base64 64 | tr -d '\n')

# Store all secrets
aws ssm put-parameter --name "/interviewai/prod/db_host" \
  --value "YOUR_RDS_ENDPOINT" --type String

aws ssm put-parameter --name "/interviewai/prod/db_name" \
  --value "interview_platform" --type String

aws ssm put-parameter --name "/interviewai/prod/db_user" \
  --value "interviewai_admin" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/db_password" \
  --value "YOUR_DB_PASSWORD" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/jwt_secret" \
  --value "$JWT_SECRET" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/jwt_refresh_secret" \
  --value "$JWT_REFRESH" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/gemini_api_key" \
  --value "AIza...YOUR_KEY" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/google_client_id" \
  --value "YOUR_CLIENT_ID.apps.googleusercontent.com" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/google_client_secret" \
  --value "YOUR_CLIENT_SECRET" --type SecureString

aws ssm put-parameter --name "/interviewai/prod/ecr_repository_uri" \
  --value "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/interviewai-backend" --type String

aws ssm put-parameter --name "/interviewai/prod/s3_bucket_name" \
  --value "workforme.space-frontend" --type String

aws ssm put-parameter --name "/interviewai/prod/cloudfront_distribution_id" \
  --value "EXXXXXXXXXX" --type String

aws ssm put-parameter --name "/interviewai/prod/api_url" \
  --value "https://api.workforme.space" --type String
```

---

## Step 9: Configure Route53

```bash
# Get your hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones \
  --query 'HostedZones[?Name==`workforme.space.`].Id' \
  --output text | sed 's|/hostedzone/||')

# CloudFront domain (from Step 5)
CF_DOMAIN="d1234abcdef.cloudfront.net"

# ALB domain (from Step 6)
ALB_DOMAIN="interviewai-alb-1234567.us-east-1.elb.amazonaws.com"

# Create Route53 records
cat > /tmp/route53-changes.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "workforme.space",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.workforme.space",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CF_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.workforme.space",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "ZHURV8PSTC4K8",
          "DNSName": "$ALB_DOMAIN",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file:///tmp/route53-changes.json
```

---

## Step 10: Set Up CodePipeline

```bash
# Create S3 bucket for CodePipeline artifacts
aws s3 mb s3://interviewai-codepipeline-artifacts --region us-east-1

# Create CodePipeline (via console recommended, or use CloudFormation)
# The CI/CD is also handled by GitHub Actions (see .github/workflows/)
```

---

## Step 11: Configure GitHub Secrets

In your GitHub repository, add these secrets:
(Settings → Secrets and variables → Actions)

```
AWS_ACCESS_KEY_ID         = (IAM user with limited permissions)
AWS_SECRET_ACCESS_KEY     = (IAM user secret)
S3_BUCKET                 = workforme.space-frontend
CLOUDFRONT_DISTRIBUTION_ID= EXXXXXXXXXX
GOOGLE_CLIENT_ID          = YOUR_CLIENT_ID
GEMINI_API_KEY            = AIza...YOUR_KEY
CODEDEPLOY_S3_BUCKET      = interviewai-codepipeline-artifacts
```

---

## Step 12: Deploy!

```bash
git push origin main
# → GitHub Actions CI runs tests
# → On success, GitHub Actions CD deploys:
#   - Frontend → S3 → CloudFront invalidation
#   - Backend → ECR → CodeDeploy → EC2
```

---

## Monitoring & Troubleshooting

### CloudWatch Logs
```bash
# View backend logs
aws logs get-log-events \
  --log-group-name /interviewai/backend \
  --log-stream-name $(hostname)

# View CloudFront access logs
aws s3 ls s3://workforme.space-logs/cloudfront/
```

### Check EC2 container
```bash
# Use SSM (no SSH needed)
aws ssm start-session --target $EC2_ID

# On the instance:
docker logs interview-api --tail=100 -f
docker stats interview-api
```

### Health Check
```bash
curl https://api.workforme.space/api/health
```

---

## Cost Estimate (Monthly)

| Service | Tier | Est. Cost |
|---|---|---|
| EC2 t3.small | 1 instance | ~$15 |
| RDS db.t3.micro | PostgreSQL 16 | ~$15 |
| S3 | 10GB | ~$0.23 |
| CloudFront | 50GB transfer | ~$4 |
| NAT Gateway | 1 | ~$32 |
| Route53 | Hosted zone | ~$0.50 |
| **Total** | | **~$67/month** |

> Tip: Use AWS Free Tier for development (t2.micro EC2, db.t3.micro RDS)
