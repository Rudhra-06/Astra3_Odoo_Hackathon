const { body, query, param } = require('express-validator');
const { ASSET_STATUS } = require('../constants');

const register = [
  body('name').trim().notEmpty().withMessage('Asset name is required').isLength({ max: 200 }),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid categoryId is required'),
  body('serialNumber').optional().trim().isLength({ max: 100 }),
  body('acquisitionDate').optional().isISO8601().withMessage('acquisitionDate must be a valid ISO date'),
  body('acquisitionCost').optional().isFloat({ min: 0 }).withMessage('acquisitionCost must be a non-negative number'),
  body('condition').optional().trim().isLength({ max: 50 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('isBookable').optional().isBoolean(),
  body('photoUrl').optional().isURL().withMessage('photoUrl must be a valid URL'),
];

const updateStatus = [
  param('id').isInt({ min: 1 }).withMessage('Asset ID must be a positive integer'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ASSET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ASSET_STATUS).join(', ')}`),
];

const search = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(Object.values(ASSET_STATUS)),
  query('categoryId').optional().isInt({ min: 1 }),
];

const update = [
  param('id').isInt({ min: 1 }).withMessage('Asset ID must be a positive integer'),
  body('name').optional().trim().notEmpty().isLength({ max: 200 }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('condition').optional().trim().isLength({ max: 50 }),
  body('acquisitionCost').optional().isFloat({ min: 0 }),
  body('isBookable').optional().isBoolean(),
  body('photoUrl').optional().isURL(),
];

module.exports = { register, updateStatus, search, update };
