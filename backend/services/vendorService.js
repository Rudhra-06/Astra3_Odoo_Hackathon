const VendorRepository = require('../repositories/vendorRepository');
const AuditService = require('./auditService');
const { NotFoundError, ConflictError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const VendorService = {
  create: async (data, req) => {
    const existing = await VendorRepository.findByName(data.name);
    if (existing) throw new ConflictError('A vendor with this name already exists');

    const vendor = await VendorRepository.create(data);

    await AuditService.log({
      action: AUDIT_ACTIONS.VENDOR_CREATED,
      entityType: ENTITY_TYPES.VENDOR,
      entityId: vendor.id,
      userId: req.user?.id,
      newValue: { name: vendor.name },
      req,
    });

    return vendor;
  },

  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};
    if (query.q) where.name = { contains: query.q, mode: 'insensitive' };

    const [vendors, total] = await Promise.all([
      VendorRepository.list({ where, skip, take: limit }),
      VendorRepository.count(where),
    ]);

    return { vendors, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) throw new NotFoundError('Vendor');
    return vendor;
  },

  update: async (id, data, req) => {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) throw new NotFoundError('Vendor');
    return VendorRepository.update(id, data);
  },

  delete: async (id) => {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) throw new NotFoundError('Vendor');
    return VendorRepository.delete(id);
  },
};

module.exports = VendorService;
