# System Architecture — AI Mock Interview Platform

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INTERNET                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────▼──────────────────┐
              │        AWS Route53              │
              │  workforme.space → CloudFront  │
              │  api.workforme.space → ALB      │
              └────────────┬──────────────────┘
                           │
         ┌─────────────────┼──────────────────────┐
         │                                         │
┌────────▼──────────┐              ┌───────────────▼──────────────┐
│  CloudFront CDN   │              │   Application Load Balancer   │
│  HTTP/3 + HTTPS   │              │   HTTPS + WAF + Rate Limit    │
│  Edge Caching     │              └───────────────┬──────────────┘
└────────┬──────────┘                              │
         │                                         │
┌────────▼──────────┐              ┌───────────────▼──────────────┐
│  S3 Bucket        │              │   EC2 Instance (Private)      │
│  React Static App │              │   t3.small / Amazon Linux 2023│
│  Versioned assets │              │   ┌──────────────────────┐   │
└───────────────────┘              │   │   Docker Container   │   │
                                   │   │   Node.js + Express  │   │
                                   │   │   Port 5000          │   │
                                   │   └──────────────────────┘   │
                                   └───────────────┬──────────────┘
                                                   │
                                   ┌───────────────▼──────────────┐
                                   │   AWS RDS PostgreSQL 16       │
                                   │   Private Subnet              │
                                   │   Encrypted + Multi-AZ ready  │
                                   └──────────────────────────────┘

External Services:
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ Google Gemini   │  │  Google OAuth 2.0 │  │  AWS SES            │
│ AI/ML API       │  │  Social Login     │  │  Transactional Email│
└─────────────────┘  └──────────────────┘  └─────────────────────┘
```

## 2. VPC Network Design

```
VPC: 10.0.0.0/16
├── Public Subnets (ALB, NAT Gateway)
│   ├── 10.0.1.0/24 (AZ-a)
│   └── 10.0.2.0/24 (AZ-b)
└── Private Subnets (EC2, RDS)
    ├── 10.0.11.0/24 (AZ-a) — EC2 + Docker
    └── 10.0.12.0/24 (AZ-b) — RDS Standby

Security Groups:
  ALB-SG:  Inbound 80/443 from 0.0.0.0/0
  EC2-SG:  Inbound 5000 from ALB-SG only
  RDS-SG:  Inbound 5432 from EC2-SG only
```

## 3. Request Flow

### Frontend Request Flow
```
User Browser
  → Route53 DNS (workforme.space)
  → CloudFront Edge Location (cached)
    → S3 Bucket (on cache miss)
      → React App served (HTML/CSS/JS)
        → Browser executes React app
          → API calls to api.workforme.space
```

### API Request Flow
```
React App
  → Route53 DNS (api.workforme.space)
  → Application Load Balancer (HTTPS termination)
  → EC2 Instance (Private Subnet)
    → Docker: Node.js Express App
      → JWT Middleware (auth check)
      → Controller
        → Model (SQL query via pg)
          → RDS PostgreSQL
        → AI Service (if needed)
          → Google Gemini API (external)
      → Response → Client
