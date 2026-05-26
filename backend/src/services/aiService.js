'use strict';

const { generateJSON, generateContent, model } = require('../config/gemini');
const logger = require('../config/logger');
const { INTERVIEW_TYPES, DIFFICULTY_LEVELS, FILLER_WORDS } = require('../utils/constants');

// ─── Fallback Data ──────────────────────────────────────────────────────────

const FALLBACK_QUESTIONS = {
  technical: {
    javascript: [
      { question: 'Explain the difference between `var`, `let`, and `const` in JavaScript.', expectedKeywords: ['scope', 'hoisting', 'block', 'function', 'reassign'], difficulty: 'intermediate', type: 'technical' },
      { question: 'What is event delegation in JavaScript and why is it useful?', expectedKeywords: ['bubbling', 'parent', 'listener', 'performance', 'dynamic'], difficulty: 'intermediate', type: 'technical' },
      { question: 'Describe the JavaScript event loop and how it handles asynchronous code.', expectedKeywords: ['call stack', 'queue', 'microtask', 'macrotask', 'promise'], difficulty: 'advanced', type: 'technical' },
    ],
    python: [
      { question: 'What are Python decorators and how do they work?', expectedKeywords: ['wrapper', 'function', 'closure', 'higher-order', 'syntax sugar'], difficulty: 'intermediate', type: 'technical' },
      { question: 'Explain the difference between lists and tuples in Python.', expectedKeywords: ['mutable', 'immutable', 'performance', 'hashable'], difficulty: 'beginner', type: 'technical' },
      { question: 'What is the GIL (Global Interpreter Lock) in Python?', expectedKeywords: ['thread', 'concurrency', 'CPython', 'multiprocessing'], difficulty: 'advanced', type: 'technical' },
    ],
    default: [
      { question: 'Explain the concept of RESTful APIs and their key principles.', expectedKeywords: ['stateless', 'HTTP', 'resources', 'CRUD', 'endpoints'], difficulty: 'intermediate', type: 'technical' },
      { question: 'What is the difference between SQL and NoSQL databases?', expectedKeywords: ['schema', 'scalability', 'ACID', 'document', 'relational'], difficulty: 'intermediate', type: 'technical' },
      { question: 'Describe the MVC architectural pattern.', expectedKeywords: ['model', 'view', 'controller', 'separation of concerns', 'layer'], difficulty: 'intermediate', type: 'technical' },
      { question: 'What are microservices and how do they differ from a monolithic architecture?', expectedKeywords: ['independent', 'service', 'deployment', 'scalability', 'coupling'], difficulty: 'advanced', type: 'technical' },
      { question: 'Explain the SOLID principles of object-oriented design.', expectedKeywords: ['single responsibility', 'open-closed', 'Liskov', 'interface', 'dependency'], difficulty: 'advanced', type: 'technical' },
    ],
  },
  behavioral: [
    { question: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?', expectedKeywords: ['communication', 'conflict', 'resolution', 'empathy', 'outcome'], difficulty: 'intermediate', type: 'behavioral' },
    { question: 'Describe a project where you had to meet a tight deadline. What was your approach?', expectedKeywords: ['prioritize', 'time management', 'pressure', 'deliver', 'strategy'], difficulty: 'intermediate', type: 'behavioral' },
    { question: 'Tell me about a time you failed at something. What did you learn?', expectedKeywords: ['accountability', 'lesson', 'growth', 'improvement', 'reflect'], difficulty: 'intermediate', type: 'behavioral' },
    { question: 'How do you handle receiving constructive criticism?', expectedKeywords: ['feedback', 'improvement', 'open-minded', 'grateful', 'action'], difficulty: 'beginner', type: 'behavioral' },
    { question: 'Describe a situation where you had to lead a team without formal authority.', expectedKeywords: ['influence', 'leadership', 'collaboration', 'initiative', 'results'], difficulty: 'advanced', type: 'behavioral' },
  ],
  hr: [
    { question: 'Why do you want to work at our company?', expectedKeywords: ['culture', 'mission', 'growth', 'values', 'contribution'], difficulty: 'beginner', type: 'hr' },
    { question: 'Where do you see yourself in 5 years?', expectedKeywords: ['goals', 'growth', 'leadership', 'skills', 'career'], difficulty: 'beginner', type: 'hr' },
    { question: 'What are your greatest strengths and weaknesses?', expectedKeywords: ['honest', 'self-aware', 'improvement', 'examples'], difficulty: 'beginner', type: 'hr' },
    { question: 'What salary are you expecting?', expectedKeywords: ['research', 'market', 'flexible', 'value', 'negotiable'], difficulty: 'intermediate', type: 'hr' },
    { question: 'Why are you leaving your current job?', expectedKeywords: ['growth', 'opportunity', 'positive', 'new challenge'], difficulty: 'intermediate', type: 'hr' },
  ],
  system_design: [
    { question: 'Design a URL shortening service like bit.ly.', expectedKeywords: ['hash', 'database', 'cache', 'load balancer', 'scale', 'redirect'], difficulty: 'advanced', type: 'system_design' },
    { question: 'How would you design a Twitter-like social media feed?', expectedKeywords: ['fanout', 'cache', 'message queue', 'timeline', 'consistency'], difficulty: 'expert', type: 'system_design' },
    { question: 'Design a rate limiter for an API.', expectedKeywords: ['token bucket', 'sliding window', 'Redis', 'throttle', 'distributed'], difficulty: 'advanced', type: 'system_design' },
  ],
};

function getFallbackQuestions(type, domain, difficulty, count) {
  let pool = [];

  if (type === 'behavioral') {
    pool = [...FALLBACK_QUESTIONS.behavioral];
  } else if (type === 'hr') {
    pool = [...FALLBACK_QUESTIONS.hr];
  } else if (type === 'system_design') {
    pool = [...FALLBACK_QUESTIONS.system_design];
  } else {
    const domainKey = domain ? domain.toLowerCase() : 'default';
    pool = [
      ...(FALLBACK_QUESTIONS.technical[domainKey] || []),
      ...FALLBACK_QUESTIONS.technical.default,
    ];
  }

  if (difficulty) {
    const filtered = pool.filter((q) => q.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }

  // Shuffle and return requested count
  pool = pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
}

// ─── AI Service Functions ────────────────────────────────────────────────────

/**
 * Generate interview questions using Gemini AI
 * @param {string} type - Interview type (technical, behavioral, hr, system_design)
 * @param {string} domain - Domain/technology (e.g., 'JavaScript', 'Python', 'React')
 * @param {string} difficulty - Difficulty level
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Array of question objects
 */
async function generateInterviewQuestions(type = 'technical', domain = 'general', difficulty = 'intermediate', count = 10) {
  const prompt = `You are an expert technical interviewer at a top tech company.

Generate exactly ${count} interview questions for the following criteria:
- Interview Type: ${type}
- Domain/Technology: ${domain}
- Difficulty Level: ${difficulty}

For each question, provide:
1. The interview question (clear, specific, and industry-standard)
2. Expected keywords/concepts the answer should contain (5-8 keywords)
3. The difficulty level
4. Question type

Return a JSON array with this exact structure:
[
  {
    "question": "The interview question text",
    "expectedKeywords": ["keyword1", "keyword2", "keyword3"],
    "difficulty": "${difficulty}",
    "type": "${type}"
  }
]

Make questions progressively challenging. Include mix of conceptual and practical questions for technical types. For behavioral questions, use the STAR method format. For system design, focus on scalability and trade-offs.`;

  try {
    if (!model) {
      logger.warn('Gemini not available, using fallback questions');
      return getFallbackQuestions(type, domain, difficulty, count);
    }

    const questions = await generateJSON(prompt, { maxOutputTokens: 4096 });

    if (!Array.isArray(questions) || questions.length === 0) {
      logger.warn('Invalid questions format from Gemini, using fallback');
      return getFallbackQuestions(type, domain, difficulty, count);
    }

    logger.info('Generated interview questions via Gemini', {
      type, domain, difficulty, count: questions.length,
    });

    return questions.slice(0, count);
  } catch (err) {
    logger.error('generateInterviewQuestions failed, using fallback', { error: err.message });
    return getFallbackQuestions(type, domain, difficulty, count);
  }
}

/**
 * Analyze a candidate's interview response
 * @param {string} question - The interview question
 * @param {string} response - Candidate's answer
 * @param {string} questionType - Type of question
 * @param {Array} expectedKeywords - Keywords expected in the answer
 * @returns {Promise<object>} Analysis result
 */
async function analyzeResponse(question, response, questionType = 'technical', expectedKeywords = []) {
  const prompt = `You are an expert interview coach analyzing a candidate's response.

Question: "${question}"
Question Type: ${questionType}
Expected Keywords: ${expectedKeywords.join(', ')}

Candidate's Response: "${response}"

Analyze the response and return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywords_matched": ["keyword1", "keyword2"],
  "keywords_missing": ["missing1", "missing2"],
  "overall_feedback": "Detailed 2-3 sentence feedback on the response",
  "communication_score": <number 0-100>,
  "technical_accuracy": <number 0-100>,
  "structure_score": <number 0-100>
}

Scoring criteria:
- 90-100: Exceptional, exceeds expectations
- 70-89: Good, meets expectations  
- 50-69: Satisfactory, meets basic requirements
- 30-49: Below average, needs improvement
- 0-29: Poor, significant gaps

Be constructive and specific in feedback.`;

  try {
    if (!model) {
      return getMockAnalysis(response, expectedKeywords);
    }

    const analysis = await generateJSON(prompt, { temperature: 0.2 });
    logger.info('Response analyzed via Gemini', { questionType, score: analysis.score });
    return analysis;
  } catch (err) {
    logger.error('analyzeResponse failed, using fallback', { error: err.message });
    return getMockAnalysis(response, expectedKeywords);
  }
}

function getMockAnalysis(response, expectedKeywords = []) {
  const words = response.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Simple keyword matching
  const responseText = response.toLowerCase();
  const matched = expectedKeywords.filter((kw) => responseText.includes(kw.toLowerCase()));
  const missing = expectedKeywords.filter((kw) => !responseText.includes(kw.toLowerCase()));

  const keywordScore = expectedKeywords.length > 0
    ? (matched.length / expectedKeywords.length) * 40
    : 20;
  const lengthScore = Math.min(wordCount / 100, 1) * 30;
  const baseScore = 30;
  const score = Math.round(Math.min(100, baseScore + keywordScore + lengthScore));

  return {
    score,
    strengths: [
      wordCount >= 50 ? 'Provided a detailed response' : 'Attempted to answer the question',
      matched.length > 0 ? `Mentioned key concepts: ${matched.slice(0, 2).join(', ')}` : 'Showed understanding of the topic',
    ],
    improvements: [
      wordCount < 50 ? 'Provide more detailed explanations with examples' : 'Consider structuring your answer more clearly',
      missing.length > 0 ? `Consider mentioning: ${missing.slice(0, 2).join(', ')}` : 'Add concrete examples from your experience',
      'Use the STAR method for behavioral questions',
    ],
    keywords_matched: matched,
    keywords_missing: missing,
    overall_feedback: `Your response demonstrates ${score >= 70 ? 'good' : 'basic'} understanding of the topic. ${wordCount < 50 ? 'Consider providing more detailed explanations.' : 'The depth of your answer is appropriate.'} Focus on incorporating specific examples and metrics.`,
    communication_score: Math.round(score * 0.9),
    technical_accuracy: score,
    structure_score: wordCount >= 100 ? Math.round(score * 0.85) : Math.round(score * 0.7),
  };
}

/**
 * Analyze speech transcript for quality metrics
 * @param {string} transcript - Speech transcript
 * @param {object} audioMetrics - Optional audio metrics (speaking_rate, pauses, etc.)
 * @returns {Promise<object>} Speech analysis object
 */
async function analyzeSpeech(transcript, audioMetrics = {}) {
  const prompt = `You are an expert speech coach and communication analyst.

Analyze the following speech transcript for quality, clarity, and professionalism:

Transcript: "${transcript}"

${audioMetrics.speaking_rate ? `Speaking Rate: ${audioMetrics.speaking_rate} words per minute` : ''}
${audioMetrics.pause_count ? `Number of Pauses: ${audioMetrics.pause_count}` : ''}

Analyze and return a JSON object with this exact structure:
{
  "filler_word_count": <number>,
  "filler_words_found": ["um", "uh"],
  "filler_word_percentage": <number 0-100>,
  "speaking_pace": "<slow|moderate|fast|very_fast>",
  "words_per_minute": <estimated number>,
  "clarity_score": <number 0-100>,
  "grammar_score": <number 0-100>,
  "confidence_score": <number 0-100>,
  "vocabulary_score": <number 0-100>,
  "overall_speech_score": <number 0-100>,
  "repeated_words": ["word1", "word2"],
  "incomplete_sentences": <number>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "detailed_feedback": "2-3 sentences of specific, actionable feedback",
  "tone": "<professional|casual|nervous|confident|monotone>",
  "word_count": <number>
}`;

  try {
    if (!model) {
      return getSpeechFallback(transcript, audioMetrics);
    }

    const analysis = await generateJSON(prompt, { temperature: 0.2 });
    logger.info('Speech analyzed via Gemini');
    return analysis;
  } catch (err) {
    logger.error('analyzeSpeech failed, using fallback', { error: err.message });
    return getSpeechFallback(transcript, audioMetrics);
  }
}

function getSpeechFallback(transcript, audioMetrics = {}) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const textLower = transcript.toLowerCase();

  // Count filler words
  const fillerWordsFound = [];
  let fillerWordCount = 0;
  for (const fw of FILLER_WORDS) {
    const regex = new RegExp(`\\b${fw}\\b`, 'gi');
    const matches = transcript.match(regex);
    if (matches && matches.length > 0) {
      fillerWordsFound.push(fw);
      fillerWordCount += matches.length;
    }
  }

  const fillerPercentage = wordCount > 0 ? (fillerWordCount / wordCount) * 100 : 0;

  // Estimate WPM (assuming avg speech duration of 2 minutes for text)
  const estimatedWPM = audioMetrics.speaking_rate || Math.round(wordCount / 2);

  // Repeated words
  const wordFreq = {};
  words.forEach((w) => {
    const cleaned = w.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length > 4) wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
  });
  const repeatedWords = Object.entries(wordFreq)
    .filter(([, count]) => count > 3)
    .map(([word]) => word)
    .slice(0, 5);

  const clarityScore = Math.max(0, 100 - fillerPercentage * 5);
  const grammarScore = 75; // Default without NLP
  const confidenceScore = fillerWordCount < 5 ? 80 : Math.max(30, 80 - fillerWordCount * 3);
  const vocabScore = Math.min(100, (new Set(words.map((w) => w.toLowerCase())).size / wordCount) * 100);
  const overallScore = Math.round((clarityScore + grammarScore + confidenceScore + vocabScore) / 4);

  return {
    filler_word_count: fillerWordCount,
    filler_words_found: fillerWordsFound,
    filler_word_percentage: Math.round(fillerPercentage * 10) / 10,
    speaking_pace: estimatedWPM < 100 ? 'slow' : estimatedWPM < 150 ? 'moderate' : estimatedWPM < 200 ? 'fast' : 'very_fast',
    words_per_minute: estimatedWPM,
    clarity_score: Math.round(clarityScore),
    grammar_score: grammarScore,
    confidence_score: confidenceScore,
    vocabulary_score: Math.round(vocabScore),
    overall_speech_score: overallScore,
    repeated_words: repeatedWords,
    incomplete_sentences: 0,
    strengths: [
      fillerWordCount < 3 ? 'Very few filler words — speaks confidently' : 'Demonstrates knowledge of the topic',
      wordCount > 100 ? 'Provides detailed explanations' : 'Concise and to the point',
    ],
    improvements: [
      fillerWordCount > 5 ? `Reduce filler words (found ${fillerWordCount}: ${fillerWordsFound.slice(0, 3).join(', ')})` : 'Maintain excellent control of speech patterns',
      estimatedWPM > 180 ? 'Slow down slightly for better clarity' : 'Pace is good',
      repeatedWords.length > 0 ? `Vary vocabulary — commonly repeated: ${repeatedWords.slice(0, 2).join(', ')}` : 'Good vocabulary variety',
    ],
    detailed_feedback: `Your speech analysis shows an overall score of ${overallScore}/100. ${fillerWordCount > 5 ? `Work on reducing filler words (${fillerWordCount} detected). ` : 'Excellent control of filler words. '}${estimatedWPM > 180 ? 'Consider slowing your speaking pace for better comprehension.' : 'Your speaking pace is appropriate.'}`,
    tone: confidenceScore > 70 ? 'confident' : 'nervous',
    word_count: wordCount,
  };
}

