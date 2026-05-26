'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Verify JWT and attach user to req
 * Required authentication — rejects if no/invalid token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
        algorithms: ['HS256'],
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired — please login again');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Check if authenticated user has admin role
 * Must be used AFTER authenticate middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
}

/**
 * Check if authenticated user has strictly admin role (not moderator)
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Super admin access required'));
  }

  next();
}

/**
 * Optional authentication — attach user if token present, continue without if not
 * Use for routes that behave differently for authenticated vs guest users
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token — continue as guest
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
        algorithms: ['HS256'],
      });

      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    } catch {
      // Invalid token — continue as guest (don't throw)
    }

    next();
  } catch (err) {
    next(); // On any error, continue as guest
  }
}

/**
 * Verify user owns the resource or is admin
 * Middleware factory — specify the userId field in req.params or req.body
 */
function requireOwnerOrAdmin(userIdParam = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];

    if (req.user.id !== targetUserId && req.user.role !== 'admin') {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

module.exports = { authenticate, requireAdmin, requireSuperAdmin, optionalAuth, requireOwnerOrAdmin };
