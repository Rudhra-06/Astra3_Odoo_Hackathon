const cron = require('node-cron');
const prisma = require('../config/db');
const NotificationService = require('../services/notificationService');
const logger = require('../utils/logger');

async function sendWarrantyReminders() {
  try {
    const now = new Date();
    const thresholds = [
      { days: 7, level: 'CRITICAL', label: '7 days' },
      { days: 30, level: 'WARNING', label: '30 days' },
      { days: 90, level: 'NOTICE', label: '90 days' },
    ];

    for (const { days, level, label } of thresholds) {
      const target = new Date(now);
      target.setDate(target.getDate() + days);
      const dayBefore = new Date(target);
      dayBefore.setDate(dayBefore.getDate() - 1);

      const assets = await prisma.asset.findMany({
        where: {
          deletedAt: null,
          warrantyExpiry: { gte: dayBefore, lte: target },
        },
        include: { allocations: { where: { isActive: true } } },
      });

      for (const asset of assets) {
        // Notify asset managers
        const managers = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'ASSET_MANAGER'] }, status: 'ACTIVE', deletedAt: null },
          select: { id: true },
        });

        const userIds = [
          ...managers.map(m => m.id),
          ...asset.allocations.map(a => a.allocatedToUserId).filter(Boolean),
        ];

        const uniqueIds = [...new Set(userIds)];

        await NotificationService.sendToMany(uniqueIds, {
          title: `Warranty Expiring in ${label}`,
          message: `Asset "${asset.name}" (${asset.assetTag}) warranty expires on ${new Date(asset.warrantyExpiry).toLocaleDateString()}.`,
          type: `WARRANTY_${level}`,
          entityType: 'Asset',
          entityId: asset.id,
        });
      }

      if (assets.length > 0) {
        logger.info(`Warranty reminders sent for ${assets.length} assets (${label} threshold)`);
      }
    }
  } catch (err) {
    logger.error('Warranty reminder cron failed', { error: err.message });
  }
}

async function markOverdueBookings() {
  try {
    const updated = await prisma.booking.updateMany({
      where: { status: 'CONFIRMED', endTime: { lt: new Date() } },
      data: { status: 'COMPLETED' },
    });
    if (updated.count > 0) logger.info(`Marked ${updated.count} bookings as COMPLETED`);
  } catch (err) {
    logger.error('Booking completion cron failed', { error: err.message });
  }
}

function startCronJobs() {
  // Daily at 8 AM
  cron.schedule('0 8 * * *', sendWarrantyReminders);
  // Every hour — mark completed bookings
  cron.schedule('0 * * * *', markOverdueBookings);
  logger.info('Cron jobs started: warranty reminders (daily 8AM), booking completion (hourly)');
}

module.exports = { startCronJobs };
