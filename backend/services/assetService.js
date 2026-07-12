const AssetRepository = require('../repositories/assetRepository');
const AuditService = require('./auditService');
const QRService = require('../utils/qrService');
const prisma = require('../config/db');
const { NotFoundError, BusinessRuleError } = require('../errors');
const { canTransition } = require('../utils/assetStateMachine');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function generateAssetTag() {
  const last = await AssetRepository.findLastAsset();
  const next = last ? last.id + 1 : 1;
  return `AF-${String(next).padStart(4, '0')}`;
}

const AssetService = {
  register: async (data, req) => {
    const assetTag = await generateAssetTag();
    const qrCode = QRService.generateCode();

    let categoryId = data.categoryId ?? data.category?.id ?? data.category?.categoryId;
    if (categoryId === undefined || categoryId === null || categoryId === '' || Number.isNaN(Number(categoryId))) {
      if (typeof data.category === 'string' && data.category.trim()) {
        const match = await prisma.assetCategory.findFirst({ where: { name: data.category.trim() } });
        if (match) categoryId = match.id;
      }
    }

    const fallbackCategory = await prisma.assetCategory.findFirst({ orderBy: { id: 'asc' } });
    const normalizedCategoryId = Number.isFinite(Number(categoryId)) && Number(categoryId) > 0 ? Number(categoryId) : fallbackCategory?.id || 1;

    const asset = await AssetRepository.create({
      assetTag,
      name: data.name,
      categoryId: normalizedCategoryId,
      serialNumber: data.serialNumber || null,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
      acquisitionCost: data.acquisitionCost ? Number(data.acquisitionCost) : null,
      condition: data.condition || null,
      location: data.location || null,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      isBookable: data.isBookable ?? data.bookable ?? false,
      photoUrl: data.photoUrl || null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      warrantyStart: data.warrantyStart ? new Date(data.warrantyStart) : null,
      vendorId: data.vendorId ? Number(data.vendorId) : null,
      amcExpiry: data.amcExpiry ? new Date(data.amcExpiry) : null,
      invoiceNumber: data.invoiceNumber || null,
      customFields: data.customFields || null,
      qrCode,
    });

    const qrCodeUrl = await QRService.generateDataUrl(asset.id, qrCode);
    const updated = await AssetRepository.update(asset.id, { qrCodeUrl });

    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_CREATED,
      entityType: ENTITY_TYPES.ASSET,
      entityId: asset.id,
      userId: req.user?.id,
      newValue: { assetTag: asset.assetTag, name: asset.name, status: asset.status },
      req,
    });

    return { ...asset, qrCodeUrl };
  },

  getById: async (id) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');
    return asset;
  },

  getPassport: async (id) => {
    const asset = await AssetRepository.findPassport(id);
    if (!asset) throw new NotFoundError('Asset');
    return asset;
  },

  getTimeline: async (id) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');
    const events = await AssetRepository.findTimeline(id);
    return events;
  },

  lookupByQR: async (qrCode) => {
    const asset = await AssetRepository.findByQrCode(qrCode);
    if (!asset) throw new NotFoundError('Asset');
    return asset;
  },

  regenerateQR: async (id, req) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');
    const qrCode = QRService.generateCode();
    const qrCodeUrl = await QRService.generateDataUrl(id, qrCode);
    const updated = await AssetRepository.update(id, { qrCode, qrCodeUrl });
    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_QR_REGENERATED,
      entityType: ENTITY_TYPES.ASSET,
      entityId: id,
      userId: req.user?.id,
      req,
    });
    return updated;
  },

  downloadQR: async (id) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');
    const buffer = await QRService.generateBuffer(id, asset.qrCode);
    return { buffer, assetTag: asset.assetTag };
  },

  search: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};

    if (query.q) {
      where.OR = [
        { assetTag: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
        { serialNumber: { contains: query.q, mode: 'insensitive' } },
        { location: { contains: query.q, mode: 'insensitive' } },
        { invoiceNumber: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    if (query.assetTag) where.assetTag = { contains: query.assetTag, mode: 'insensitive' };
    if (query.name) where.name = { contains: query.name, mode: 'insensitive' };
    if (query.serialNumber) where.serialNumber = { contains: query.serialNumber, mode: 'insensitive' };
    if (query.status) where.status = query.status;
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };
    if (query.departmentId) where.departmentId = Number(query.departmentId);
    if (query.vendorId) where.vendorId = Number(query.vendorId);
    if (query.condition) where.condition = { contains: query.condition, mode: 'insensitive' };
    if (query.isBookable !== undefined) where.isBookable = query.isBookable === 'true';
    if (query.warrantyExpiring === 'true') {
      const in90 = new Date();
      in90.setDate(in90.getDate() + 90);
      where.warrantyExpiry = { lte: in90, gte: new Date() };
    }
    if (query.warrantyExpired === 'true') {
      where.warrantyExpiry = { lt: new Date() };
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    const [assets, total] = await Promise.all([
      AssetRepository.search({ where, skip, take: limit, orderBy }),
      AssetRepository.count(where),
    ]);

    return { assets, pagination: buildPaginationMeta(total, page, limit) };
  },

  update: async (id, data, req) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');

    const updated = await AssetRepository.update(id, data);

    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_UPDATED,
      entityType: ENTITY_TYPES.ASSET,
      entityId: id,
      userId: req.user?.id,
      oldValue: { name: asset.name, location: asset.location, condition: asset.condition },
      newValue: data,
      req,
    });

    return updated;
  },

  updateStatus: async (id, newStatus, req) => {
    const asset = await AssetRepository.findById(id);
    if (!asset) throw new NotFoundError('Asset');

    if (!canTransition(asset.status, newStatus)) {
      throw new BusinessRuleError(
        `Cannot transition asset from '${asset.status}' to '${newStatus}'`,
        [{ allowedTransitions: canTransition.VALID_TRANSITIONS?.[asset.status] || [] }]
      );
    }

    const updated = await AssetRepository.updateStatus(id, newStatus);

    await AuditService.log({
      action: AUDIT_ACTIONS.ASSET_STATUS_CHANGED,
      entityType: ENTITY_TYPES.ASSET,
      entityId: id,
      userId: req.user?.id,
      oldValue: { status: asset.status },
      newValue: { status: newStatus },
      req,
    });

    return updated;
  },
  getWarrantyAlerts: async () => {
    const { WARRANTY_ALERT_DAYS } = require('../constants');
    const [critical, warning, notice] = await Promise.all([
      AssetRepository.findWarrantyExpiring(WARRANTY_ALERT_DAYS.CRITICAL),
      AssetRepository.findWarrantyExpiring(WARRANTY_ALERT_DAYS.WARNING),
      AssetRepository.findWarrantyExpiring(WARRANTY_ALERT_DAYS.NOTICE),
    ]);
    const criticalIds = new Set(critical.map(a => a.id));
    const warningIds = new Set(warning.map(a => a.id));
    return {
      critical: critical.map(a => ({ ...a, alertLevel: 'CRITICAL' })),
      warning: warning.filter(a => !criticalIds.has(a.id)).map(a => ({ ...a, alertLevel: 'WARNING' })),
      notice: notice.filter(a => !criticalIds.has(a.id) && !warningIds.has(a.id)).map(a => ({ ...a, alertLevel: 'NOTICE' })),
    };
  },
};

module.exports = AssetService;
