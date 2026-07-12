const logger = require('../utils/logger');
const { AppError } = require('../errors');
const { HTTP } = require('../constants');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  const requestId = req.requestId;

  if (err.isOperational) {
    logger.warn('Operational error', {
      requestId,
      errorCode: err.errorCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      timestamp: new Date().toISOString(),
      requestId,
      details: err.details || [],
    });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    logger.warn('Unique constraint violation', { requestId, field });
    return res.status(HTTP.CONFLICT).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errorCode: 'DUPLICATE_ENTRY',
      timestamp: new Date().toISOString(),
      requestId,
      details: [{ field }],
    });
  }

  if (err.code === 'P2025') {
    return res.status(HTTP.NOT_FOUND).json({
      success: false,
      message: 'Record not found',
      errorCode: 'NOT_FOUND',
      timestamp: new Date().toISOString(),
      requestId,
      details: [],
    });
  }

  if (err.code === 'P2003') {
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      message: 'Referenced record does not exist',
      errorCode: 'FOREIGN_KEY_VIOLATION',
      timestamp: new Date().toISOString(),
      requestId,
      details: [],
    });
  }

  // Unknown / programming errors — never expose internals
  logger.error('Unhandled error', {
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(HTTP.INTERNAL).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    errorCode: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    requestId,
    details: [],
  });
};
