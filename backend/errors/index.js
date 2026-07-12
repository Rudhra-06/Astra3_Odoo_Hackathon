const { HTTP } = require('../constants');

class AppError extends Error {
  constructor(message, statusCode, errorCode, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, HTTP.UNPROCESSABLE, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HTTP.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HTTP.FORBIDDEN, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP.NOT_FOUND, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message, details = []) {
    super(message, HTTP.CONFLICT, 'CONFLICT', details);
  }
}

class BusinessRuleError extends AppError {
  constructor(message, details = []) {
    super(message, HTTP.BAD_REQUEST, 'BUSINESS_RULE_VIOLATION', details);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'A database error occurred') {
    super(message, HTTP.INTERNAL, 'DATABASE_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  DatabaseError,
};
