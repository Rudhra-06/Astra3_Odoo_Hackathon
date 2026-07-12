const prisma = require('../config/db');
const { success } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const in90 = new Date(now);
    in90.setDate(in90.getDate() + 90);
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);

    const [
      totalAssets,
      byStatus,
      byCategory,
      overdueCount,
      maintenanceCount,
      activeBookings,
      pendingTransfers,
      totalUsers,
      totalDepartments,
      recentAllocations,
      recentActivity,
      warrantyExpiring90,
      warrantyExpiring30,
      warrantyExpiring7,
      monthlyAssets,
      maintenanceTrend,
      bookingTrend,
    ] = await Promise.all([
      prisma.asset.count({ where: { deletedAt: null } }),
      prisma.asset.groupBy({ by: ['status'], _count: { id: true }, where: { deletedAt: null } }),
      prisma.asset.groupBy({ by: ['categoryId'], _count: { id: true }, where: { deletedAt: null } }),
      prisma.allocation.count({ where: { isActive: true, expectedReturnDate: { lt: now } } }),
      prisma.maintenanceRecord.count({ where: { status: { in: ['SCHEDULED', 'IN_PROGRESS', 'APPROVED', 'ASSIGNED'] } } }),
      prisma.booking.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] }, endTime: { gte: now } } }),
      prisma.transferRequest.count({ where: { status: 'REQUESTED' } }),
      prisma.user.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.department.count({ where: { deletedAt: null } }),
      prisma.allocation.findMany({
        where: { isActive: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { assetTag: true, name: true } },
          allocatedToUser: { select: { name: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.asset.count({ where: { deletedAt: null, warrantyExpiry: { lte: in90, gte: now } } }),
      prisma.asset.count({ where: { deletedAt: null, warrantyExpiry: { lte: in30, gte: now } } }),
      prisma.asset.count({ where: { deletedAt: null, warrantyExpiry: { lte: in7, gte: now } } }),
      // Monthly asset registrations (last 6 months)
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
        FROM "Asset"
        WHERE "deletedAt" IS NULL AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month ORDER BY month ASC
      `,
      // Maintenance by status
      prisma.maintenanceRecord.groupBy({ by: ['status'], _count: { id: true } }),
      // Booking trend (last 7 days)
      prisma.$queryRaw`
        SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
        FROM "Booking"
        WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day ASC
      `,
    ]);

    const statusMap = Object.fromEntries(byStatus.map(s => [s.status, s._count.id]));
    const maintenanceStatusMap = Object.fromEntries(maintenanceTrend.map(m => [m.status, m._count.id]));

    // Fetch category names for chart
    const categoryIds = byCategory.map(c => c.categoryId).filter(Boolean);
    const categories = await prisma.assetCategory.findMany({ where: { id: { in: categoryIds } } });
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const categoryDistribution = byCategory.map(c => ({
      name: catMap[c.categoryId] || 'Unknown',
      count: c._count.id,
    }));

    const utilization = totalAssets > 0
      ? Math.round(((statusMap.ALLOCATED || 0) / totalAssets) * 100)
      : 0;

    success(res, {
      summary: {
        totalAssets,
        available: statusMap.AVAILABLE || 0,
        allocated: statusMap.ALLOCATED || 0,
        reserved: statusMap.RESERVED || 0,
        underMaintenance: statusMap.UNDER_MAINTENANCE || 0,
        lost: statusMap.LOST || 0,
        retired: statusMap.RETIRED || 0,
        disposed: statusMap.DISPOSED || 0,
        overdueAllocations: overdueCount,
        pendingMaintenance: maintenanceCount,
        activeBookings,
        pendingTransfers,
        totalUsers,
        totalDepartments,
        utilizationPercent: utilization,
      },
      warranty: {
        expiring90: warrantyExpiring90,
        expiring30: warrantyExpiring30,
        expiring7: warrantyExpiring7,
      },
      charts: {
        statusDistribution: byStatus.map(s => ({ name: s.status, value: s._count.id })),
        categoryDistribution,
        maintenanceByStatus: Object.entries(maintenanceStatusMap).map(([k, v]) => ({ name: k, value: v })),
        monthlyGrowth: monthlyAssets.map(r => ({
          month: new Date(r.month).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
          count: Number(r.count),
        })),
        bookingTrend: bookingTrend.map(r => ({
          day: new Date(r.day).toLocaleDateString('en', { weekday: 'short' }),
          count: Number(r.count),
        })),
      },
      recentAllocations,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
