'use strict';

const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

/**
 * Standard rate limit message factory
 */
function rateLimitMessage(limitName) {
  return (req, res) => {
    logger.warn(`Rate limit hit: ${limitName}`, {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests — please slow down and try again later',
      retryAfter: res.getHeader('Retry-After'),
    });
  };
}

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage('API'),
  keyGenerator: (req) => req.ip,
});

/**
 * Strict auth rate limiter
 * 10 requests per 15 minutes (login/register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage('Auth'),
  keyGenerator: (req) => req.ip,
  skipSuccessfulRequests: false,
});

/**
 * File upload rate limiter
 * 5 uploads per hour
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage('Upload'),
  keyGenerator: (req) => req.ip,
});

/**
 * AI/Gemini API call rate limiter
 * 20 requests per hour per user
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage('AI'),
  keyGenerator: (req) => req.user?.id || req.ip,
});

/**
 * Password reset rate limiter
 * 3 requests per 15 minutes
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage('PasswordReset'),
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  passwordResetLimiter,
};
