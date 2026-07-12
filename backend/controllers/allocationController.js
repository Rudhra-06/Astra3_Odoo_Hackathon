const prisma = require('../config/db');
const AssetModel = require('../models/assetModel');
const AllocationModel = require('../models/allocationModel');

// POST /api/allocations
async function allocateAsset(req, res) {
  try {
    const { assetId, allocatedToUserId, allocatedToDeptId, expectedReturnDate } = req.body;

    if (!assetId || (!allocatedToUserId && !allocatedToDeptId)) {
      return res.status(400).json({ error: 'assetId and a target user/department are required' });
    }

    const existing = await AllocationModel.getActiveAllocation(assetId);
    if (existing) {
      return res.status(409).json({
        error: 'Asset already allocated',
        currentlyHeldBy: existing.allocatedToUser?.name || 'another department',
        suggestion: 'transfer_request',
      });
    }

    const allocation = await AllocationModel.create({
      assetId: Number(assetId),
      allocatedToUserId: allocatedToUserId ? Number(allocatedToUserId) : null,
      allocatedToDeptId: allocatedToDeptId ? Number(allocatedToDeptId) : null,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
    });

    await AssetModel.updateStatus(assetId, 'ALLOCATED');

    res.status(201).json(allocation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Allocation failed' });
  }
}

// POST /api/allocations/transfer-request
async function requestTransfer(req, res) {
  try {
    const { assetId, toUserId } = req.body;
    const asset = await AssetModel.findById(assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const activeAllocation = await AllocationModel.getActiveAllocation(assetId);

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId: Number(assetId),
        fromUserId: activeAllocation?.allocatedToUserId || null,
        toUserId: Number(toUserId),
        status: 'REQUESTED',
      },
    });

    res.status(201).json(transfer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transfer request failed' });
  }
}

// PATCH /api/allocations/transfer/:id/approve
async function approveTransfer(req, res) {
  try {
    const transfer = await prisma.transferRequest.update({
      where: { id: Number(req.params.id) },
      data: { status: 'APPROVED', resolvedAt: new Date() },
    });

    // close old allocation
    const oldAllocation = await AllocationModel.getActiveAllocation(transfer.assetId);
    if (oldAllocation) {
      await AllocationModel.markReturned(oldAllocation.id, 'Transferred');
    }

    // create new allocation
    const newAllocation = await AllocationModel.create({
      assetId: transfer.assetId,
      allocatedToUserId: transfer.toUserId,
    });

    await prisma.transferRequest.update({
      where: { id: transfer.id },
      data: { status: 'COMPLETED' },
    });

    res.json({ transfer, newAllocation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transfer approval failed' });
  }
}

// POST /api/allocations/:id/return
async function returnAsset(req, res) {
  try {
    const { conditionNotes } = req.body;
    const allocation = await AllocationModel.markReturned(req.params.id, conditionNotes);
    await AssetModel.updateStatus(allocation.assetId, 'AVAILABLE');
    res.json(allocation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Return failed' });
  }
}

// GET /api/allocations/overdue
async function getOverdueAllocations(req, res) {
  try {
    const overdue = await AllocationModel.getOverdue();
    res.json(overdue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch overdue allocations' });
  }
}

module.exports = {
  allocateAsset,
  requestTransfer,
  approveTransfer,
  returnAsset,
  getOverdueAllocations,
};