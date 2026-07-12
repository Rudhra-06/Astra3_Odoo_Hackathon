const { body, param } = require('express-validator');
const { MAINTENANCE_STATUS } = require('../constants');

const schedule = [
  body('assetId').isInt({ min: 1 }).withMessage('Valid assetId is required'),
  body('scheduledDate').isISO8601().withMessage('scheduledDate must be a valid ISO date'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  body('vendor').optional().trim().isLength({ max: 200 }),
  body('estimatedCost').optional().isFloat({ min: 0 }),
];

const complete = [
  param('id').isInt({ min: 1 }),
  body('actualCost').optional().isFloat({ min: 0 }),
  body('completionNotes').optional().trim().isLength({ max: 1000 }),
  body('status')
    .isIn([MAINTENANCE_STATUS.COMPLETED, MAINTENANCE_STATUS.CANCELLED])
    .withMessage('Status must be COMPLETED or CANCELLED'),
];

module.exports = { schedule, complete };
