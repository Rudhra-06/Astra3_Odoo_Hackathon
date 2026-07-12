const prisma = require('../config/db');

const AssetModel = {
  create: (data) => prisma.asset.create({ data, include: { category: true } }),

  findById: (id) =>
    prisma.asset.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        allocations: { orderBy: { createdAt: 'desc' } },
      },
    }),

  findByTag: (assetTag) => prisma.asset.findUnique({ where: { assetTag } }),

  search: (filters) => {
    const where = {};
    if (filters.assetTag) where.assetTag = { contains: filters.assetTag, mode: 'insensitive' };
    if (filters.serialNumber) where.serialNumber = { contains: filters.serialNumber, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = Number(filters.categoryId);
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };

    return prisma.asset.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus: (id, status) =>
    prisma.asset.update({
      where: { id: Number(id) },
      data: { status },
    }),

  update: (id, data) =>
    prisma.asset.update({
      where: { id: Number(id) },
      data,
    }),
};

module.exports = AssetModel;