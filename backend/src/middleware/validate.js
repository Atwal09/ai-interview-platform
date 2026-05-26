'use strict';

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Simple middleware — reads express-validator results already run by preceding validators.
 * Usage in route: router.post('/path', [...validators], validate, controller)
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));

  return next(new ValidationError('Validation failed', formattedErrors));
}

module.exports = validate;