```

### WebSocket Flow (Real-time)
```
React App
  → CloudFront (WebSocket passthrough)
  → ALB (ws:// → wss://)
  → EC2 Docker: Socket.IO Server
    → JWT Authentication handshake
    → User joins personal room
    → Server emits events: notifications, analysis_complete
```

## 4. CI/CD Pipeline

```
Developer
  → git push origin main
  → GitHub Actions CI triggered
      ├── Backend Tests (Jest + PostgreSQL service container)
      ├── Frontend Build (Vite + type check)
      └── Docker Build Validation
  → All checks pass
  → GitHub Actions CD triggered
      ├── Frontend Deploy:
      │     Vite build → AWS S3 sync → CloudFront invalidation
      └── Backend Deploy:
            Docker build → ECR push
              → CodeDeploy triggered
                → EC2: BeforeInstall (Docker check)
                → EC2: AfterInstall (pull image, load secrets from SSM)
                → EC2: ApplicationStart (docker run new container)
                → EC2: ValidateService (health check)
  → Smoke Tests: curl workforme.space + api.workforme.space/api/health
```

## 5. Data Flow — Interview Session

```
User starts interview
  → POST /api/interviews
  → aiService.generateInterviewQuestions()
  → Gemini API: "Generate 10 medium difficulty software engineering questions"
  → Questions saved to PostgreSQL (questions table)
  → Questions returned to browser

User answers question (voice)
  → Browser: MediaRecorder API captures audio
  → Browser: Web Speech API transcribes to text (or sends audio to API)
  → POST /api/interviews/:id/respond { transcript, audio_url }
  → API: audio uploaded to S3
  → aiService.analyzeResponse(question, transcript)
  → Gemini API analyzes answer
  → speechService.analyzeTranscript(transcript)
  → Response saved to DB
  → Analysis returned immediately to browser
  → Socket.IO: "analysis:complete" event → notification created

User completes interview
  → POST /api/interviews/:id/complete
  → aiService.generateFeedback(allResponses)
  → Overall scores calculated
  → Interview marked complete in DB
  → User points updated (gamification)
  → Notification created + emitted via Socket.IO
```

## 6. AI Service Architecture

```
aiService.js
  ├── generateInterviewQuestions(type, domain, difficulty, count)
  │   ├── Build prompt: "You are an expert interviewer for {domain}..."
  │   ├── Call Gemini API: generateContent()
  │   ├── Parse JSON response
  │   └── Fallback: return domain-specific pre-written questions
  │
  ├── analyzeResponse(question, transcript, type)
  │   ├── Build analysis prompt with STAR framework context
  │   ├── Call Gemini API
  │   ├── Parse: score, strengths, improvements, keywords
  │   └── Fallback: keyword matching algorithm
  │
  ├── analyzeSpeech(transcript, audioMetrics)
  │   ├── speechService.analyzeTranscript() for base metrics
  │   ├── Call Gemini for tone/sentiment analysis
  │   └── Return combined analysis
  │
  ├── analyzeResume(pdfText, targetRole)
  │   ├── resumeService.calculateATSScore() for base score
  │   ├── Call Gemini for suggestions, missing skills, roadmap
  │   └── Return comprehensive analysis
  │
  └── generateChatResponse(message, context)
      ├── Build system prompt: "You are a career coach..."
      ├── Include last 10 messages as context
      └── Stream response from Gemini
```

## 7. Database Design Principles

- **UUID primary keys** — globally unique, no sequential ID attacks
- **Soft deletes** — `deleted_at` timestamp, data preserved
- **Timestamps** — `created_at`, `updated_at` on all tables
- **JSONB columns** — flexible AI output storage (suggestions, roadmap)
- **Indexes** — on all foreign keys, search columns, timestamps
- **PostgreSQL functions** — complex aggregations in DB, not app layer
- **Views** — safe read-only projections for API responses
- **Enums** — type safety at DB level

## 8. Security Architecture

```
Layer 1: Network
  - VPC private subnets for EC2 + RDS
  - Security groups as firewalls
  - No public RDS access
  - NAT Gateway for outbound only

Layer 2: Transport
  - TLS 1.3 everywhere
  - HSTS headers (31536000s)
  - CloudFront HTTPS-only policy

Layer 3: Application
  - Helmet.js security headers
  - CORS whitelist (workforme.space only)
  - Rate limiting per route type
  - express-validator input sanitization

Layer 4: Authentication
  - JWT (RS256, 7d TTL)
  - Refresh tokens (30d, rotated)
  - bcrypt cost factor 12
  - Google OAuth2 (no password stored)
  - Email verification before login

Layer 5: Data
  - Parameterized SQL queries (pg driver)
  - S3 private bucket (no public access)
  - Pre-signed URLs for file access
  - SSM SecureString for all secrets
  - RDS encryption at rest (AES-256)
```

## 9. Scalability Design

**Current (Startup Phase):**
- Single EC2 t3.small
- Single RDS db.t3.micro
- ~100 concurrent users

**Scale Phase 1:**
- EC2 Auto Scaling Group (2-4 instances)
- RDS Multi-AZ (automatic failover)
- ElastiCache Redis (session caching)
- ~1000 concurrent users

**Scale Phase 2:**
- ECS Fargate (containerized, serverless)
- RDS Aurora PostgreSQL (5x performance)
- CloudFront + Lambda@Edge
- ~10,000 concurrent users

**Scale Phase 3:**
- Kubernetes (EKS)
- Aurora Global Database
- Multi-region deployment
- ~100,000+ concurrent users
