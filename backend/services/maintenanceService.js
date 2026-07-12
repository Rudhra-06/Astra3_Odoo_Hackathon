const MaintenanceRepository = require('../repositories/maintenanceRepository');
const AssetRepository = require('../repositories/assetRepository');
const AuditService = require('./auditService');
const NotificationService = require('./notificationService');
const { NotFoundError, BusinessRuleError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES, ASSET_STATUS, MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const VALID_TRANSITIONS = {
  SCHEDULED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['COMPLETED', 'IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
};

const MaintenanceService = {
  schedule: async (data, req) => {
    const asset = await AssetRepository.findById(data.assetId);
    if (!asset) throw new NotFoundError('Asset');

    if (asset.status === ASSET_STATUS.DISPOSED || asset.status === ASSET_STATUS.RETIRED) {
      throw new BusinessRuleError(`Cannot schedule maintenance for a '${asset.status}' asset`);
    }

    const record = await MaintenanceRepository.create({
      assetId: Number(data.assetId),
      scheduledDate: new Date(data.scheduledDate),
      description: data.description,
      priority: data.priority || MAINTENANCE_PRIORITY.MEDIUM,
      vendor: data.vendor || null,
      estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : null,
      technicianName: data.technicianName || null,
      scheduledById: req.user?.id || null,
      status: MAINTENANCE_STATUS.SCHEDULED,
    });

    await AssetRepository.updateStatus(data.assetId, ASSET_STATUS.UNDER_MAINTENANCE);

    await AuditService.log({
      action: AUDIT_ACTIONS.MAINTENANCE_SCHEDULED,
      entityType: ENTITY_TYPES.MAINTENANCE,
      entityId: record.id,
      userId: req.user?.id,
      newValue: { assetId: data.assetId, scheduledDate: data.scheduledDate, priority: data.priority },
      req,
    });

    return record;
  },

  updateStatus: async (id, { status, actualCost, completionNotes, technicianNotes, resolutionNotes, technicianName, assignedToId, repairCost, downtimeHours }, req) => {
    const record = await MaintenanceRepository.findById(id);
    if (!record) throw new NotFoundError('Maintenance record');

    const allowed = VALID_TRANSITIONS[record.status] || [];
    if (!allowed.includes(status)) {
      throw new BusinessRuleError(`Cannot transition from '${record.status}' to '${status}'. Allowed: ${allowed.join(', ')}`);
    }

    const updateData = { status };
    if (actualCost !== undefined) updateData.actualCost = Number(actualCost);
    if (repairCost !== undefined) updateData.repairCost = Number(repairCost);
    if (downtimeHours !== undefined) updateData.downtimeHours = Number(downtimeHours);
    if (completionNotes) updateData.completionNotes = completionNotes;
    if (technicianNotes) updateData.technicianNotes = technicianNotes;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (technicianName) updateData.technicianName = technicianName;
    if (assignedToId) updateData.assignedToId = Number(assignedToId);
    if (status === MAINTENANCE_STATUS.COMPLETED || status === MAINTENANCE_STATUS.RESOLVED) {
      updateData.completedDate = new Date();
    }

    const updated = await MaintenanceRepository.update(id, updateData);

    if (status === MAINTENANCE_STATUS.COMPLETED) {
      await AssetRepository.updateStatus(record.assetId, ASSET_STATUS.AVAILABLE);
    }

    await AuditService.log({
      action: AUDIT_ACTIONS.MAINTENANCE_UPDATED,
      entityType: ENTITY_TYPES.MAINTENANCE,
      entityId: id,
      userId: req.user?.id,
      oldValue: { status: record.status },
      newValue: { status, actualCost, completionNotes },
      req,
    });

    return updated;
  },

  // Keep backward-compatible complete method
  complete: async (id, data, req) => MaintenanceService.updateStatus(id, data, req),

  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};
    if (query.assetId) where.assetId = Number(query.assetId);
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.dateFrom) where.scheduledDate = { gte: new Date(query.dateFrom) };
    if (query.dateTo) where.scheduledDate = { ...where.scheduledDate, lte: new Date(query.dateTo) };

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder === 'asc' ? 'asc' : 'desc' }
      : { scheduledDate: 'asc' };

    const [records, total] = await Promise.all([
      MaintenanceRepository.list({ where, skip, take: limit, orderBy }),
      MaintenanceRepository.count(where),
    ]);

    return { records, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const record = await MaintenanceRepository.findById(id);
    if (!record) throw new NotFoundError('Maintenance record');
    return record;
  },

  getDashboard: async () => {
    const [byStatus, byPriority, recentCompleted, upcoming] = await Promise.all([
      require('../config/db').maintenanceRecord.groupBy({ by: ['status'], _count: { id: true } }),
      require('../config/db').maintenanceRecord.groupBy({ by: ['priority'], _count: { id: true } }),
      require('../config/db').maintenanceRecord.findMany({
        where: { status: MAINTENANCE_STATUS.COMPLETED },
        take: 5,
        orderBy: { completedDate: 'desc' },
        include: { asset: { select: { assetTag: true, name: true } } },
      }),
      require('../config/db').maintenanceRecord.findMany({
        where: { status: { in: ['SCHEDULED', 'APPROVED', 'ASSIGNED'] }, scheduledDate: { gte: new Date() } },
        take: 5,
        orderBy: { scheduledDate: 'asc' },
        include: { asset: { select: { assetTag: true, name: true } } },
      }),
    ]);
    return { byStatus, byPriority, recentCompleted, upcoming };
  },
};

module.exports = MaintenanceService;
