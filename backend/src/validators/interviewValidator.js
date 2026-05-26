const { body } = require('express-validator');

exports.interviewValidator = [
  body('type').isIn(['hr', 'technical', 'behavioral', 'domain_specific', 'mixed']).withMessage('Invalid interview type'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('questionCount').optional().isInt({ min: 3, max: 20 }).withMessage('Question count must be 3-20'),
  body('durationMinutes').optional().isInt({ min: 5, max: 120 }).withMessage('Duration must be 5-120 minutes'),
];

exports.responseValidator = [
  body('questionId').isUUID().withMessage('Valid question ID required'),
  body('transcript').optional().isString().isLength({ max: 5000 }),
];
