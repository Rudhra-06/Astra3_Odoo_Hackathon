const prisma = require('../config/db');

const NotificationRepository = {
  create: (data) => prisma.notification.create({ data }),

  createMany: (data) => prisma.notification.createMany({ data }),

  listForUser: (userId, { skip, take, unreadOnly, archivedOnly }) =>
    prisma.notification.findMany({
      where: {
        userId: Number(userId),
        ...(unreadOnly ? { isRead: false } : {}),
        ...(archivedOnly ? { isArchived: true } : { isArchived: false }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),

  markRead: (id, userId) =>
    prisma.notification.updateMany({
      where: { id: Number(id), userId: Number(userId) },
      data: { isRead: true },
    }),

  markAllRead: (userId) =>
    prisma.notification.updateMany({
      where: { userId: Number(userId), isRead: false },
      data: { isRead: true },
    }),

  archive: (id, userId) =>
    prisma.notification.updateMany({
      where: { id: Number(id), userId: Number(userId) },
      data: { isArchived: true },
    }),

  countUnread: (userId) =>
    prisma.notification.count({ where: { userId: Number(userId), isRead: false, isArchived: false } }),

  count: (where) => prisma.notification.count({ where }),
};

module.exports = NotificationRepository;
