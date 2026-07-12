const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

/**
 * Runs after express-validator chains.
 * Collects all errors and throws a single ValidationError.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }));
    return next(new ValidationError('Request validation failed', details));
  }
  next();
};

module.exports = validate;
