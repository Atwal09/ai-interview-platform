'use strict';

const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

/**
 * Registration validation
 */
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email is too long'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters'),

  body('role')
    .optional()
    .isIn(['user', 'recruiter', 'admin'])
    .withMessage('Invalid role'),
];

/**
 * Login validation
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),
];

/**
 * Forgot password validation
 */
const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

/**
 * Reset password validation
 */
const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid reset token'),

  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

/**
 * Update profile validation
 */
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s()-]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),

  body('linkedin_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL')
    .contains('linkedin.com')
    .withMessage('Must be a LinkedIn URL'),

  body('github_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid GitHub URL')
    .contains('github.com')
    .withMessage('Must be a GitHub URL'),
];

/**
 * Change password validation
 */
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/[A-Z]/)
    .withMessage('Must contain uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Must contain lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Must contain a number'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
};
