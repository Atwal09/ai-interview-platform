'use strict';

const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { RESUME_SECTIONS, TECH_SKILLS, ACTION_VERBS } = require('../utils/constants');

/**
 * Extract text from PDF file
 * @param {string|Buffer} filePathOrBuffer - File path or buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractText(filePathOrBuffer) {
  try {
    let dataBuffer;

    if (Buffer.isBuffer(filePathOrBuffer)) {
      dataBuffer = filePathOrBuffer;
    } else if (typeof filePathOrBuffer === 'string') {
      dataBuffer = fs.readFileSync(filePathOrBuffer);
    } else {
      throw new Error('Invalid input: must be file path or Buffer');
    }

    const data = await pdf(dataBuffer);
    const text = data.text.replace(/\s+/g, ' ').trim();

    logger.info('PDF text extracted', {
      pages: data.numpages,
      textLength: text.length,
    });

    return text;
  } catch (err) {
    logger.error('extractText error', { error: err.message });
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}

/**
 * Detect which resume sections are present
 * @param {string} text - Resume text
 * @returns {object} Sections found
 */
function detectSections(text) {
  const textLower = text.toLowerCase();

  return {
    summary: /\b(summary|professional summary|objective|profile|about me)\b/i.test(text),
    experience: /\b(experience|work experience|employment|work history|professional experience)\b/i.test(text),
    education: /\b(education|academic background|degree|qualification)\b/i.test(text),
    skills: /\b(skills|technical skills|core competencies|expertise|technologies)\b/i.test(text),
    projects: /\b(projects|personal projects|portfolio|side projects)\b/i.test(text),
    certifications: /\b(certifications|certificates|certified|licenses)\b/i.test(text),
    awards: /\b(awards|achievements|honors|recognition)\b/i.test(text),
    contact: /\b(email|phone|linkedin|github|portfolio|contact)\b/i.test(text),
    languages: /\b(languages|language proficiency)\b/i.test(text),
    volunteer: /\b(volunteer|volunteering|community service)\b/i.test(text),
  };
}

/**
 * Extract technical and soft skills from resume text
 * @param {string} text - Resume text
 * @returns {object} { technical, soft }
 */
function extractKeywords(text) {
  const textLower = text.toLowerCase();

  const technical = TECH_SKILLS.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );

  const softSkillsDict = [
    'communication', 'leadership', 'teamwork', 'problem-solving', 'creativity',
    'adaptability', 'time management', 'critical thinking', 'collaboration',
    'attention to detail', 'project management', 'analytical', 'strategic',
    'mentoring', 'coaching', 'presentation', 'negotiation', 'decision making',
  ];

  const soft = softSkillsDict.filter((skill) =>
    textLower.includes(skill.toLowerCase())
  );

  return { technical, soft };
}

/**
 * Score resume formatting based on heuristics
 * @param {string} text - Resume text
 * @returns {object} { score, checks }
 */
function scoreFormatting(text) {
  const checks = [];
  let score = 100;

  // Check length (optimal: 300-800 words)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 200) {
    score -= 20;
    checks.push({ check: 'Resume too short', passed: false, impact: -20 });
  } else if (wordCount > 1200) {
    score -= 10;
    checks.push({ check: 'Resume may be too long', passed: false, impact: -10 });
  } else {
    checks.push({ check: 'Resume length is appropriate', passed: true, impact: 0 });
  }

  // Check for action verbs
  const foundVerbs = ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  );
  if (foundVerbs.length < 3) {
    score -= 15;
    checks.push({ check: 'Insufficient action verbs', passed: false, impact: -15 });
  } else {
    checks.push({ check: `${foundVerbs.length} action verbs found`, passed: true, impact: 0 });
  }

  // Check for numbers/metrics
  const hasMetrics = /\d+%|\$[\d,]+|\d+\s*(million|billion|k\b|years|months|users|customers|team)/i.test(text);
  if (!hasMetrics) {
    score -= 15;
    checks.push({ check: 'No quantifiable achievements found', passed: false, impact: -15 });
  } else {
    checks.push({ check: 'Contains quantifiable achievements', passed: true, impact: 0 });
  }

  // Check for email
  if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
    score -= 10;
    checks.push({ check: 'Email address not found', passed: false, impact: -10 });
  } else {
    checks.push({ check: 'Contact email present', passed: true, impact: 0 });
  }

  // Check for LinkedIn
  if (!/linkedin/i.test(text)) {
    score -= 5;
    checks.push({ check: 'LinkedIn URL not found', passed: false, impact: -5 });
  } else {
    checks.push({ check: 'LinkedIn URL present', passed: true, impact: 0 });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    word_count: wordCount,
    action_verbs_found: foundVerbs,
    has_metrics: hasMetrics,
    checks,
  };
}

