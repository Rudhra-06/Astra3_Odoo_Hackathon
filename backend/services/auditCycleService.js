const prisma = require('../config/db');
const AuditCycleRepository = require('../repositories/auditCycleRepository');
const AssetRepository = require('../repositories/assetRepository');
const AuditService = require('./auditService');
const NotificationService = require('./notificationService');
const { NotFoundError, BusinessRuleError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES, AUDIT_CYCLE_STATUS } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const AuditCycleService = {
  create: async (data, req) => {
    const cycle = await AuditCycleRepository.create({
      title: data.title,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      location: data.location || null,
      createdById: req.user?.id || null,
      status: AUDIT_CYCLE_STATUS.PLANNED,
    });

    // Auto-populate audit items based on scope
    const assetWhere = { deletedAt: null };
    if (data.departmentId) assetWhere.departmentId = Number(data.departmentId);
    if (data.location) assetWhere.location = { contains: data.location, mode: 'insensitive' };

    const assets = await prisma.asset.findMany({ where: assetWhere, select: { id: true } });

    if (assets.length > 0) {
      await AuditCycleRepository.createItems(
        assets.map(a => ({
          auditCycleId: cycle.id,
          assetId: a.id,
          assignedToId: req.user?.id || null,
        }))
      );
    }

    await AuditService.log({
      action: AUDIT_ACTIONS.AUDIT_CYCLE_CREATED,
      entityType: ENTITY_TYPES.AUDIT_CYCLE,
      entityId: cycle.id,
      userId: req.user?.id,
      newValue: { title: cycle.title, assetCount: assets.length },
      req,
    });

    return { ...cycle, assetCount: assets.length };
  },

  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = Number(query.departmentId);

    const [cycles, total] = await Promise.all([
      AuditCycleRepository.list({ where, skip, take: limit }),
      AuditCycleRepository.count(where),
    ]);

    return { cycles, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const cycle = await AuditCycleRepository.findById(id);
    if (!cycle) throw new NotFoundError('Audit cycle');
    const stats = await AuditCycleRepository.getStats(id);
    return { ...cycle, stats };
  },

  updateStatus: async (id, status, req) => {
    const cycle = await AuditCycleRepository.findById(id);
    if (!cycle) throw new NotFoundError('Audit cycle');
    const updated = await AuditCycleRepository.update(id, { status });

    if (status === AUDIT_CYCLE_STATUS.COMPLETED) {
      await AuditService.log({
        action: AUDIT_ACTIONS.AUDIT_CYCLE_COMPLETED,
        entityType: ENTITY_TYPES.AUDIT_CYCLE,
        entityId: id,
        userId: req.user?.id,
        req,
      });
    }

    return updated;
  },

  verifyItem: async (itemId, { verificationStatus, notes }, req) => {
    const item = await AuditCycleRepository.findItem(itemId);
    if (!item) throw new NotFoundError('Audit item');

    const updated = await AuditCycleRepository.updateItem(itemId, {
      verificationStatus,
      notes: notes || null,
      verifiedAt: new Date(),
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.AUDIT_ITEM_VERIFIED,
      entityType: ENTITY_TYPES.AUDIT_ITEM,
      entityId: itemId,
      userId: req.user?.id,
      oldValue: { verificationStatus: item.verificationStatus },
      newValue: { verificationStatus, notes },
      req,
    });

    return updated;
  },

  getDiscrepancyReport: async (id) => {
    const cycle = await AuditCycleRepository.findById(id);
    if (!cycle) throw new NotFoundError('Audit cycle');
    const stats = await AuditCycleRepository.getStats(id);
    const discrepancies = cycle.items.filter(i =>
      ['MISSING', 'DAMAGED', 'DISPOSED'].includes(i.verificationStatus)
    );
    return { cycle, stats, discrepancies };
  },
};

module.exports = AuditCycleService;
