const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../constants');

const elevated = [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD];

// GET /api/reports/:type/:format
// type: assets | maintenance | bookings | warranty | allocations
// format: excel | csv | pdf
router.get('/:type/:format', auth, authorize(...elevated), ctrl.generateReport);

module.exports = router;
