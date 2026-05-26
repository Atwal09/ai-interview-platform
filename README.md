<div align="center">

# 🎯 InterviewAI — AI Mock Interview & Speech Analysis Platform

**Enterprise-grade, cloud-native SaaS platform for AI-powered interview preparation**

[![CI](https://github.com/yourusername/ai-interview-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/ai-interview-platform/actions/workflows/ci.yml)
[![Deploy](https://github.com/yourusername/ai-interview-platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/ai-interview-platform/actions/workflows/deploy.yml)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20.x-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![AWS](https://img.shields.io/badge/AWS-deployed-orange.svg)

🌐 **Live Demo:** [workforme.space](https://workforme.space)  
📚 **API Docs:** [api.workforme.space/api/docs](https://api.workforme.space/api/docs)

</div>

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Quick Start (Local Dev)](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [AWS Deployment](#aws-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Database Schema](#database-schema)
- [Security](#security)
- [Contributing](#contributing)

---

## 🔍 Overview

InterviewAI is a **production-ready, enterprise-grade AI SaaS platform** that helps candidates land their dream jobs through:

- **AI Mock Interviews** — Generate domain-specific questions using Google Gemini API
- **Speech Analysis** — Real-time filler word detection, pace analysis, confidence scoring
- **Resume ATS Scoring** — Upload PDF resumes and get instant ATS compatibility analysis  
- **Performance Dashboard** — Track progress over time with interactive charts
- **AI Career Roadmap** — Personalized improvement plans powered by Gemini AI
- **Gamification** — Streak tracking, achievements, and leaderboard

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 🤖 AI Mock Interviews | HR, Technical, Behavioral, Domain-specific | ✅ |
| 🎙️ Speech Analysis | Filler words, pace, confidence, grammar | ✅ |
| 📄 Resume ATS | PDF upload, keyword analysis, score | ✅ |
| 📊 Analytics Dashboard | Performance charts, trends, radar charts | ✅ |
| 💬 AI Chatbot | Context-aware career assistant | ✅ |
| 🔐 Auth System | JWT + Google OAuth + Email verification | ✅ |
| 🎮 Gamification | Achievements, streaks, leaderboard | ✅ |
| 🔔 Real-time Notifications | WebSocket via Socket.IO | ✅ |
| 👑 Admin Panel | User management, logs, analytics | ✅ |
| 🌙 Dark/Light Mode | System preference + manual toggle | ✅ |
| 📱 Responsive Design | Mobile-first, all screen sizes | ✅ |
| 📥 Downloadable Reports | PDF export of interview & resume reports | ✅ |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Redux Toolkit | 2.x | State management |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Data visualization |
| Axios | 1.x | HTTP client |
| Socket.IO Client | 4.x | Real-time |
| React Router | 6.x | Routing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 4.x | Web framework |
| PostgreSQL | 16.x | Database |
| Socket.IO | 4.x | WebSockets |
| Passport.js | 0.7.x | Auth strategies |
| JWT | 9.x | Token auth |
| Winston | 3.x | Logging |
| Multer | 1.x | File uploads |
| Nodemailer | 6.x | Email |

### AI & Cloud
| Service | Purpose |
|---|---|
| Google Gemini 1.5 Flash | Interview questions, speech/resume analysis, chatbot |
| AWS S3 | File storage (resumes, audio recordings) |
| AWS CloudFront | CDN for frontend |
| AWS EC2 | Backend hosting |
| AWS RDS PostgreSQL | Managed database |
| AWS CodePipeline | CI/CD orchestration |

### DevOps
| Tool | Purpose |
|---|---|
| Docker | Containerization |
| Nginx | Reverse proxy |
| GitHub Actions | CI/CD workflows |
| AWS CodeDeploy | Deployment automation |
| CloudWatch | Logging & monitoring |

---

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────┐
                    │         Route53 DNS                   │
                    │   workforme.space → CloudFront        │
                    │   api.workforme.space → ALB           │
                    └─────────────┬────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼──────────┐       │       ┌───────────▼──────────┐
    │   CloudFront CDN   │       │       │   Application ALB    │
    │   (HTTPS + HTTP/3) │       │       │   (HTTPS + WAF)      │
    └─────────┬──────────┘       │       └───────────┬──────────┘
              │                   │                   │
    ┌─────────▼──────────┐       │       ┌───────────▼──────────┐
    │   S3 Bucket        │       │       │   EC2 (Private)       │
    │   React Static App │       │       │   Docker Container    │
    └────────────────────┘       │       │   Node.js + Express  │
                                  │       └───────────┬──────────┘
    ┌─────────────────────────────────────────────────▼──────────┐
    │                    AWS VPC (10.0.0.0/16)                    │
    │  ┌──────────────────┐         ┌────────────────────────┐   │
    │  │  Private Subnet  │         │   Private Subnet        │   │
    │  │  EC2 Backend     │────────►│   RDS PostgreSQL 16     │   │
    │  │  (Docker)        │         │   (Encrypted + HA)      │   │
    │  └──────────────────┘         └────────────────────────┘   │
    └─────────────────────────────────────────────────────────────┘
    
    External Services:
    ┌────────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │  Google Gemini API │  │  Google OAuth   │  │  AWS SES Email   │
    │  (AI Features)     │  │  (Social Login) │  │  (Transactional) │
    └────────────────────┘  └─────────────────┘  └──────────────────┘
```

---

## 📁 Project Structure

```
ai-interview-platform/
├── 📁 frontend/                     # React Application
│   ├── 📁 src/
│   │   ├── 📁 components/           # Reusable UI components
│   │   │   ├── 📁 layout/           # Navbar, Sidebar, DashboardLayout
│   │   │   ├── 📁 ui/               # Button, Card, Modal, Input...
│   │   │   ├── 📁 charts/           # LineChart, RadarChart, BarChart
│   │   │   ├── 📁 interview/        # QuestionCard, WebcamFeed, MicButton
│   │   │   ├── 📁 resume/           # DropZone, ATSScoreCard
│   │   │   ├── 📁 notifications/    # NotificationPanel
│   │   │   └── 📁 chatbot/          # AIChatbot
│   │   ├── 📁 pages/                # Route-level pages
│   │   ├── 📁 store/                # Redux Toolkit slices
│   │   ├── 📁 services/             # Axios API calls
│   │   ├── 📁 hooks/                # Custom React hooks
│   │   └── 📁 utils/                # Helpers, constants
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── 📁 backend/                      # Node.js API
│   ├── 📁 src/
│   │   ├── 📁 config/               # DB, logger, passport, gemini, aws
│   │   ├── 📁 controllers/          # MVC controllers
│   │   ├── 📁 middleware/           # auth, errorHandler, rateLimiter, upload
│   │   ├── 📁 models/               # DB query models (raw SQL)
│   │   ├── 📁 routes/               # Express routers
│   │   ├── 📁 services/             # AI, email, storage, socket services
│   │   ├── 📁 validators/           # express-validator chains
│   │   └── 📁 utils/                # helpers, constants, errors
│   ├── Dockerfile
│   └── .env.example
│
├── 📁 database/
│   ├── schema.sql                   # Full PostgreSQL schema
│   ├── seed.sql                     # Development seed data
│   └── 📁 migrations/               # Versioned migrations
│
├── 📁 docker/
│   ├── docker-compose.yml           # Local dev environment
│   └── 📁 nginx/
│       ├── nginx.conf               # Main nginx config
│       └── 📁 conf.d/
│           └── api.conf             # Virtual host config
│
├── 📁 aws/
│   ├── buildspec-frontend.yml       # CodeBuild - Frontend
│   ├── buildspec-backend.yml        # CodeBuild - Backend
│   ├── appspec.yml                  # CodeDeploy config
│   ├── 📁 scripts/                  # Deploy lifecycle scripts
│   └── 📁 cloudformation/           # IaC templates
│       ├── vpc.yml                  # VPC + Security Groups
│       ├── ec2.yml                  # EC2 + ALB
│       ├── rds.yml                  # RDS PostgreSQL
│       └── s3-cloudfront.yml        # S3 + CloudFront
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── ci.yml                   # Continuous Integration
│       └── deploy.yml               # Continuous Deployment
│
├── 📁 docs/
│   ├── API.md                       # API Documentation
│   ├── ARCHITECTURE.md              # System Design
│   └── DEPLOYMENT.md                # AWS Deployment Guide
│
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-interview-platform.git
cd ai-interview-platform
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials:
# - GEMINI_API_KEY (get from https://aistudio.google.com/)
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# - JWT_SECRET (any random 32+ char string)
```

### 3. Start with Docker Compose (recommended)
```bash
# Start all services: PostgreSQL, Redis, Backend, Nginx
cd docker
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### 4. Run database migrations
```bash
docker exec -i interview_db psql -U postgres -d interview_platform < database/schema.sql
docker exec -i interview_db psql -U postgres -d interview_platform < database/seed.sql
```

### 5. Start frontend development server
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 6. Access the platform
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| API Health | http://localhost:5000/api/health |
| Demo Login | demo@workforme.space / Demo@123456 |
| Admin Login | admin@workforme.space / Admin@123456 |

---

## 🔐 Environment Variables

### Backend `.env`
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (AWS RDS or local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_platform
DB_USER=postgres
DB_PASSWORD=your-password
DB_SSL=false

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Gemini AI (https://aistudio.google.com/)
GEMINI_API_KEY=AIza...your-key
GEMINI_MODEL=gemini-1.5-flash

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=workforme-space-uploads
```

### Frontend `.env` (Vite)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=ws://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_APP_NAME=InterviewAI
```

---

## 📡 API Documentation

### Base URL
```
Production: https://api.workforme.space/api
Development: http://localhost:5000/api
```

### Authentication
All protected endpoints require Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login + get JWT |
| GET | `/auth/google` | ❌ | Google OAuth |
| GET | `/auth/me` | ✅ | Get current user |
| POST | `/interviews` | ✅ | Create interview |
| GET | `/interviews` | ✅ | List my interviews |
| POST | `/interviews/:id/respond` | ✅ | Submit answer |
| POST | `/resume/upload` | ✅ | Upload & analyze resume |
| GET | `/dashboard/stats` | ✅ | Get dashboard stats |
| GET | `/dashboard/leaderboard` | ✅ | Get leaderboard |
| POST | `/chat` | ✅ | AI chatbot message |
| GET | `/admin/users` | 👑 | Admin: List users |

See [docs/API.md](docs/API.md) for full documentation.

---

## ☁️ AWS Deployment

### Step 1: Deploy VPC Infrastructure
```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/vpc.yml \
  --stack-name interviewai-vpc \
  --capabilities CAPABILITY_IAM
```

### Step 2: Deploy RDS PostgreSQL
```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/rds.yml \
  --stack-name interviewai-rds \
  --parameter-overrides \
    DBPassword=YourSecurePassword16Chars \
  --capabilities CAPABILITY_IAM
```

### Step 3: Deploy S3 + CloudFront
```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/s3-cloudfront.yml \
  --stack-name interviewai-frontend \
  --parameter-overrides \
    ACMCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/ID
```

### Step 4: Deploy EC2 + ALB
```bash
aws cloudformation deploy \
  --template-file aws/cloudformation/ec2.yml \
  --stack-name interviewai-backend \
  --parameter-overrides \
    KeyPairName=your-key-pair \
    ACMCertificateArn=arn:aws:acm:us-east-1:ACCOUNT:certificate/ID \
  --capabilities CAPABILITY_IAM
```

### Step 5: Configure SSM Parameters
```bash
# Add all secrets to SSM Parameter Store
aws ssm put-parameter --name "/interviewai/prod/gemini_api_key" --value "AIza..." --type SecureString
aws ssm put-parameter --name "/interviewai/prod/jwt_secret" --value "your-secret" --type SecureString
# ... (see docs/DEPLOYMENT.md for full list)
```

### Step 6: Configure Route53
```bash
# Create A records in Route53:
# workforme.space → CloudFront distribution domain
# api.workforme.space → ALB DNS name
```

### Step 7: Push to deploy
```bash
git push origin main
# → GitHub Actions triggers CI/CD
# → Frontend builds and uploads to S3
# → Backend Docker image pushed to ECR
# → CodeDeploy rolls out to EC2
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the complete step-by-step guide.

---

## 🔄 CI/CD Pipeline

```
Git Push → GitHub Actions CI
     ↓
  ┌──────────────────────────────────┐
  │  Parallel Jobs:                   │
  │  ├── Backend: ESLint + Jest tests │
  │  ├── Frontend: ESLint + Vite build│
  │  └── Docker: Build validation     │
  └──────────────────────────────────┘
     ↓ (on main branch merge)
GitHub Actions CD
  ├── Frontend → S3 sync + CloudFront invalidation
  └── Backend → ECR push + CodeDeploy to EC2
     ↓
  Smoke Tests (health checks)
```

---

## 🗄️ Database Schema

11 tables with full relationships:

```
users ──────────────────────────────────┐
  ├── interviews (1:N)                   │
  │     ├── questions (1:N)              │
  │     └── responses (1:N) ────────────┤
  ├── speech_analysis (1:N)             │
  ├── resume_uploads (1:N)              │
  │     └── resume_scores (1:1)         │
  ├── ai_feedback (1:N)                 │
  ├── notifications (1:N)               │
  ├── chat_history (1:N)                │
  ├── user_achievements (N:M)           │
  └── reports (1:N)                     │
                                        │
admin_logs ─────────────────────────────┘
  └── api_usage (logging table)
```

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| Transport | HTTPS/TLS 1.3, HSTS |
| Auth | JWT (7d access + 30d refresh), bcrypt cost=12 |
| API | Helmet.js headers, CORS whitelist, rate limiting |
| Database | SSL connections, parameterized queries (no ORM injection) |
| Files | S3 private bucket, pre-signed URLs |
| Secrets | AWS SSM Parameter Store (SecureString) |
| EC2 | Private subnet, SSM Session Manager (no SSH exposed) |
| Validation | express-validator on all inputs |

---

## 🤖 AI Integration (Google Gemini)

The platform uses **Google Gemini 1.5 Flash** for:

1. **Interview Question Generation** — Contextual questions by domain & difficulty
2. **Response Analysis** — Score answers, identify strengths/weaknesses
3. **Speech Analysis** — Analyze transcript for communication quality
4. **Resume Analysis** — ATS scoring, keyword gaps, formatting review
5. **AI Chatbot** — Career guidance assistant with conversation history
6. **Career Roadmap** — Personalized improvement plans

**Fallback Strategy:** All AI functions include graceful fallbacks that return rule-based analysis when the API is unavailable, ensuring the app works at all times.

**Getting Your Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env` as `GEMINI_API_KEY`

---

## 📊 Performance

| Metric | Value |
|---|---|
| Lighthouse Score | 95+ |
| First Contentful Paint | < 1.2s |
| Time to Interactive | < 2.5s |
| API Response Time (p95) | < 200ms |
| AI Generation Time | 1-3s |

---

## 🏆 Why This Project Is Resume-Worthy

1. **Real Cloud Architecture** — Multi-tier AWS deployment (S3 + CloudFront + EC2 + RDS)
2. **Production CI/CD** — GitHub Actions + CodePipeline + CodeDeploy
3. **Infrastructure as Code** — CloudFormation templates for full stack
4. **AI Integration** — Real Google Gemini API with production-grade prompt engineering
5. **Security** — JWT, OAuth, bcrypt, Helmet, rate limiting, SSL
6. **Scalability** — Dockerized, stateless API, RDS managed DB, CDN
7. **Real-time** — Socket.IO WebSockets for live notifications
8. **Clean Code** — MVC, custom hooks, Redux patterns, clean folder structure

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

<div align="center">
Built with ❤️ using React, Node.js, and Google Gemini AI
<br>
Deployed on AWS | Domain: workforme.space
</div>
