const { body, param } = require('express-validator');

const allocate = [
  body('assetId').isInt({ min: 1 }).withMessage('Valid assetId is required'),
  body('allocatedToUserId').optional().isInt({ min: 1 }),
  body('allocatedToDeptId').optional().isInt({ min: 1 }),
  body('expectedReturnDate').optional().isISO8601().withMessage('expectedReturnDate must be a valid ISO date'),
  body('notes').optional().trim().isLength({ max: 500 }),
];

const transferRequest = [
  body('assetId').isInt({ min: 1 }).withMessage('Valid assetId is required'),
  body('toUserId').isInt({ min: 1 }).withMessage('Valid toUserId is required'),
  body('reason').optional().trim().isLength({ max: 500 }),
];

const returnAsset = [
  param('id').isInt({ min: 1 }).withMessage('Allocation ID must be a positive integer'),
  body('conditionNotes').optional().trim().isLength({ max: 500 }),
];

const transferAction = [
  param('id').isInt({ min: 1 }).withMessage('Transfer ID must be a positive integer'),
];

module.exports = { allocate, transferRequest, returnAsset, transferAction };