/**
 * Analyze resume text for ATS optimization
 * @param {string} text - Extracted resume text
 * @param {string} jobRole - Target job role
 * @returns {Promise<object>} Resume analysis object
 */
async function analyzeResume(text, jobRole = 'Software Engineer') {
  const prompt = `You are an expert ATS (Applicant Tracking System) consultant and resume reviewer.

Analyze the following resume for a ${jobRole} position:

Resume Text:
"""
${text.substring(0, 3000)}
"""

Provide a comprehensive ATS analysis and return a JSON object with this exact structure:
{
  "ats_score": <number 0-100>,
  "formatting_score": <number 0-100>,
  "keyword_score": <number 0-100>,
  "experience_score": <number 0-100>,
  "education_score": <number 0-100>,
  "sections": {
    "has_summary": <boolean>,
    "has_experience": <boolean>,
    "has_education": <boolean>,
    "has_skills": <boolean>,
    "has_projects": <boolean>,
    "has_certifications": <boolean>,
    "has_contact": <boolean>
  },
  "keywords_found": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "missing_skills": ["skill1", "skill2"],
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "suggestions": [
    {"category": "keywords", "suggestion": "Add these missing keywords: X, Y, Z"},
    {"category": "formatting", "suggestion": "Use bullet points to improve readability"}
  ],
  "overall_summary": "2-3 sentence overall assessment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Scoring criteria:
- 90-100: Excellent ATS compatibility
- 70-89: Good, minor improvements needed
- 50-69: Average, significant improvements needed
- Below 50: Poor ATS compatibility, major revision needed`;

  try {
    if (!model) {
      return getResumeAnalysisFallback(text, jobRole);
    }

    const analysis = await generateJSON(prompt, { maxOutputTokens: 4096, temperature: 0.2 });
    logger.info('Resume analyzed via Gemini', { jobRole, atsScore: analysis.ats_score });
    return analysis;
  } catch (err) {
    logger.error('analyzeResume failed, using fallback', { error: err.message });
    return getResumeAnalysisFallback(text, jobRole);
  }
}

