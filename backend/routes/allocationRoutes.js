const express = require('express');
const router = express.Router();
const {
  allocateAsset,
  requestTransfer,
  approveTransfer,
  returnAsset,
  getOverdueAllocations,
} = require('../controllers/allocationController');

router.post('/', allocateAsset);
router.post('/transfer-request', requestTransfer);
router.patch('/transfer/:id/approve', approveTransfer);
router.post('/:id/return', returnAsset);
router.get('/overdue', getOverdueAllocations);

module.exports = router;