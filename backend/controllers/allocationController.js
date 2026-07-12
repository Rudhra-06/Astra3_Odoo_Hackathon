const AllocationService = require('../services/allocationService');
const { success, created } = require('../utils/response');

async function allocateAsset(req, res, next) {
  try {
    const allocation = await AllocationService.allocate(req.body, req);
    created(res, { allocation }, 'Asset allocated successfully');
  } catch (err) {
    next(err);
  }
}

async function returnAsset(req, res, next) {
  try {
    const allocation = await AllocationService.returnAsset(
      req.params.id,
      req.body.conditionNotes,
      req
    );
    success(res, { allocation }, 'Asset returned successfully');
  } catch (err) {
    next(err);
  }
}

async function requestTransfer(req, res, next) {
  try {
    const transfer = await AllocationService.requestTransfer(req.body, req);
    created(res, { transfer }, 'Transfer request submitted');
  } catch (err) {
    next(err);
  }
}

async function approveTransfer(req, res, next) {
  try {
    const result = await AllocationService.approveTransfer(req.params.id, req);
    success(res, result, 'Transfer approved and completed');
  } catch (err) {
    next(err);
  }
}

async function rejectTransfer(req, res, next) {
  try {
    const transfer = await AllocationService.rejectTransfer(
      req.params.id,
      req.body.rejectionNote,
      req
    );
    success(res, { transfer }, 'Transfer request rejected');
  } catch (err) {
    next(err);
  }
}

async function getOverdueAllocations(req, res, next) {
  try {
    const allocations = await AllocationService.getOverdue();
    success(res, { allocations });
  } catch (err) {
    next(err);
  }
}

async function getAllocationHistory(req, res, next) {
  try {
    const history = await AllocationService.getHistory(req.params.assetId);
    success(res, { history });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  getOverdueAllocations,
  getAllocationHistory,
};