function getResumeAnalysisFallback(text, jobRole) {
  const { RESUME_SECTIONS, TECH_SKILLS, ACTION_VERBS } = require('../utils/constants');
  const textLower = text.toLowerCase();

  // Detect sections
  const sections = {
    has_summary: /summary|objective|profile|about/i.test(text),
    has_experience: /experience|employment|work history/i.test(text),
    has_education: /education|degree|university|college/i.test(text),
    has_skills: /skills|technologies|tools/i.test(text),
    has_projects: /projects|portfolio/i.test(text),
    has_certifications: /certification|certified|certificate/i.test(text),
    has_contact: /email|phone|linkedin/i.test(text),
  };

  // Keyword matching
  const foundTechSkills = TECH_SKILLS.filter((skill) => textLower.includes(skill.toLowerCase()));
  const foundActionVerbs = ACTION_VERBS.filter((verb) => textLower.includes(verb.toLowerCase()));

  const sectionScore = (Object.values(sections).filter(Boolean).length / 7) * 100;
  const keywordScore = Math.min(100, (foundTechSkills.length / 10) * 100);
  const actionVerbScore = Math.min(100, (foundActionVerbs.length / 5) * 100);
  const atsScore = Math.round((sectionScore * 0.4 + keywordScore * 0.4 + actionVerbScore * 0.2));

  return {
    ats_score: atsScore,
    formatting_score: Math.round(sectionScore),
    keyword_score: Math.round(keywordScore),
    experience_score: sections.has_experience ? 70 : 0,
    education_score: sections.has_education ? 80 : 0,
    sections,
    keywords_found: foundTechSkills.slice(0, 10),
    missing_keywords: TECH_SKILLS.filter((s) => !foundTechSkills.includes(s)).slice(0, 5),
    missing_skills: ['quantified achievements', 'industry certifications'],
    technical_skills: foundTechSkills,
    soft_skills: ['communication', 'teamwork', 'problem-solving'],
    suggestions: [
      !sections.has_summary && { category: 'sections', suggestion: 'Add a professional summary section at the top' },
      foundActionVerbs.length < 3 && { category: 'formatting', suggestion: 'Use more action verbs: achieved, built, developed, reduced, improved' },
      keywordScore < 50 && { category: 'keywords', suggestion: `Add more ${jobRole}-relevant keywords to pass ATS filters` },
      { category: 'formatting', suggestion: 'Quantify achievements with numbers and percentages (e.g., "Reduced load time by 40%")' },
    ].filter(Boolean),
    overall_summary: `Your resume scores ${atsScore}/100 for ATS compatibility targeting ${jobRole} roles. ${atsScore >= 70 ? 'Strong foundation with room for optimization.' : 'Significant improvements needed to pass ATS filters.'} Focus on adding quantifiable achievements and role-specific keywords.`,
    strengths: [
      sections.has_experience ? 'Experience section present' : null,
      foundTechSkills.length > 5 ? 'Good technical skills coverage' : null,
      sections.has_education ? 'Education section included' : null,
    ].filter(Boolean),
    weaknesses: [
      !sections.has_summary ? 'Missing professional summary' : null,
      foundActionVerbs.length < 3 ? 'Insufficient action verbs' : null,
      keywordScore < 50 ? 'Low keyword density for ATS' : null,
    ].filter(Boolean),
  };
}

