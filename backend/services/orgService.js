const prisma = require('../config/db');
const UserRepository = require('../repositories/userRepository');
const AuditService = require('./auditService');
const { NotFoundError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const DepartmentService = {
  create: async (data, req) => {
    const dept = await prisma.department.create({ data });

    await AuditService.log({
      action: AUDIT_ACTIONS.DEPARTMENT_CREATED,
      entityType: ENTITY_TYPES.DEPARTMENT,
      entityId: dept.id,
      userId: req.user?.id,
      newValue: data,
      req,
    });

    return dept;
  },

  update: async (id, data, req) => {
    const existing = await prisma.department.findUnique({ where: { id: Number(id) } });
    if (!existing) throw new NotFoundError('Department');

    const updated = await prisma.department.update({ where: { id: Number(id) }, data });

    await AuditService.log({
      action: AUDIT_ACTIONS.DEPARTMENT_UPDATED,
      entityType: ENTITY_TYPES.DEPARTMENT,
      entityId: id,
      userId: req.user?.id,
      oldValue: { name: existing.name, headId: existing.headId },
      newValue: data,
      req,
    });

    return updated;
  },

  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: {
          head: { select: { id: true, name: true } },
          _count: { select: { employees: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({ where: { deletedAt: null } }),
    ]);
    return { departments, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const dept = await prisma.department.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: {
        head: { select: { id: true, name: true, email: true } },
        children: true,
        _count: { select: { employees: true } },
      },
    });
    if (!dept) throw new NotFoundError('Department');
    return dept;
  },
};

const UserService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};
    if (query.role) where.role = query.role;
    if (query.departmentId) where.departmentId = Number(query.departmentId);
    if (query.status) where.status = query.status;

    const [users, total] = await Promise.all([
      UserRepository.list({ where, skip, take: limit }),
      UserRepository.count(where),
    ]);

    return { users, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  },

  updateRole: async (id, role, req) => {
    const user = await UserRepository.findById(id);
    if (!user) throw new NotFoundError('User');

    const updated = await UserRepository.update(id, { role });

    await AuditService.log({
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      entityType: ENTITY_TYPES.USER,
      entityId: id,
      userId: req.user?.id,
      oldValue: { role: user.role },
      newValue: { role },
      req,
    });

    return updated;
  },
};

module.exports = { DepartmentService, UserService };
