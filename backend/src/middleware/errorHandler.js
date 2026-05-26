'use strict';

const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

/**
 * Centralized error handler middleware
 * Must be the last middleware registered in Express
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log all errors
  logger.error('Error caught by handler', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: isDevelopment ? err.stack : undefined,
  });

  // Default response structure
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  // Handle custom AppError subclasses
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Handle express-validator errors (passed manually via validate middleware)
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    message = err.message || 'Validation failed';
    errors = err.errors;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired — please login again';
  }
  // Handle Multer errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large — maximum size exceeded';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files uploaded';
  }
  // Handle PostgreSQL errors
  else if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists (duplicate entry)';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference — related resource does not exist';
  } else if (err.code === '23502') {
    statusCode = 400;
    message = 'Required field is missing';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }
  // Handle Syntax errors (bad JSON body)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  const responseBody = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(isDevelopment && {
      debug: {
        name: err.name,
        stack: err.stack,
      },
    }),
  };

  res.status(statusCode).json(responseBody);
}

/**
 * 404 handler — for unmatched routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