/**
 * Generate comprehensive improvement feedback for a completed interview
 * @param {object} interviewData - Interview data including questions, responses, scores
 * @returns {Promise<object>} Improvement plan object
 */
async function generateFeedback(interviewData) {
  const { type, domain, difficulty, questions = [], responses = [], overall_score } = interviewData;

  const responsesSummary = responses
    .map((r, i) => `Q${i + 1}: "${questions[i]?.question_text || 'Question'}" - Score: ${r.score || 0}/100`)
    .join('\n');

  const prompt = `You are an expert interview coach providing post-interview feedback.

Interview Summary:
- Type: ${type}
- Domain: ${domain}
- Difficulty: ${difficulty}
- Overall Score: ${overall_score || 'N/A'}/100

Question & Score Summary:
${responsesSummary}

Generate a comprehensive improvement plan and return a JSON object:
{
  "summary": "2-3 sentence overall performance summary",
  "overall_rating": "<excellent|good|average|needs_improvement>",
  "strengths": [
    {"area": "Technical Knowledge", "detail": "Specific strength observed"},
    {"area": "Communication", "detail": "Specific communication strength"}
  ],
  "weaknesses": [
    {"area": "Area name", "detail": "Specific weakness", "priority": "<high|medium|low>"}
  ],
  "action_items": [
    {"task": "Specific actionable task", "timeframe": "1 week", "resource": "Recommended resource/approach"},
    {"task": "Another task", "timeframe": "2 weeks", "resource": "Resource"}
  ],
  "roadmap": [
    {"week": 1, "focus": "What to focus on week 1", "goals": ["Goal 1", "Goal 2"]},
    {"week": 2, "focus": "Week 2 focus", "goals": ["Goal 1", "Goal 2"]},
    {"week": 4, "focus": "Month 1 focus", "goals": ["Goal 1", "Goal 2"]}
  ],
  "recommended_resources": [
    {"title": "Resource name", "type": "<book|course|website|practice>", "url": null}
  ],
  "next_interview_score_prediction": <number 0-100>
}`;

  try {
    if (!model) {
      return getMockFeedback(overall_score, type);
    }

    const feedback = await generateJSON(prompt, { maxOutputTokens: 4096, temperature: 0.4 });
    logger.info('Comprehensive feedback generated via Gemini');
    return feedback;
  } catch (err) {
    logger.error('generateFeedback failed, using fallback', { error: err.message });
    return getMockFeedback(overall_score, type);
  }
}

