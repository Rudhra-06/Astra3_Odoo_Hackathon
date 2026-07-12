const prisma = require('../config/db');

const MaintenanceRepository = {
  create: (data) =>
    prisma.maintenanceRecord.create({ data, include: { asset: true } }),

  findById: (id) =>
    prisma.maintenanceRecord.findUnique({
      where: { id: Number(id) },
      include: { asset: true },
    }),

  update: (id, data) =>
    prisma.maintenanceRecord.update({ where: { id: Number(id) }, data }),

  list: ({ where, skip, take }) =>
    prisma.maintenanceRecord.findMany({
      where,
      skip,
      take,
      include: { asset: { select: { id: true, assetTag: true, name: true } } },
      orderBy: { scheduledDate: 'asc' },
    }),

  count: (where) => prisma.maintenanceRecord.count({ where }),
};

module.exports = MaintenanceRepository;
