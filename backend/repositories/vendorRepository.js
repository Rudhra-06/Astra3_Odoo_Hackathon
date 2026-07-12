const prisma = require('../config/db');

const VendorRepository = {
  create: (data) => prisma.vendor.create({ data }),

  findById: (id) => prisma.vendor.findUnique({ where: { id: Number(id) } }),

  findByName: (name) => prisma.vendor.findUnique({ where: { name } }),

  list: ({ where = {}, skip, take }) =>
    prisma.vendor.findMany({
      where,
      skip,
      take,
      include: { _count: { select: { assets: true } } },
      orderBy: { name: 'asc' },
    }),

  count: (where = {}) => prisma.vendor.count({ where }),

  update: (id, data) => prisma.vendor.update({ where: { id: Number(id) }, data }),

  delete: (id) => prisma.vendor.delete({ where: { id: Number(id) } }),
};

module.exports = VendorRepository;
