#!/bin/bash
# =============================================================
# CodeDeploy: BeforeInstall
# Prepare the EC2 instance for new deployment
# =============================================================
set -e

echo "=== BeforeInstall: Preparing EC2 instance ==="

# Update system packages
yum update -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    yum install -y docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user
    echo "Docker installed successfully"
else
    echo "Docker already installed: $(docker --version)"
fi

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    ./aws/install
    rm -rf awscliv2.zip aws/
fi

# Ensure app directory exists
mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app

# Create log directory
mkdir -p /var/log/interviewai
chown ec2-user:ec2-user /var/log/interviewai

echo "=== BeforeInstall complete ==="
