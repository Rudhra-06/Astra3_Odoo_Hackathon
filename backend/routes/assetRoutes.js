const router = require('express').Router();
const ctrl = require('../controllers/assetController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const v = require('../validators/assetValidators');
const { ROLES } = require('../constants');

const managers = [ROLES.ADMIN, ROLES.ASSET_MANAGER];

/**
 * @swagger
 * /api/assets:
 *   post:
 *     tags: [Assets]
 *     summary: Register a new asset
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, v.register, validate, ctrl.registerAsset);
router.get('/', auth, v.search, validate, ctrl.searchAssets);
router.get('/warranty-alerts', auth, authorize(...managers), ctrl.getWarrantyAlerts);
router.get('/qr/lookup/:qrCode', auth, ctrl.lookupByQR);
router.get('/:id', auth, ctrl.getAssetById);
router.get('/:id/passport', auth, ctrl.getAssetPassport);
router.get('/:id/timeline', auth, ctrl.getAssetTimeline);
router.get('/:id/qr/download', auth, ctrl.downloadQR);
router.patch('/:id', auth, authorize(...managers), v.update, validate, ctrl.updateAsset);
router.patch('/:id/status', auth, authorize(...managers), v.updateStatus, validate, ctrl.updateAssetStatus);
router.post('/:id/qr/regenerate', auth, authorize(...managers), ctrl.regenerateQR);

module.exports = router;
