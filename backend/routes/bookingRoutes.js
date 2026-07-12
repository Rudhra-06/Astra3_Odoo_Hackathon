const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const v = require('../validators/bookingValidators');

router.post('/', auth, v.create, validate, ctrl.createBooking);
router.get('/', auth, ctrl.listBookings);
router.patch('/:id/cancel', auth, v.cancel, validate, ctrl.cancelBooking);

module.exports = router;
