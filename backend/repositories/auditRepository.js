const prisma = require('../config/db');

const AuditRepository = {
  create: (data) => prisma.auditLog.create({ data }),

  list: ({ where, skip, take }) =>
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  count: (where) => prisma.auditLog.count({ where }),
};

module.exports = AuditRepository;
