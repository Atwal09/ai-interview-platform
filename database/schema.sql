-- =============================================================
-- AI Mock Interview & Speech Analysis Platform
-- PostgreSQL Database Schema
-- Domain: workforme.space
-- Version: 1.0.0
-- =============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- For composite indexes

-- =============================================================
-- ENUMS
-- =============================================================

CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned', 'pending_verification');
CREATE TYPE interview_type AS ENUM ('hr', 'technical', 'behavioral', 'domain_specific', 'mixed');
CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'abandoned');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('behavioral', 'technical', 'situational', 'competency', 'case_study');
CREATE TYPE resume_status AS ENUM ('processing', 'analyzed', 'failed');
CREATE TYPE notification_type AS ENUM ('interview_complete', 'resume_analyzed', 'achievement', 'system', 'reminder', 'feedback_ready');
CREATE TYPE log_action AS ENUM ('user_created', 'user_updated', 'user_banned', 'user_deleted', 'interview_deleted', 'resume_deleted', 'settings_changed', 'api_key_rotated', 'report_generated', 'login_attempt');
CREATE TYPE report_type AS ENUM ('interview', 'resume', 'performance', 'usage', 'custom');

-- =============================================================
-- TABLE: users
-- =============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),                          -- NULL for OAuth-only users
    role            user_role NOT NULL DEFAULT 'candidate',
    status          user_status NOT NULL DEFAULT 'pending_verification',
    avatar_url      TEXT,
    google_id       VARCHAR(255) UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token      VARCHAR(255),
    verification_token_exp  TIMESTAMPTZ,
    reset_token             VARCHAR(255),
    reset_token_exp         TIMESTAMPTZ,
    refresh_token           TEXT,
    target_role     VARCHAR(100),                          -- e.g. "Software Engineer at FAANG"
    experience_level VARCHAR(50),                          -- junior, mid, senior
    preferred_domain VARCHAR(100),
    streak_days     INTEGER NOT NULL DEFAULT 0,
    last_active_at  TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    total_points    INTEGER NOT NULL DEFAULT 0,            -- gamification
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                            -- soft delete
);

