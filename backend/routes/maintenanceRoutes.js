const router = require('express').Router();
const ctrl = require('../controllers/maintenanceController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const v = require('../validators/maintenanceValidators');
const { ROLES } = require('../constants');

const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];
const elevated = [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD];

router.post('/', auth, authorize(...managers), v.schedule, validate, ctrl.scheduleMaintenance);
router.get('/', auth, ctrl.listMaintenance);
router.get('/dashboard', auth, authorize(...managers), ctrl.getMaintenanceDashboard);
router.get('/:id', auth, ctrl.getMaintenanceById);
router.patch('/:id/status', auth, authorize(...elevated), ctrl.updateMaintenanceStatus);
router.patch('/:id/complete', auth, authorize(...managers), v.complete, validate, ctrl.completeMaintenance);

module.exports = router;
