const prisma = require('../config/db');

const ASSET_INCLUDE = {
  category: true,
  vendor: true,
  allocations: {
    where: { isActive: true },
    include: { allocatedToUser: { select: { id: true, name: true, email: true } } },
  },
};

const AssetRepository = {
  create: (data) =>
    prisma.asset.create({ data, include: ASSET_INCLUDE }),

  findById: (id) =>
    prisma.asset.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: ASSET_INCLUDE,
    }),

  findByQrCode: (qrCode) =>
    prisma.asset.findFirst({ where: { qrCode, deletedAt: null }, include: ASSET_INCLUDE }),

  findPassport: (id) =>
    prisma.asset.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: {
        category: true,
        vendor: true,
        allocations: {
          orderBy: { createdAt: 'desc' },
          include: {
            allocatedToUser: { select: { id: true, name: true, email: true } },
            allocatedByUser: { select: { id: true, name: true } },
          },
        },
        transfers: {
          orderBy: { requestedAt: 'desc' },
          include: { asset: false },
        },
        maintenances: { orderBy: { createdAt: 'desc' } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: { bookedBy: { select: { id: true, name: true } } },
        },
        auditItems: {
          orderBy: { createdAt: 'desc' },
          include: { auditCycle: { select: { id: true, title: true, startDate: true } } },
        },
      },
    }),

  findTimeline: async (id) => {
    const asset = await prisma.asset.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: {
        allocations: {
          orderBy: { createdAt: 'asc' },
          include: {
            allocatedToUser: { select: { id: true, name: true } },
            allocatedByUser: { select: { id: true, name: true } },
          },
        },
        transfers: { orderBy: { requestedAt: 'asc' } },
        maintenances: { orderBy: { createdAt: 'asc' } },
        bookings: {
          orderBy: { createdAt: 'asc' },
          include: { bookedBy: { select: { id: true, name: true } } },
        },
        auditItems: {
          orderBy: { createdAt: 'asc' },
          include: { auditCycle: { select: { id: true, title: true } } },
        },
      },
    });
    if (!asset) return null;

    const events = [];

    // Registration
    events.push({
      type: 'REGISTERED', timestamp: asset.createdAt,
      title: 'Asset Registered',
      description: `${asset.name} (${asset.assetTag}) was registered in the system.`,
      icon: 'registered', color: 'teal',
    });

    // Allocations
    for (const a of asset.allocations) {
      events.push({
        type: 'ALLOCATED', timestamp: a.createdAt,
        title: 'Asset Allocated',
        description: `Allocated to ${a.allocatedToUser?.name || 'Unknown'} by ${a.allocatedByUser?.name || 'System'}.`,
        icon: 'allocated', color: 'blue',
        meta: { condition: a.conditionAtIssue, expectedReturn: a.expectedReturnDate },
      });
      if (a.actualReturnDate) {
        events.push({
          type: 'RETURNED', timestamp: a.actualReturnDate,
          title: 'Asset Returned',
          description: `Returned by ${a.allocatedToUser?.name || 'Unknown'}. ${a.conditionNotes || ''}`.trim(),
          icon: 'returned', color: 'green',
        });
      }
    }

    // Transfers
    for (const t of asset.transfers) {
      events.push({
        type: 'TRANSFER_' + t.status, timestamp: t.requestedAt,
        title: `Transfer ${t.status.charAt(0) + t.status.slice(1).toLowerCase()}`,
        description: t.reason || 'Transfer request raised.',
        icon: 'transfer', color: t.status === 'REJECTED' ? 'red' : 'purple',
        meta: { status: t.status, resolvedAt: t.resolvedAt },
      });
    }

    // Maintenance
    for (const m of asset.maintenances) {
      events.push({
        type: 'MAINTENANCE_SCHEDULED', timestamp: m.createdAt,
        title: `Maintenance Scheduled — ${m.priority}`,
        description: m.description,
        icon: 'maintenance', color: 'amber',
        meta: { status: m.status, vendor: m.vendor, estimatedCost: m.estimatedCost },
      });
      if (m.completedDate) {
        events.push({
          type: 'MAINTENANCE_COMPLETED', timestamp: m.completedDate,
          title: 'Maintenance Completed',
          description: m.completionNotes || m.resolutionNotes || 'Maintenance work completed.',
          icon: 'maintenance_done', color: 'green',
          meta: { actualCost: m.actualCost, technicianName: m.technicianName },
        });
      }
    }

    // Bookings
    for (const b of asset.bookings) {
      events.push({
        type: 'BOOKED', timestamp: b.createdAt,
        title: 'Asset Booked',
        description: `Booked by ${b.bookedBy?.name || 'Unknown'} — ${b.purpose || 'No purpose specified'}.`,
        icon: 'booked', color: 'indigo',
        meta: { startTime: b.startTime, endTime: b.endTime, status: b.status },
      });
    }

    // Audit items
    for (const ai of asset.auditItems) {
      if (ai.verifiedAt) {
        events.push({
          type: 'AUDIT_VERIFIED', timestamp: ai.verifiedAt,
          title: `Audit — ${ai.verificationStatus}`,
          description: `Verified during "${ai.auditCycle?.title || 'Audit Cycle'}". ${ai.notes || ''}`.trim(),
          icon: 'audit', color: ai.verificationStatus === 'VERIFIED' ? 'green' : 'red',
        });
      }
    }

    // Retirement / disposal
    if (['RETIRED', 'DISPOSED', 'LOST'].includes(asset.status)) {
      events.push({
        type: asset.status, timestamp: asset.updatedAt,
        title: asset.status.charAt(0) + asset.status.slice(1).toLowerCase(),
        description: `Asset marked as ${asset.status.toLowerCase()}.`,
        icon: 'disposed', color: 'gray',
      });
    }

    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return events;
  },

  findByTag: (assetTag) =>
    prisma.asset.findFirst({ where: { assetTag, deletedAt: null } }),

  search: ({ where, skip, take, orderBy }) =>
    prisma.asset.findMany({
      where: { ...where, deletedAt: null },
      include: { category: true, vendor: { select: { id: true, name: true } } },
      skip,
      take,
      orderBy,
    }),

  count: (where) =>
    prisma.asset.count({ where: { ...where, deletedAt: null } }),

  updateStatus: (id, status) =>
    prisma.asset.update({ where: { id: Number(id) }, data: { status } }),

  update: (id, data) =>
    prisma.asset.update({ where: { id: Number(id) }, data }),

  softDelete: (id) =>
    prisma.asset.update({ where: { id: Number(id) }, data: { deletedAt: new Date() } }),

  findLastAsset: () =>
    prisma.asset.findFirst({ orderBy: { id: 'desc' } }),

  findWarrantyExpiring: (days) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return prisma.asset.findMany({
      where: { deletedAt: null, warrantyExpiry: { lte: future, gte: new Date() } },
      include: { category: true },
    });
  },
};

module.exports = AssetRepository;
