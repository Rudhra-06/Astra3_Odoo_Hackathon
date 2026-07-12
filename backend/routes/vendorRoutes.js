const router = require('express').Router();
const ctrl = require('../controllers/vendorController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../constants');

const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

router.post('/', auth, authorize(...managers), ctrl.createVendor);
router.get('/', auth, ctrl.listVendors);
router.get('/:id', auth, ctrl.getVendorById);
router.patch('/:id', auth, authorize(...managers), ctrl.updateVendor);
router.delete('/:id', auth, authorize(ROLES.ADMIN), ctrl.deleteVendor);

module.exports = router;
