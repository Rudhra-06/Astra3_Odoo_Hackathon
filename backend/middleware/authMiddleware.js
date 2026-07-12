const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../errors');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Session expired. Please log in again.'));
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return next(new AuthenticationError('Invalid token. Please log in again.'));
    }

    return next(new AuthenticationError('Authentication failed. Please log in again.'));
  }
};