function getMockFeedback(score, type) {
  const numScore = score || 65;
  const rating = numScore >= 85 ? 'excellent' : numScore >= 70 ? 'good' : numScore >= 50 ? 'average' : 'needs_improvement';

  return {
    summary: `Your interview performance shows ${rating === 'excellent' ? 'exceptional' : rating === 'good' ? 'solid' : 'developing'} capabilities. Overall score of ${numScore}/100 reflects your current preparation level. With targeted practice, you can significantly improve your performance.`,
    overall_rating: rating,
    strengths: [
      { area: 'Engagement', detail: 'Demonstrated willingness to attempt all questions' },
      { area: 'Communication', detail: 'Responses were generally coherent and structured' },
    ],
    weaknesses: [
      { area: 'Technical Depth', detail: 'Some answers lacked technical specificity', priority: 'high' },
      { area: 'Examples', detail: 'Responses could benefit from more concrete real-world examples', priority: 'medium' },
    ],
    action_items: [
      { task: `Practice ${type === 'technical' ? 'LeetCode problems (Medium level)' : 'STAR method stories daily'}`, timeframe: '1 week', resource: type === 'technical' ? 'leetcode.com' : 'STAR method framework' },
      { task: 'Conduct 2 mock interviews per week', timeframe: 'Ongoing', resource: 'WorkForMe.Space practice module' },
      { task: 'Review fundamentals through structured course', timeframe: '2 weeks', resource: 'Coursera / Udemy' },
    ],
    roadmap: [
      { week: 1, focus: 'Foundation Review', goals: ['Review core concepts', 'Practice 10 questions daily'] },
      { week: 2, focus: 'Hands-on Practice', goals: ['Build 2 mini projects', 'Focus on weakest areas'] },
      { week: 4, focus: 'Mock Interview Readiness', goals: ['Score 80+ on mock interviews', 'Refine storytelling'] },
    ],
    recommended_resources: [
      { title: 'Cracking the Coding Interview', type: 'book', url: null },
      { title: 'System Design Primer', type: 'website', url: 'https://github.com/donnemartin/system-design-primer' },
      { title: 'Blind 75 LeetCode Questions', type: 'practice', url: 'https://leetcode.com' },
    ],
    next_interview_score_prediction: Math.min(100, numScore + 12),
  };
}

