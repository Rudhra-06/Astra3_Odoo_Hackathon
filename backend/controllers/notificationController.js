const NotificationRepository = require('../repositories/notificationRepository');
const { success, paginated } = require('../utils/response');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function listNotifications(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const unreadOnly = req.query.unread === 'true';
    const archivedOnly = req.query.archived === 'true';

    const [notifications, unreadCount] = await Promise.all([
      NotificationRepository.listForUser(req.user.id, { skip, take: limit, unreadOnly, archivedOnly }),
      NotificationRepository.countUnread(req.user.id),
    ]);

    const total = await NotificationRepository.count({
      userId: req.user.id,
      ...(unreadOnly ? { isRead: false } : {}),
      ...(archivedOnly ? { isArchived: true } : { isArchived: false }),
    });

    paginated(res, notifications, buildPaginationMeta(total, page, limit), 'Notifications');
    // Attach unread count in response header for bell badge
    res.setHeader('X-Unread-Count', unreadCount);
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    await NotificationRepository.markRead(req.params.id, req.user.id);
    success(res, {}, 'Notification marked as read');
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await NotificationRepository.markAllRead(req.user.id);
    success(res, {}, 'All notifications marked as read');
  } catch (err) { next(err); }
}

async function archiveNotification(req, res, next) {
  try {
    await NotificationRepository.archive(req.params.id, req.user.id);
    success(res, {}, 'Notification archived');
  } catch (err) { next(err); }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await NotificationRepository.countUnread(req.user.id);
    success(res, { count });
  } catch (err) { next(err); }
}

module.exports = { listNotifications, markRead, markAllRead, archiveNotification, getUnreadCount };
