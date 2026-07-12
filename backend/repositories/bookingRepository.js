const prisma = require('../config/db');

const BookingRepository = {
  create: (data) =>
    prisma.booking.create({
      data,
      include: { asset: true, bookedBy: { select: { id: true, name: true } } },
    }),

  findById: (id) =>
    prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { asset: true, bookedBy: { select: { id: true, name: true } } },
    }),

  update: (id, data) =>
    prisma.booking.update({ where: { id: Number(id) }, data }),

  findConflicting: (assetId, startTime, endTime, excludeId = null) =>
    prisma.booking.findFirst({
      where: {
        assetId: Number(assetId),
        status: { in: ['PENDING', 'CONFIRMED'] },
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          { startTime: { lte: endTime }, endTime: { gte: startTime } },
        ],
      },
    }),

  list: ({ where, skip, take }) =>
    prisma.booking.findMany({
      where,
      skip,
      take,
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        bookedBy: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    }),

  count: (where) => prisma.booking.count({ where }),
};

module.exports = BookingRepository;