/**
 * Calculate ATS compatibility score
 * @param {string} text - Resume text
 * @param {string} jobRole - Target job role
 * @returns {object} ATS analysis
 */
function calculateATSScore(text, jobRole = 'Software Engineer') {
  const sections = detectSections(text);
  const keywords = extractKeywords(text);
  const formatting = scoreFormatting(text);

  // Section completeness score (0-100)
  const sectionValues = Object.values(sections);
  const presentSections = sectionValues.filter(Boolean).length;
  const sectionScore = Math.round((presentSections / sectionValues.length) * 100);

  // Keyword score
  const keywordScore = Math.min(100, Math.round((keywords.technical.length / 8) * 100));

  // Overall ATS score
  const atsScore = Math.round(
    sectionScore * 0.35 +
    keywordScore * 0.35 +
    formatting.score * 0.30
  );

  return {
    ats_score: atsScore,
    section_score: sectionScore,
    keyword_score: keywordScore,
    formatting_score: formatting.score,
    sections,
    keywords,
    formatting,
  };
}

/**
 * Generate actionable suggestions based on analysis
 * @param {object} analysis - ATS analysis object
 * @returns {Array} Suggestions list
 */
function generateSuggestions(analysis) {
  const suggestions = [];
  const { sections, keywords, formatting, ats_score } = analysis;

  if (!sections.summary) {
    suggestions.push({
      category: 'sections',
      priority: 'high',
      suggestion: 'Add a professional summary (3-4 sentences) at the top highlighting your key value proposition',
    });
  }

  if (!sections.certifications) {
    suggestions.push({
      category: 'sections',
      priority: 'medium',
      suggestion: 'Add a certifications section — industry certifications significantly boost ATS scores',
    });
  }

  if (keywords.technical.length < 5) {
    suggestions.push({
      category: 'keywords',
      priority: 'high',
      suggestion: 'Add more technical keywords relevant to your target role to pass ATS filters',
    });
  }

  if (!formatting.has_metrics) {
    suggestions.push({
      category: 'achievements',
      priority: 'high',
      suggestion: 'Quantify your achievements with numbers: "Increased performance by 40%", "Led team of 8 engineers"',
    });
  }

  if (formatting.action_verbs_found.length < 5) {
    suggestions.push({
      category: 'formatting',
      priority: 'medium',
      suggestion: `Start bullet points with strong action verbs: ${ACTION_VERBS.slice(0, 5).join(', ')}`,
    });
  }

  if (!sections.contact) {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      suggestion: 'Ensure contact information is clearly visible at the top of the resume',
    });
  }

  if (formatting.word_count < 300) {
    suggestions.push({
      category: 'content',
      priority: 'high',
      suggestion: 'Resume is too sparse. Add more detail about your experience and achievements (target 400-800 words)',
    });
  }

  if (ats_score < 60) {
    suggestions.push({
      category: 'general',
      priority: 'high',
      suggestion: 'Major revision needed: Focus on adding role-specific keywords, quantified achievements, and all key sections',
    });
  }

  return suggestions.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}

module.exports = {
  extractText,
  detectSections,
  extractKeywords,
  scoreFormatting,
  calculateATSScore,
  generateSuggestions,
};
