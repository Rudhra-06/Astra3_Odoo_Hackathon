const NotificationRepository = require('../repositories/notificationRepository');
const logger = require('../utils/logger');

const NotificationService = {
  send: async ({ userId, title, message, type, entityType, entityId }) => {
    try {
      await NotificationRepository.create({
        userId: Number(userId),
        title,
        message,
        type,
        entityType: entityType || null,
        entityId: entityId ? Number(entityId) : null,
      });
    } catch (err) {
      logger.error('Notification send failed', { userId, type, error: err.message });
    }
  },

  sendToMany: async (userIds, payload) => {
    try {
      await NotificationRepository.createMany(
        userIds.map(uid => ({
          userId: Number(uid),
          title: payload.title,
          message: payload.message,
          type: payload.type,
          entityType: payload.entityType || null,
          entityId: payload.entityId ? Number(payload.entityId) : null,
        }))
      );
    } catch (err) {
      logger.error('Bulk notification failed', { error: err.message });
    }
  },
};

module.exports = NotificationService;
