'use strict';

const { body, param } = require('express-validator');

/**
 * Resume upload validation (used alongside multer middleware)
 */
const uploadResumeValidator = [
  body('job_role')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job role must be 2-100 characters'),
];

/**
 * Resume ID param validation
 */
const resumeIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Resume ID is required')
    .isUUID()
    .withMessage('Invalid resume ID format'),
];

module.exports = { uploadResumeValidator, resumeIdValidator };
