const { body, param } = require('express-validator');

const create = [
  body('assetId').isInt({ min: 1 }).withMessage('Valid assetId is required'),
  body('startTime').isISO8601().withMessage('startTime must be a valid ISO datetime'),
  body('endTime').isISO8601().withMessage('endTime must be a valid ISO datetime'),
  body('purpose').optional().trim().isLength({ max: 500 }),
];

const cancel = [
  param('id').isInt({ min: 1 }).withMessage('Booking ID must be a positive integer'),
];

module.exports = { create, cancel };
