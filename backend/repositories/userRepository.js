const prisma = require('../config/db');

const UserRepository = {
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id) =>
    prisma.user.findFirst({
      where: { id: Number(id), deletedAt: null },
      select: {
        id: true, name: true, email: true, role: true,
        status: true, departmentId: true, department: true,
        createdAt: true, updatedAt: true,
      },
    }),

  create: (data) =>
    prisma.user.create({ data }),

  update: (id, data) =>
    prisma.user.update({ where: { id: Number(id) }, data }),

  list: ({ skip, take, where }) =>
    prisma.user.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      select: {
        id: true, name: true, email: true, role: true,
        status: true, departmentId: true, department: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  count: (where) =>
    prisma.user.count({ where: { ...where, deletedAt: null } }),
};

module.exports = UserRepository;