/**
 * Generate AI chatbot response
 * @param {string} message - User message
 * @param {object} context - Conversation context (history, user profile, etc.)
 * @returns {Promise<string>} AI response string
 */
async function generateChatResponse(message, context = {}) {
  const systemContext = `You are Aria, an AI interview coach and career assistant for the WorkForMe platform.
You help users prepare for interviews, analyze their performance, improve their resumes, and provide career guidance.
You are encouraging, professional, knowledgeable, and concise.

${context.userName ? `User's name: ${context.userName}` : ''}
${context.recentScore ? `Their recent interview score: ${context.recentScore}/100` : ''}
${context.history && context.history.length > 0 ? `Recent conversation:\n${context.history.map((h) => `${h.role}: ${h.content}`).join('\n')}` : ''}`;

  const prompt = `${systemContext}

User message: "${message}"

Provide a helpful, concise response (2-4 sentences max unless more detail is specifically needed). Be actionable and specific.`;

  try {
    if (!model) {
      return getChatFallback(message);
    }

    const response = await generateContent(prompt, { temperature: 0.7, maxOutputTokens: 512 });
    logger.info('Chat response generated via Gemini');
    return response.trim();
  } catch (err) {
    logger.error('generateChatResponse failed, using fallback', { error: err.message });
    return getChatFallback(message);
  }
}

function getChatFallback(message) {
  const msg = message.toLowerCase();

  if (msg.includes('interview')) {
    return "Great question about interviews! I recommend practicing with our mock interview feature. Start with behavioral questions using the STAR method, then progress to technical rounds. Consistency is key — aim for 3-5 practice sessions per week.";
  } else if (msg.includes('resume')) {
    return "For resume optimization, focus on three key areas: quantifiable achievements (numbers matter!), relevant keywords for your target role, and a clean ATS-friendly format. Upload your resume to get a detailed ATS score and personalized suggestions.";
  } else if (msg.includes('salary') || msg.includes('negotiate')) {
    return "For salary negotiation, research market rates on Glassdoor and Levels.fyi first. Always let the employer make the first offer when possible. When negotiating, anchor higher than your target and be prepared to justify your ask with your specific value and skills.";
  } else if (msg.includes('score') || msg.includes('improve')) {
    return "To improve your interview scores, focus on: 1) Structured responses using STAR/PREP frameworks, 2) Specific examples with measurable outcomes, 3) Technical vocabulary relevant to the role. Practice 15-20 questions daily and review feedback carefully.";
  } else {
    return "I'm here to help with your interview prep and career development! I can assist with mock interviews, resume analysis, career roadmaps, and interview strategies. What specific area would you like to focus on today?";
  }
}

module.exports = {
  generateInterviewQuestions,
  analyzeResponse,
  analyzeSpeech,
  analyzeResume,
  generateFeedback,
  generateChatResponse,
};
