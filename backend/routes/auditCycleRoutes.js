const router = require('express').Router();
const ctrl = require('../controllers/auditCycleController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../constants');

const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

router.post('/', auth, authorize(...managers), ctrl.createCycle);
router.get('/', auth, ctrl.listCycles);
router.get('/:id', auth, ctrl.getCycleById);
router.patch('/:id/status', auth, authorize(...managers), ctrl.updateCycleStatus);
router.patch('/items/:itemId/verify', auth, ctrl.verifyItem);
router.get('/:id/discrepancy-report', auth, authorize(...managers), ctrl.getDiscrepancyReport);

module.exports = router;
