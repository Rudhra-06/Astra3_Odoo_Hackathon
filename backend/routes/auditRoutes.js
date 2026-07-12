const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../constants');

router.get('/', auth, authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), ctrl.listAuditLogs);

module.exports = router;
