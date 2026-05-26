'use strict';

/**
 * User roles
 */
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

/**
 * Interview types
 */
const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  HR: 'hr',
  SYSTEM_DESIGN: 'system_design',
  CASE_STUDY: 'case_study',
  CODING: 'coding',
  MIXED: 'mixed',
};

/**
 * Difficulty levels
 */
const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

/**
 * Interview status
 */
const INTERVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

/**
 * Common filler words to detect in speech analysis
 */
const FILLER_WORDS = [
  'um',
  'uh',
  'ah',
  'er',
  'like',
  'you know',
  'basically',
  'literally',
  'actually',
  'honestly',
  'right',
  'okay so',
  'so yeah',
  'i mean',
  'sort of',
  'kind of',
  'you see',
  'at the end of the day',
  'to be honest',
  'well',
  'anyway',
];

/**
 * Action verbs for resume analysis
 */
const ACTION_VERBS = [
  'achieved',
  'built',
  'collaborated',
  'created',
  'delivered',
  'developed',
  'designed',
  'engineered',
  'established',
  'executed',
  'generated',
  'implemented',
  'improved',
  'increased',
  'launched',
  'led',
  'managed',
  'optimized',
  'orchestrated',
  'owned',
  'reduced',
  'scaled',
  'shipped',
  'spearheaded',
  'streamlined',
  'transformed',
];

/**
 * Resume sections to detect
 */
const RESUME_SECTIONS = [
  'education',
  'experience',
  'work experience',
  'employment',
  'skills',
  'technical skills',
  'projects',
  'certifications',
  'awards',
  'publications',
  'summary',
  'objective',
  'profile',
  'contact',
  'languages',
  'volunteer',
  'interests',
];

/**
 * Technical skills keywords
 */
const TECH_SKILLS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c++',
  'c#',
  'go',
  'rust',
  'react',
  'angular',
  'vue',
  'node.js',
  'express',
  'django',
  'flask',
  'spring',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'docker',
  'kubernetes',
  'aws',
  'gcp',
  'azure',
  'terraform',
  'git',
  'ci/cd',
  'rest api',
  'graphql',
  'microservices',
  'machine learning',
  'deep learning',
  'tensorflow',
  'pytorch',
  'sql',
  'nosql',
  'linux',
  'bash',
  'html',
  'css',
  'tailwind',
  'next.js',
  'nuxt',
  'webpack',
  'vite',
];

/**
 * HTTP status codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Pagination defaults
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * File upload limits
 */
const UPLOAD_LIMITS = {
  RESUME_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  AUDIO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_RESUME_TYPES: ['application/pdf'],
  ALLOWED_AUDIO_TYPES: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
};

/**
 * Token expiry
 */
const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
};

module.exports = {
  ROLES,
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  INTERVIEW_STATUS,
  FILLER_WORDS,
  ACTION_VERBS,
  RESUME_SECTIONS,
  TECH_SKILLS,
  HTTP_STATUS,
  PAGINATION,
  UPLOAD_LIMITS,
  TOKEN_EXPIRY,
};
