const prisma = require('../config/db');

const AllocationRepository = {
  getActive: (assetId) =>
    prisma.allocation.findFirst({
      where: { assetId: Number(assetId), isActive: true },
      include: {
        allocatedToUser: { select: { id: true, name: true, email: true } },
        asset: true,
      },
    }),

  create: (data) =>
    prisma.allocation.create({
      data,
      include: {
        asset: true,
        allocatedToUser: { select: { id: true, name: true, email: true } },
      },
    }),

  markReturned: (id, conditionNotes) =>
    prisma.allocation.update({
      where: { id: Number(id) },
      data: { isActive: false, actualReturnDate: new Date(), conditionNotes },
    }),

  findById: (id) =>
    prisma.allocation.findUnique({
      where: { id: Number(id) },
      include: { asset: true, allocatedToUser: true },
    }),

  getOverdue: () =>
    prisma.allocation.findMany({
      where: { isActive: true, expectedReturnDate: { lt: new Date() } },
      include: {
        asset: true,
        allocatedToUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { expectedReturnDate: 'asc' },
    }),

  history: (assetId) =>
    prisma.allocation.findMany({
      where: { assetId: Number(assetId) },
      orderBy: { createdAt: 'desc' },
      include: { allocatedToUser: { select: { id: true, name: true, email: true } } },
    }),
};

module.exports = AllocationRepository;