-- Indexes for users
CREATE INDEX idx_users_email          ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_google_id      ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_status         ON users(status);
CREATE INDEX idx_users_created_at     ON users(created_at DESC);
CREATE INDEX idx_users_total_points   ON users(total_points DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_name_trgm      ON users USING GIN (name gin_trgm_ops);

-- =============================================================
-- TABLE: interviews
-- =============================================================

CREATE TABLE interviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    type            interview_type NOT NULL,
    domain          VARCHAR(100),                          -- e.g. software_engineering, data_science
    difficulty      difficulty_level NOT NULL DEFAULT 'medium',
    status          interview_status NOT NULL DEFAULT 'scheduled',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    actual_duration_seconds INTEGER,                       -- actual time taken
    question_count  INTEGER NOT NULL DEFAULT 10,
    overall_score   DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
    communication_score DECIMAL(5,2),
    confidence_score    DECIMAL(5,2),
    technical_score     DECIMAL(5,2),
    session_recording_url TEXT,                            -- S3 URL
    notes           TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- Indexes for interviews
CREATE INDEX idx_interviews_user_id   ON interviews(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_interviews_status    ON interviews(status);
CREATE INDEX idx_interviews_type      ON interviews(type);
CREATE INDEX idx_interviews_created   ON interviews(created_at DESC);
CREATE INDEX idx_interviews_score     ON interviews(overall_score DESC) WHERE overall_score IS NOT NULL;

-- =============================================================
-- TABLE: questions
-- =============================================================

CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id    UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    question_text   TEXT NOT NULL,
    question_type   question_type NOT NULL,
    difficulty      difficulty_level NOT NULL DEFAULT 'medium',
    domain          VARCHAR(100),
    expected_keywords TEXT[],                              -- Array of keywords for scoring
    ideal_answer    TEXT,                                  -- AI-generated ideal answer
    time_limit_seconds INTEGER DEFAULT 120,
    ai_generated    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_interview_sequence UNIQUE (interview_id, sequence_number)
);

-- Indexes for questions
CREATE INDEX idx_questions_interview  ON questions(interview_id);
CREATE INDEX idx_questions_type       ON questions(question_type);

-- =============================================================
-- TABLE: responses
-- =============================================================

CREATE TABLE responses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id    UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transcript      TEXT,                                  -- Transcribed audio
    audio_url       TEXT,                                  -- S3 URL of recording
    video_url       TEXT,                                  -- S3 URL of video segment
    response_duration_seconds INTEGER,
    response_score  DECIMAL(5,2),
    strengths       TEXT[],
    improvements    TEXT[],
    keywords_matched TEXT[],
    keywords_missing TEXT[],
    ai_feedback     TEXT,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for responses
CREATE INDEX idx_responses_interview  ON responses(interview_id);
CREATE INDEX idx_responses_question   ON responses(question_id);
CREATE INDEX idx_responses_user_id    ON responses(user_id);

-- =============================================================
-- TABLE: speech_analysis
-- =============================================================

CREATE TABLE speech_analysis (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interview_id        UUID REFERENCES interviews(id) ON DELETE SET NULL,
    response_id         UUID REFERENCES responses(id) ON DELETE SET NULL,
    transcript          TEXT NOT NULL,
    -- Speech metrics
    word_count          INTEGER,
    speaking_pace_wpm   INTEGER,                          -- Words per minute
    filler_word_count   INTEGER,
    filler_words        JSONB,                            -- { "um": 5, "uh": 3, "like": 8 }
    pause_count         INTEGER,
    long_pause_count    INTEGER,                          -- pauses > 3 seconds
    repeated_words      JSONB,                            -- { "basically": 4 }
    -- Quality scores (0-100)
    clarity_score       DECIMAL(5,2),
    confidence_score    DECIMAL(5,2),
    fluency_score       DECIMAL(5,2),
    grammar_score       DECIMAL(5,2),
    vocabulary_score    DECIMAL(5,2),
    overall_speech_score DECIMAL(5,2),
    -- AI analysis
    tone_analysis       JSONB,                            -- { tone: "professional", sentiment: "positive" }
    improvement_areas   TEXT[],
    positive_aspects    TEXT[],
    ai_suggestions      TEXT,
    audio_url           TEXT,
    analyzed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for speech_analysis
CREATE INDEX idx_speech_user_id       ON speech_analysis(user_id);
CREATE INDEX idx_speech_interview_id  ON speech_analysis(interview_id);
CREATE INDEX idx_speech_created       ON speech_analysis(created_at DESC);

-- =============================================================
-- TABLE: resume_uploads
-- =============================================================

CREATE TABLE resume_uploads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_url        TEXT NOT NULL,                        -- S3 URL
    file_size_bytes BIGINT,
    file_hash       VARCHAR(64),                          -- SHA256 for dedup
    extracted_text  TEXT,
    target_role     VARCHAR(100),
    status          resume_status NOT NULL DEFAULT 'processing',
    error_message   TEXT,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- Indexes for resume_uploads
CREATE INDEX idx_resume_user_id       ON resume_uploads(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_resume_status        ON resume_uploads(status);
CREATE INDEX idx_resume_created       ON resume_uploads(created_at DESC);

-- =============================================================
-- TABLE: resume_scores
-- =============================================================

CREATE TABLE resume_scores (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id           UUID NOT NULL REFERENCES resume_uploads(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- ATS Scores (0-100)
    overall_ats_score   DECIMAL(5,2),
    keyword_score       DECIMAL(5,2),
    formatting_score    DECIMAL(5,2),
    grammar_score       DECIMAL(5,2),
    readability_score   DECIMAL(5,2),
    completeness_score  DECIMAL(5,2),
    -- Section detection
    has_contact_info    BOOLEAN DEFAULT FALSE,
    has_summary         BOOLEAN DEFAULT FALSE,
    has_experience      BOOLEAN DEFAULT FALSE,
    has_education       BOOLEAN DEFAULT FALSE,
    has_skills          BOOLEAN DEFAULT FALSE,
    has_projects        BOOLEAN DEFAULT FALSE,
    has_certifications  BOOLEAN DEFAULT FALSE,
    -- Keyword analysis
    matched_keywords    TEXT[],
    missing_keywords    TEXT[],
    keyword_density     DECIMAL(5,4),
    -- Metrics
    word_count          INTEGER,
    page_count          INTEGER,
    action_verb_count   INTEGER,
    quantified_achievements INTEGER,
    -- AI output
    ai_suggestions      JSONB,                            -- Array of suggestion objects
    improvement_roadmap TEXT,
    overall_feedback    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for resume_scores
CREATE INDEX idx_resume_scores_resume     ON resume_scores(resume_id);
CREATE INDEX idx_resume_scores_user       ON resume_scores(user_id);
CREATE INDEX idx_resume_scores_ats        ON resume_scores(overall_ats_score DESC);

-- =============================================================
-- TABLE: ai_feedback
-- =============================================================

CREATE TABLE ai_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL,                 -- 'interview', 'resume', 'speech', 'overall'
    entity_id       UUID,                                 -- Reference to interview/resume/speech
    -- Scores
    overall_score   DECIMAL(5,2),
    communication_score  DECIMAL(5,2),
    confidence_score     DECIMAL(5,2),
    technical_score      DECIMAL(5,2),
    -- Feedback content
    summary         TEXT NOT NULL,
    strengths       TEXT[],
    weaknesses      TEXT[],
    action_items    JSONB,                                -- Array of { item, priority, timeframe }
    career_roadmap  JSONB,                                -- Structured roadmap
    recommended_resources JSONB,                          -- Books, courses, etc.
    -- Metadata
    model_used      VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    tokens_used     INTEGER,
    generation_time_ms INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_feedback
CREATE INDEX idx_feedback_user_id     ON ai_feedback(user_id);
CREATE INDEX idx_feedback_entity      ON ai_feedback(entity_type, entity_id);
CREATE INDEX idx_feedback_created     ON ai_feedback(created_at DESC);

-- =============================================================
-- TABLE: notifications
-- =============================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    data            JSONB,                                -- Extra data for deep linking
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================================
-- TABLE: admin_logs
-- =============================================================

CREATE TABLE admin_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action          log_action NOT NULL,
    target_type     VARCHAR(50),                          -- 'user', 'interview', 'resume', 'system'
    target_id       UUID,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    user_agent      TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for admin_logs
CREATE INDEX idx_admin_logs_admin     ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action    ON admin_logs(action);
CREATE INDEX idx_admin_logs_created   ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target    ON admin_logs(target_type, target_id);

-- =============================================================
-- TABLE: reports
-- =============================================================

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            report_type NOT NULL,
    title           VARCHAR(255) NOT NULL,
    entity_id       UUID,                                 -- interview/resume ID
    file_url        TEXT,                                 -- S3 URL of generated PDF
    data            JSONB,                                -- Report data snapshot
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,                          -- Reports expire after 30 days
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX idx_reports_user_id      ON reports(user_id);
CREATE INDEX idx_reports_type         ON reports(type);
CREATE INDEX idx_reports_created      ON reports(created_at DESC);

-- =============================================================
-- TABLE: chat_history
-- =============================================================

CREATE TABLE chat_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    tokens_used     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chat_history
CREATE INDEX idx_chat_user_id         ON chat_history(user_id);
CREATE INDEX idx_chat_created         ON chat_history(created_at DESC);

-- =============================================================
-- TABLE: api_usage
-- =============================================================

CREATE TABLE api_usage (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint        VARCHAR(255) NOT NULL,
    method          VARCHAR(10) NOT NULL,
    status_code     INTEGER,
    response_time_ms INTEGER,
    ai_model        VARCHAR(50),
    tokens_used     INTEGER,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned index for API usage (for high-volume analytics)
CREATE INDEX idx_api_usage_created    ON api_usage(created_at DESC);
CREATE INDEX idx_api_usage_user       ON api_usage(user_id);
CREATE INDEX idx_api_usage_endpoint   ON api_usage(endpoint);

-- =============================================================
-- TABLE: achievements (Gamification)
-- =============================================================

CREATE TABLE achievements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    icon            VARCHAR(50),
    points          INTEGER NOT NULL DEFAULT 0,
    category        VARCHAR(50),
    requirement     JSONB                                 -- { type: 'interview_count', value: 10 }
);

CREATE TABLE user_achievements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id  UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_uploads_updated_at
    BEFORE UPDATE ON resume_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_scores_updated_at
    BEFORE UPDATE ON resume_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_feedback_updated_at
    BEFORE UPDATE ON ai_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
    total_interviews BIGINT,
    completed_interviews BIGINT,
    avg_overall_score DECIMAL,
    avg_communication_score DECIMAL,
    avg_confidence_score DECIMAL,
    best_score DECIMAL,
    total_practice_hours DECIMAL,
    current_streak INTEGER,
    total_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(i.id) as total_interviews,
        COUNT(CASE WHEN i.status = 'completed' THEN 1 END) as completed_interviews,
        ROUND(AVG(CASE WHEN i.status = 'completed' THEN i.overall_score END), 2),
        ROUND(AVG(CASE WHEN i.status = 'completed' THEN i.communication_score END), 2),
        ROUND(AVG(CASE WHEN i.status = 'completed' THEN i.confidence_score END), 2),
        MAX(i.overall_score),
        ROUND(SUM(COALESCE(i.actual_duration_seconds, 0)) / 3600.0, 2),
        u.streak_days,
        u.total_points
    FROM users u
    LEFT JOIN interviews i ON i.user_id = u.id AND i.deleted_at IS NULL
    WHERE u.id = p_user_id AND u.deleted_at IS NULL
    GROUP BY u.streak_days, u.total_points;
END;
$$ LANGUAGE plpgsql;

-- Function: Get performance chart data (last N days)
CREATE OR REPLACE FUNCTION get_performance_chart(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    interview_date DATE,
    avg_score DECIMAL,
    interview_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(i.completed_at) as interview_date,
        ROUND(AVG(i.overall_score), 2) as avg_score,
        COUNT(i.id) as interview_count
    FROM interviews i
    WHERE i.user_id = p_user_id
      AND i.status = 'completed'
      AND i.deleted_at IS NULL
      AND i.completed_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY DATE(i.completed_at)
    ORDER BY interview_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    name VARCHAR,
    avatar_url TEXT,
    total_points INTEGER,
    avg_score DECIMAL,
    completed_interviews BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY u.total_points DESC) as rank,
        u.id,
        u.name,
        u.avatar_url,
        u.total_points,
        ROUND(AVG(i.overall_score), 2),
        COUNT(CASE WHEN i.status = 'completed' THEN 1 END)
    FROM users u
    LEFT JOIN interviews i ON i.user_id = u.id AND i.deleted_at IS NULL
    WHERE u.deleted_at IS NULL AND u.status = 'active'
    GROUP BY u.id, u.name, u.avatar_url, u.total_points
    ORDER BY u.total_points DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- DEFAULT ACHIEVEMENTS DATA
-- =============================================================

INSERT INTO achievements (name, description, icon, points, category, requirement) VALUES
('First Interview', 'Completed your first mock interview', '🎯', 100, 'interviews', '{"type": "interview_count", "value": 1}'),
('Interview Veteran', 'Completed 10 mock interviews', '🏆', 500, 'interviews', '{"type": "interview_count", "value": 10}'),
('Interview Master', 'Completed 50 mock interviews', '👑', 2000, 'interviews', '{"type": "interview_count", "value": 50}'),
('High Achiever', 'Scored 90+ in an interview', '⭐', 300, 'performance', '{"type": "score_threshold", "value": 90}'),
('Perfect Score', 'Scored 100 in an interview', '💎', 1000, 'performance', '{"type": "score_threshold", "value": 100}'),
('Resume Pro', 'Uploaded and analyzed your first resume', '📄', 150, 'resume', '{"type": "resume_count", "value": 1}'),
('ATS Champion', 'Achieved ATS score above 85', '🎖️', 400, 'resume', '{"type": "ats_score", "value": 85}'),
('Week Warrior', 'Practiced 7 days in a row', '🔥', 350, 'streak', '{"type": "streak_days", "value": 7}'),
('Monthly Master', 'Practiced 30 days in a row', '🌟', 1500, 'streak', '{"type": "streak_days", "value": 30}'),
('Speed Speaker', 'Completed an interview in record time', '⚡', 200, 'speech', '{"type": "speech_speed", "value": 150}');

-- =============================================================
-- VIEWS for common queries
-- =============================================================

-- View: User summary (safe to expose via API)
CREATE VIEW v_user_summary AS
SELECT
    id, name, email, role, status, avatar_url,
    email_verified, target_role, experience_level,
    preferred_domain, streak_days, total_points,
    last_active_at, created_at
FROM users
WHERE deleted_at IS NULL;

-- View: Interview summary with user info
CREATE VIEW v_interview_summary AS
SELECT
    i.id, i.title, i.type, i.domain, i.difficulty,
    i.status, i.overall_score, i.communication_score,
    i.confidence_score, i.technical_score,
    i.question_count, i.duration_minutes,
    i.actual_duration_seconds, i.completed_at, i.created_at,
    u.id as user_id, u.name as user_name, u.email as user_email
FROM interviews i
JOIN users u ON u.id = i.user_id
WHERE i.deleted_at IS NULL AND u.deleted_at IS NULL;

-- View: Resume with scores
CREATE VIEW v_resume_with_scores AS
SELECT
    r.id, r.user_id, r.file_name, r.file_url,
    r.target_role, r.status, r.uploaded_at,
    rs.overall_ats_score, rs.keyword_score,
    rs.formatting_score, rs.grammar_score,
    rs.matched_keywords, rs.missing_keywords,
    rs.ai_suggestions
FROM resume_uploads r
LEFT JOIN resume_scores rs ON rs.resume_id = r.id
WHERE r.deleted_at IS NULL;
