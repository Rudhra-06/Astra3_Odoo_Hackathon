const router = require('express').Router();
const ctrl = require('../controllers/allocationController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const v = require('../validators/allocationValidators');
const { ROLES } = require('../constants');

const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];
const elevated = [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD];

router.post('/', auth, authorize(...managers), v.allocate, validate, ctrl.allocateAsset);
router.post('/:id/return', auth, authorize(...elevated), v.returnAsset, validate, ctrl.returnAsset);
router.post('/transfer-request', auth, v.transferRequest, validate, ctrl.requestTransfer);
router.patch('/transfer/:id/approve', auth, authorize(...managers), v.transferAction, validate, ctrl.approveTransfer);
router.patch('/transfer/:id/reject', auth, authorize(...managers), v.transferAction, validate, ctrl.rejectTransfer);
router.get('/overdue', auth, authorize(...managers), ctrl.getOverdueAllocations);
router.get('/history/:assetId', auth, ctrl.getAllocationHistory);

module.exports = router;
