const express = require('express');
const router = express.Router();
const {
  registerAsset,
  searchAssets,
  getAssetById,
  updateAssetStatus,
} = require('../controllers/assetController');

router.post('/', registerAsset);
router.get('/', searchAssets);
router.get('/:id', getAssetById);
router.patch('/:id/status', updateAssetStatus);

module.exports = router;