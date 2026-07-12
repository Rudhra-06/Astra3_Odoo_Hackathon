const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ctrl.listNotifications);
router.get('/unread-count', auth, ctrl.getUnreadCount);
router.patch('/read-all', auth, ctrl.markAllRead);
router.patch('/:id/read', auth, ctrl.markRead);
router.patch('/:id/archive', auth, ctrl.archiveNotification);

module.exports = router;
