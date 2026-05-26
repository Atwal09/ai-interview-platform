# API Documentation — InterviewAI Platform
# Base URL: https://api.workforme.space/api

---

## Authentication

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "candidate"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "candidate",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "role": "candidate" },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### GET /auth/google
Redirect to Google OAuth consent screen.

### GET /auth/google/callback
Google OAuth callback. Redirects to frontend with token in query param.

---

### POST /auth/refresh
Get new access token using refresh token.

**Request Body:**
```json
{ "refreshToken": "eyJ..." }
```

---

### POST /auth/forgot-password
Send password reset email.

**Request Body:**
```json
{ "email": "john@example.com" }
```

---

### POST /auth/reset-password
Reset password with token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123"
}
```

---

### GET /auth/me
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "candidate",
    "avatarUrl": "https://cdn.workforme.space/avatars/uuid.jpg",
    "targetRole": "Software Engineer",
    "experienceLevel": "mid",
    "streakDays": 7,
    "totalPoints": 1500
  }
}
```

---

## Interviews

### POST /interviews
Create a new interview session and generate AI questions.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Software Engineering Technical Round",
  "type": "technical",
  "domain": "software_engineering",
  "difficulty": "medium",
  "questionCount": 10,
  "durationMinutes": 30
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "interview": {
      "id": "uuid",
      "title": "Software Engineering Technical Round",
      "type": "technical",
      "status": "in_progress",
      "questions": [
        {
          "id": "uuid",
          "sequenceNumber": 1,
          "questionText": "Explain the SOLID principles in OOP...",
          "questionType": "technical",
          "difficulty": "medium",
          "timeLimitSeconds": 120
        }
      ]
    }
  }
}
```

---

### GET /interviews
List user's interview sessions (paginated).

**Query Params:** `page=1&limit=10&status=completed&type=technical`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "interviews": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### GET /interviews/:id
Get single interview with all questions and responses.

---

### POST /interviews/:id/respond
Submit an answer to a question.

**Request Body:**
```json
{
  "questionId": "uuid",
  "transcript": "I believe the SOLID principles are...",
  "responseAudioUrl": "https://s3.amazonaws.com/...",
  "responseDurationSeconds": 87
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "responseScore": 78.5,
      "strengths": ["Good structure", "Used concrete examples"],
      "improvements": ["Could mention more use cases", "Expand on Liskov Substitution"],
      "keywordsMatched": ["Single Responsibility", "Open Closed"],
      "keywordsMissing": ["Dependency Inversion"],
      "aiFeedback": "Strong understanding demonstrated..."
    }
  }
}
```

---

### POST /interviews/:id/complete
Mark interview as complete and generate overall AI feedback.

---

### DELETE /interviews/:id
Soft delete an interview session.

---

## Speech Analysis

### POST /speech/analyze
Analyze audio transcript for speech metrics.

**Content-Type:** `multipart/form-data`

**Fields:**
- `audio` (file): Audio recording
- `transcript` (string): Text transcript
- `interviewId` (string, optional): Link to interview

**Response 200:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "wordCount": 245,
      "speakingPaceWpm": 142,
      "fillerWordCount": 8,
      "fillerWords": { "um": 3, "uh": 2, "like": 3 },
      "pauseCount": 12,
      "repeatedWords": { "basically": 3 },
      "scores": {
        "clarity": 82,
        "confidence": 74,
        "fluency": 79,
        "grammar": 88,
        "overall": 80.75
      },
      "toneAnalysis": { "tone": "professional", "sentiment": "positive" },
      "improvementAreas": ["Reduce filler words", "Increase speaking confidence"],
      "positiveAspects": ["Good pace", "Clear articulation"]
    }
  }
}
```

---

## Resume

### POST /resume/upload
Upload and analyze a PDF resume.

**Content-Type:** `multipart/form-data`

**Fields:**
- `resume` (file): PDF file (max 10MB)
- `targetRole` (string, optional): Target job role

**Response 201:**
```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "uuid",
      "fileName": "john_doe_resume.pdf",
      "status": "analyzed",
      "scores": {
        "overallAtsScore": 73.5,
        "keywordScore": 68.0,
        "formattingScore": 85.0,
        "grammarScore": 92.0,
        "readabilityScore": 78.5,
        "completenessScore": 70.0
      },
      "sections": {
        "hasContactInfo": true,
        "hasSummary": false,
        "hasExperience": true,
        "hasEducation": true,
        "hasSkills": true,
        "hasProjects": true,
        "hasCertifications": false
      },
      "matchedKeywords": ["React", "Node.js", "PostgreSQL", "Docker"],
      "missingKeywords": ["Kubernetes", "CI/CD", "TypeScript", "AWS"],
      "suggestions": [
        { "priority": "high", "area": "Summary", "suggestion": "Add a professional summary highlighting your key achievements" },
        { "priority": "high", "area": "Keywords", "suggestion": "Add AWS, Docker, and CI/CD mentions to improve ATS score" },
        { "priority": "medium", "area": "Metrics", "suggestion": "Quantify achievements: 'Improved performance by 40%' vs 'Improved performance'" }
      ]
    }
  }
}
```

---

### GET /resume
List user's uploaded resumes.

---

### GET /resume/:id
Get single resume with full analysis.

---

### DELETE /resume/:id
Delete a resume.

---

## Dashboard

### GET /dashboard/stats
Get user's overall performance statistics.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalInterviews": 24,
    "completedInterviews": 20,
    "avgOverallScore": 76.8,
    "avgCommunicationScore": 80.2,
    "avgConfidenceScore": 72.5,
    "bestScore": 94.0,
    "totalPracticeHours": 8.5,
    "currentStreak": 7,
    "totalPoints": 2850
  }
}
```

---

### GET /dashboard/performance-chart
Get score over time (last 30 days).

**Query Params:** `days=30`

---

### GET /dashboard/leaderboard
Get top 10 users by total points.

---

### GET /dashboard/recommendations
Get AI-generated personalized recommendations.

---

## Admin (role: admin only)

### GET /admin/stats
Platform-wide statistics.

### GET /admin/users
Paginated user list with search/filter.

**Query Params:** `page=1&limit=20&search=john&role=candidate&status=active`

### PATCH /admin/users/:id
Update user role or status.

### DELETE /admin/users/:id
Soft delete a user.

### GET /admin/logs
Admin action logs.

### GET /admin/api-usage
API and AI usage statistics.

---

## Notifications

### GET /notifications
Get user's notifications (paginated).

### PATCH /notifications/:id/read
Mark notification as read.

### PATCH /notifications/read-all
Mark all notifications as read.

---

## Chat (AI Assistant)

### POST /chat
Send a message to the AI career assistant.

**Request Body:**
```json
{ "message": "How can I improve my system design skills?" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "response": "Great question! To improve system design skills, I recommend..."
  }
}
```

### GET /chat/history
Get chat history for current user.

---

## Health Check

### GET /health
Public health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T16:00:00Z",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected",
  "uptime": 86400
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

| Status Code | Meaning |
|---|---|
| 400 | Bad Request — invalid data |
| 401 | Unauthorized — missing/invalid JWT |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 409 | Conflict — duplicate resource |
| 422 | Unprocessable Entity — validation errors |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

| Endpoint Group | Limit |
|---|---|
| Auth endpoints | 10 requests / 15 min |
| AI endpoints | 20 requests / hour |
| File uploads | 5 requests / hour |
| General API | 100 requests / 15 min |
