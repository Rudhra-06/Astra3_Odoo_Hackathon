const prisma = require('../config/db');
const AllocationRepository = require('../repositories/allocationRepository');
const TransferRepository = require('../repositories/transferRepository');
const AssetRepository = require('../repositories/assetRepository');
const AuditService = require('./auditService');
const NotificationService = require('./notificationService');
const { NotFoundError, ConflictError, BusinessRuleError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES, ASSET_STATUS } = require('../constants');

const AllocationService = {
  allocate: async ({ assetId, allocatedToUserId, allocatedToDeptId, expectedReturnDate, notes }, req) => {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset');

    if (asset.status !== ASSET_STATUS.AVAILABLE && asset.status !== ASSET_STATUS.RESERVED) {
      throw new BusinessRuleError(`Asset is currently '${asset.status}' and cannot be allocated`);
    }

    const existing = await AllocationRepository.getActive(assetId);
    if (existing) {
      throw new ConflictError('Asset is already allocated', [
        { currentHolder: existing.allocatedToUser?.name || 'another department' },
      ]);
    }

    const allocation = await AllocationRepository.create({
      assetId: Number(assetId),
      allocatedToUserId: allocatedToUserId ? Number(allocatedToUserId) : null,
      allocatedToDeptId: allocatedToDeptId ? Number(allocatedToDeptId) : null,
      allocatedByUserId: req.user?.id || null,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
      conditionAtIssue: asset.condition,
      conditionNotes: notes || null,
    });

    await AssetRepository.updateStatus(assetId, ASSET_STATUS.ALLOCATED);

    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_ALLOCATED,
      entityType: ENTITY_TYPES.ALLOCATION,
      entityId: allocation.id,
      userId: req.user?.id,
      newValue: { assetId, allocatedToUserId, allocatedToDeptId },
      req,
    });

    if (allocatedToUserId) {
      await NotificationService.send({
        userId: allocatedToUserId,
        title: 'Asset Allocated to You',
        message: `Asset "${asset.name}" (${asset.assetTag}) has been allocated to you.`,
        type: 'ALLOCATION',
        entityType: ENTITY_TYPES.ASSET,
        entityId: assetId,
      });
    }

    return allocation;
  },

  returnAsset: async (allocationId, conditionNotes, req) => {
    const allocation = await AllocationRepository.findById(allocationId);
    if (!allocation) throw new NotFoundError('Allocation');
    if (!allocation.isActive) throw new BusinessRuleError('This allocation is already closed');

    const returned = await AllocationRepository.markReturned(allocationId, conditionNotes);
    await AssetRepository.updateStatus(allocation.assetId, ASSET_STATUS.AVAILABLE);

    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_RETURNED,
      entityType: ENTITY_TYPES.ALLOCATION,
      entityId: allocationId,
      userId: req.user?.id,
      oldValue: { isActive: true },
      newValue: { isActive: false, conditionNotes },
      req,
    });

    return returned;
  },

  requestTransfer: async ({ assetId, toUserId, reason }, req) => {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset');

    const pending = await TransferRepository.findPendingForAsset(assetId);
    if (pending) throw new ConflictError('A transfer request is already pending for this asset');

    const activeAllocation = await AllocationRepository.getActive(assetId);

    const transfer = await TransferRepository.create({
      assetId: Number(assetId),
      fromUserId: activeAllocation?.allocatedToUserId || null,
      toUserId: Number(toUserId),
      requestedById: req.user?.id || null,
      reason: reason || null,
      status: 'REQUESTED',
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.TRANSFER_REQUESTED,
      entityType: ENTITY_TYPES.TRANSFER,
      entityId: transfer.id,
      userId: req.user?.id,
      newValue: { assetId, toUserId, reason },
      req,
    });

    return transfer;
  },

  approveTransfer: async (transferId, req) => {
    const transfer = await TransferRepository.findById(transferId);
    if (!transfer) throw new NotFoundError('Transfer request');
    if (transfer.status !== 'REQUESTED') {
      throw new BusinessRuleError(`Transfer is already '${transfer.status}'`);
    }

    // Execute atomically
    const [, , newAllocation] = await prisma.$transaction(async (tx) => {
      const updated = await tx.transferRequest.update({
        where: { id: Number(transferId) },
        data: { status: 'APPROVED', resolvedAt: new Date() },
      });

      const oldAllocation = await tx.allocation.findFirst({
        where: { assetId: transfer.assetId, isActive: true },
      });

      let closed = null;
      if (oldAllocation) {
        closed = await tx.allocation.update({
          where: { id: oldAllocation.id },
          data: { isActive: false, actualReturnDate: new Date(), conditionNotes: 'Transferred' },
        });
      }

      const created = await tx.allocation.create({
        data: {
          assetId: transfer.assetId,
          allocatedToUserId: transfer.toUserId,
          allocatedByUserId: req.user?.id || null,
          isActive: true,
        },
      });

      await tx.transferRequest.update({
        where: { id: Number(transferId) },
        data: { status: 'COMPLETED' },
      });

      return [updated, closed, created];
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.TRANSFER_APPROVED,
      entityType: ENTITY_TYPES.TRANSFER,
      entityId: transferId,
      userId: req.user?.id,
      oldValue: { status: 'REQUESTED' },
      newValue: { status: 'COMPLETED', toUserId: transfer.toUserId },
      req,
    });

    if (transfer.toUserId) {
      await NotificationService.send({
        userId: transfer.toUserId,
        title: 'Asset Transfer Approved',
        message: `Asset "${transfer.asset.name}" has been transferred to you.`,
        type: 'TRANSFER',
        entityType: ENTITY_TYPES.ASSET,
        entityId: transfer.assetId,
      });
    }

    return { transfer, newAllocation };
  },

  rejectTransfer: async (transferId, rejectionNote, req) => {
    const transfer = await TransferRepository.findById(transferId);
    if (!transfer) throw new NotFoundError('Transfer request');
    if (transfer.status !== 'REQUESTED') {
      throw new BusinessRuleError(`Transfer is already '${transfer.status}'`);
    }

    const updated = await TransferRepository.update(transferId, {
      status: 'REJECTED',
      rejectionNote: rejectionNote || null,
      resolvedAt: new Date(),
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.TRANSFER_REJECTED,
      entityType: ENTITY_TYPES.TRANSFER,
      entityId: transferId,
      userId: req.user?.id,
      oldValue: { status: 'REQUESTED' },
      newValue: { status: 'REJECTED', rejectionNote },
      req,
    });

    return updated;
  },

  getOverdue: () => AllocationRepository.getOverdue(),

  getHistory: (assetId) => AllocationRepository.history(assetId),
};

module.exports = AllocationService;
