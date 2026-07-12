const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, ctrl.getDashboard);

module.exports = router;
