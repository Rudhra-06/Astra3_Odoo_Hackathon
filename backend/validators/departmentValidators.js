const { body, param } = require('express-validator');
const { ROLES } = require('../constants');

const create = [
  body('name').trim().notEmpty().withMessage('Department name is required').isLength({ max: 100 }),
  body('parentId').optional().isInt({ min: 1 }),
  body('headId').optional().isInt({ min: 1 }),
];

const update = [
  param('id').isInt({ min: 1 }),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('parentId').optional().isInt({ min: 1 }),
  body('headId').optional().isInt({ min: 1 }),
];

const updateUserRole = [
  param('id').isInt({ min: 1 }),
  body('role')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

module.exports = { create, update, updateUserRole };
