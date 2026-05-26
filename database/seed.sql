-- =============================================================
-- Seed Data for AI Mock Interview Platform
-- Domain: workforme.space
-- =============================================================

-- Admin User (password: Admin@123456 - bcrypt hash)
INSERT INTO users (id, name, email, password_hash, role, status, email_verified, target_role, experience_level, total_points, streak_days) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@workforme.space',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPoIq2xNJOue.',  -- Admin@123456
    'admin',
    'active',
    TRUE,
    'Platform Administrator',
    'senior',
    9999,
    365
),
-- Demo Candidate (password: Demo@123456)
(
    'a0000000-0000-0000-0000-000000000002',
    'Alex Johnson',
    'demo@workforme.space',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Demo@123456
    'candidate',
    'active',
    TRUE,
    'Senior Software Engineer',
    'mid',
    2850,
    12
);

-- Sample completed interview for demo user
INSERT INTO interviews (id, user_id, title, type, domain, difficulty, status, duration_minutes, actual_duration_seconds, question_count, overall_score, communication_score, confidence_score, technical_score, completed_at) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Software Engineering Technical Interview',
    'technical',
    'software_engineering',
    'medium',
    'completed',
    30,
    1820,
    5,
    78.50,
    82.00,
    74.00,
    80.00,
    NOW() - INTERVAL '2 days'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'HR Behavioral Interview',
    'hr',
    NULL,
    'easy',
    'completed',
    20,
    1200,
    5,
    85.00,
    88.00,
    82.00,
    NULL,
    NOW() - INTERVAL '5 days'
);

-- Sample questions
INSERT INTO questions (interview_id, sequence_number, question_text, question_type, difficulty, expected_keywords, time_limit_seconds) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    1,
    'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?',
    'technical',
    'medium',
    ARRAY['REST', 'GraphQL', 'flexibility', 'over-fetching', 'under-fetching', 'schema', 'endpoints', 'queries'],
    120
),
(
    'b0000000-0000-0000-0000-000000000001',
    2,
    'Describe how you would design a URL shortening service like bit.ly. What are the key components?',
    'technical',
    'hard',
    ARRAY['database', 'hash', 'redirect', 'scalability', 'caching', 'load balancer', 'unique ID'],
    180
),
(
    'b0000000-0000-0000-0000-000000000002',
    1,
    'Tell me about a time you had to deal with a difficult team member. How did you handle the situation?',
    'behavioral',
    'easy',
    ARRAY['communication', 'conflict resolution', 'empathy', 'collaboration', 'outcome', 'STAR'],
    120
);

-- Notifications for demo user
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
(
    'a0000000-0000-0000-0000-000000000002',
    'interview_complete',
    'Interview Completed! 🎉',
    'Your Software Engineering Technical Interview is complete. Your overall score: 78.5/100. Check your detailed analysis.',
    FALSE
),
(
    'a0000000-0000-0000-0000-000000000002',
    'achievement',
    'Achievement Unlocked: Interview Veteran! 🏆',
    'You have completed 10 mock interviews. Keep up the great work!',
    FALSE
),
(
    'a0000000-0000-0000-0000-000000000002',
    'system',
    'Welcome to InterviewAI! 👋',
    'Your account is all set up. Start your first mock interview or upload your resume to get personalized feedback.',
    TRUE
);

-- Award some achievements to demo user
INSERT INTO user_achievements (user_id, achievement_id)
SELECT
    'a0000000-0000-0000-0000-000000000002',
    id
FROM achievements
WHERE name IN ('First Interview', 'Week Warrior', 'Resume Pro');
