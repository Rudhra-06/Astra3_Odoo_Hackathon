const BookingService = require('../services/bookingService');
const { success, created, paginated } = require('../utils/response');

async function createBooking(req, res, next) {
  try {
    const booking = await BookingService.create(req.body, req);
    created(res, { booking }, 'Booking confirmed');
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await BookingService.cancel(req.params.id, req);
    success(res, { booking }, 'Booking cancelled');
  } catch (err) {
    next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const { bookings, pagination } = await BookingService.list(req.query, req.user.id, req.user.role);
    paginated(res, bookings, pagination);
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, cancelBooking, listBookings };
