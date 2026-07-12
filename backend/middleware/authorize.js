const { AuthorizationError } = require('../errors');

/**
 * Authorize middleware — must be used AFTER authMiddleware.
 * Usage: authorize('ADMIN', 'ASSET_MANAGER')
 */
const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(
        `Role '${req.user.role}' is not permitted to perform this action`
      ));
    }
    next();
  };

module.exports = authorize;
