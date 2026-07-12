const prisma = require('../config/db');

const AllocationModel = {
  getActiveAllocation: (assetId) =>
    prisma.allocation.findFirst({
      where: { assetId: Number(assetId), isActive: true },
      include: { allocatedToUser: true },
    }),

  create: (data) => prisma.allocation.create({ data }),

  markReturned: (allocationId, conditionNotes) =>
    prisma.allocation.update({
      where: { id: Number(allocationId) },
      data: {
        isActive: false,
        actualReturnDate: new Date(),
        conditionNotes,
      },
    }),

  getOverdue: () =>
    prisma.allocation.findMany({
      where: {
        isActive: true,
        expectedReturnDate: { lt: new Date() },
      },
      include: { asset: true, allocatedToUser: true },
    }),

  history: (assetId) =>
    prisma.allocation.findMany({
      where: { assetId: Number(assetId) },
      orderBy: { createdAt: 'desc' },
      include: { allocatedToUser: true },
    }),
};

module.exports = AllocationModel;