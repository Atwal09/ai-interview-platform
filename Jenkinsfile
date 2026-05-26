pipeline {
  agent any

  environment {
    AWS_REGION      = "ap-south-1"
    ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    FRONTEND_REPO   = "ai-interview-frontend"
    BACKEND_REPO    = "ai-interview-backend"
    IMAGE_TAG       = "${BUILD_NUMBER}"
    EKS_CLUSTER     = "interviewai-cluster"
    K8S_NAMESPACE   = "interviewai"
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Atwal09/ai-interview-platform.git'
        echo "✅ Code checked out — Build #${BUILD_NUMBER}"
      }
    }

    stage('Set AWS Account ID') {
      steps {
        script {
          env.AWS_ACCOUNT_ID = sh(
            script: "aws sts get-caller-identity --query Account --output text",
            returnStdout: true
          ).trim()
          env.ECR_REGISTRY = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
          echo "✅ AWS Account: ${env.AWS_ACCOUNT_ID}"
        }
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION \
            | docker login --username AWS --password-stdin $ECR_REGISTRY
          echo "✅ ECR Login successful"
        '''
      }
    }

    stage('Build Docker Images') {
      parallel {
        stage('Build Frontend') {
          steps {
            sh '''
              docker build \
                --build-arg VITE_API_URL=http://backend-service:5000 \
                -t $FRONTEND_REPO:$IMAGE_TAG \
                -f frontend/Dockerfile.prod \
                ./frontend
              echo "✅ Frontend image built"
            '''
          }
        }
        stage('Build Backend') {
          steps {
            sh '''
              docker build \
                -t $BACKEND_REPO:$IMAGE_TAG \
                ./backend
              echo "✅ Backend image built"
            '''
          }
        }
      }
    }

    stage('Tag & Push to ECR') {
      steps {
        sh '''
          # Frontend
          docker tag $FRONTEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$FRONTEND_REPO:$IMAGE_TAG
          docker tag $FRONTEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$FRONTEND_REPO:latest
          docker push $ECR_REGISTRY/$FRONTEND_REPO:$IMAGE_TAG
          docker push $ECR_REGISTRY/$FRONTEND_REPO:latest

          # Backend
          docker tag $BACKEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$BACKEND_REPO:$IMAGE_TAG
          docker tag $BACKEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$BACKEND_REPO:latest
          docker push $ECR_REGISTRY/$BACKEND_REPO:$IMAGE_TAG
          docker push $ECR_REGISTRY/$BACKEND_REPO:latest

          echo "✅ Images pushed to ECR"
        '''
      }
    }

    stage('Update kubeconfig') {
      steps {
        sh '''
          aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER
          kubectl get nodes
          echo "✅ Connected to EKS cluster"
        '''
      }
    }

    stage('Create Namespace & Secrets') {
      steps {
        sh '''
          kubectl apply -f k8s/namespace.yml

          # Create backend secrets (skip if already exists)
          kubectl apply -f k8s/backend-secret.yml --namespace=$K8S_NAMESPACE || true

          echo "✅ Namespace and secrets ready"
        '''
      }
    }

    stage('Deploy to EKS') {
      steps {
        sh '''
          # Replace image placeholders with real ECR image tags
          sed -i "s|ECR_FRONTEND_IMAGE|$ECR_REGISTRY/$FRONTEND_REPO:$IMAGE_TAG|g" k8s/frontend-deployment.yml
          sed -i "s|ECR_BACKEND_IMAGE|$ECR_REGISTRY/$BACKEND_REPO:$IMAGE_TAG|g"   k8s/backend-deployment.yml

          # Apply all manifests
          kubectl apply -f k8s/namespace.yml
          kubectl apply -f k8s/backend-deployment.yml  --namespace=$K8S_NAMESPACE
          kubectl apply -f k8s/backend-service.yml     --namespace=$K8S_NAMESPACE
          kubectl apply -f k8s/frontend-deployment.yml --namespace=$K8S_NAMESPACE
          kubectl apply -f k8s/frontend-service.yml    --namespace=$K8S_NAMESPACE

          echo "✅ Deployments applied"
        '''
      }
    }

    stage('Wait for Rollout') {
      steps {
        sh '''
          kubectl rollout status deployment/backend  --namespace=$K8S_NAMESPACE --timeout=120s
          kubectl rollout status deployment/frontend --namespace=$K8S_NAMESPACE --timeout=120s
          echo "✅ Rollout complete"
        '''
      }
    }

    stage('Get Load Balancer URL') {
      steps {
        sh '''
          sleep 15
          echo "🌐 Frontend URL:"
          kubectl get svc frontend-service --namespace=$K8S_NAMESPACE \
            -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
          echo ""
        '''
      }
    }

    stage('Clean Up Old Docker Images') {
      steps {
        sh '''
          docker image prune -f
          echo "✅ Local images cleaned"
        '''
      }
    }
  }

  post {
    success {
      echo "🎉 Deployment #${BUILD_NUMBER} succeeded!"
    }
    failure {
      echo "❌ Deployment #${BUILD_NUMBER} failed — check logs above"
    }
  }
}
