const prisma = require('../config/db');

const AuditCycleRepository = {
  create: (data) =>
    prisma.auditCycle.create({ data }),

  findById: (id) =>
    prisma.auditCycle.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            asset: { select: { id: true, assetTag: true, name: true, location: true, status: true } },
          },
        },
      },
    }),

  list: ({ where, skip, take }) =>
    prisma.auditCycle.findMany({
      where,
      skip,
      take,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    }),

  count: (where) => prisma.auditCycle.count({ where }),

  update: (id, data) =>
    prisma.auditCycle.update({ where: { id: Number(id) }, data }),

  createItems: (items) =>
    prisma.auditItem.createMany({ data: items, skipDuplicates: true }),

  findItem: (id) =>
    prisma.auditItem.findUnique({
      where: { id: Number(id) },
      include: { asset: true, auditCycle: true },
    }),

  updateItem: (id, data) =>
    prisma.auditItem.update({ where: { id: Number(id) }, data }),

  getStats: async (cycleId) => {
    const items = await prisma.auditItem.groupBy({
      by: ['verificationStatus'],
      where: { auditCycleId: Number(cycleId) },
      _count: { id: true },
    });
    return Object.fromEntries(items.map(i => [i.verificationStatus, i._count.id]));
  },
};

module.exports = AuditCycleRepository;
