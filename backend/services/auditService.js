const AuditRepository = require('../repositories/auditRepository');
const logger = require('../utils/logger');

/**
 * Central audit service — every important action calls this.
 */
const AuditService = {
  log: async ({ action, entityType, entityId, userId, oldValue, newValue, req }) => {
    try {
      await AuditRepository.create({
        action,
        entityType,
        entityId: Number(entityId),
        userId: userId ? Number(userId) : null,
        oldValue: oldValue ?? undefined,
        newValue: newValue ?? undefined,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
        requestId: req?.requestId || null,
      });
    } catch (err) {
      // Audit failures must never crash the main flow
      logger.error('Audit log write failed', { action, entityType, entityId, error: err.message });
    }
  },
};

module.exports = AuditService;
