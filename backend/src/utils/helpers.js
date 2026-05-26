'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { PAGINATION } = require('./constants');

/**
 * Generate a JWT access token
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Token expiry
 * @returns {string} JWT token
 */
function generateAccessToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Generate a JWT refresh token
 * @param {object} payload - Token payload
 * @returns {string} Refresh JWT token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    algorithm: 'HS256',
  });
}

/**
 * Generate a secure random token (hex)
 * @param {number} bytes - Number of bytes
 * @returns {string} Hex token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a token (SHA-256)
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a UUID v4
 * @returns {string} UUID
 */
function generateId() {
  return uuidv4();
}

/**
 * Build pagination object
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} total - Total item count
 * @returns {object} Pagination object
 */
function paginate(page, limit, total) {
  const currentPage = Math.max(1, parseInt(page, 10) || PAGINATION.DEFAULT_PAGE);
  const perPage = Math.min(
    parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const offset = (currentPage - 1) * perPage;
  const totalPages = Math.ceil(total / perPage);

  return {
    currentPage,
    perPage,
    offset,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Remove sensitive fields from user object
 * @param {object} user - Raw user from DB
 * @returns {object} Sanitized user object
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, reset_token, reset_token_expiry, verification_token, ...sanitized } = user;
  return sanitized;
}

/**
 * Calculate percentile of a score among an array of scores
 * @param {number} score - The target score
 * @param {number[]} scores - Array of all scores
 * @returns {number} Percentile (0-100)
 */
function calculatePercentile(score, scores) {
  if (!scores || scores.length === 0) return 50;
  const below = scores.filter((s) => s < score).length;
  return Math.round((below / scores.length) * 100);
}

/**
 * Calculate percentage
 * @param {number} value - Numerator
 * @param {number} total - Denominator
 * @returns {number} Percentage rounded to 1 decimal
 */
function calculatePercentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

/**
 * Format duration from seconds to human readable
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted string like "2h 30m"
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`);
  return parts.join(' ') || '0s';
}

/**
 * Slugify a string
 * @param {string} text - Input text
 * @returns {string} URL-safe slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Pick selected keys from an object
 * @param {object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {object} New object with only picked keys
 */
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
    return acc;
  }, {});
}

/**
 * Omit selected keys from an object
 * @param {object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {object} New object without omitted keys
 */
function omit(obj, keys) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) acc[key] = obj[key];
    return acc;
  }, {});
}

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sleep for given milliseconds
 * @param {number} ms
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse safe JSON (return null on error)
 * @param {string} str
 * @returns {object|null}
 */
function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateSecureToken,
  hashToken,
  generateId,
  paginate,
  sanitizeUser,
  calculatePercentile,
  calculatePercentage,
  formatDuration,
  slugify,
  pick,
  omit,
  clamp,
  sleep,
  safeJSONParse,
};
