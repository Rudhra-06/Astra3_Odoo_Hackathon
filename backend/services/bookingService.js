const BookingRepository = require('../repositories/bookingRepository');
const AssetRepository = require('../repositories/assetRepository');
const AuditService = require('./auditService');
const { NotFoundError, ConflictError, BusinessRuleError } = require('../errors');
const { AUDIT_ACTIONS, ENTITY_TYPES } = require('../constants');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const BookingService = {
  create: async ({ assetId, startTime, endTime, purpose }, req) => {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) throw new NotFoundError('Asset');
    if (!asset.isBookable) throw new BusinessRuleError('This asset is not available for booking');

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) throw new BusinessRuleError('endTime must be after startTime');

    const conflict = await BookingRepository.findConflicting(assetId, start, end);
    if (conflict) throw new ConflictError('Asset is already booked for the requested time slot');

    const booking = await BookingRepository.create({
      assetId: Number(assetId),
      bookedById: req.user.id,
      startTime: start,
      endTime: end,
      purpose: purpose || null,
      status: 'CONFIRMED',
    });

    await AuditService.log({
      action: AUDIT_ACTIONS.BOOKING_CREATED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId: booking.id,
      userId: req.user.id,
      newValue: { assetId, startTime, endTime },
      req,
    });

    return booking;
  },

  cancel: async (id, req) => {
    const booking = await BookingRepository.findById(id);
    if (!booking) throw new NotFoundError('Booking');

    if (booking.bookedById !== req.user.id && req.user.role === 'EMPLOYEE') {
      throw new BusinessRuleError('You can only cancel your own bookings');
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BusinessRuleError(`Booking is already '${booking.status}'`);
    }

    const updated = await BookingRepository.update(id, { status: 'CANCELLED' });

    await AuditService.log({
      action: AUDIT_ACTIONS.BOOKING_CANCELLED,
      entityType: ENTITY_TYPES.BOOKING,
      entityId: id,
      userId: req.user.id,
      oldValue: { status: booking.status },
      newValue: { status: 'CANCELLED' },
      req,
    });

    return updated;
  },

  list: async (query, userId, role) => {
    const { page, limit, skip } = parsePagination(query);
    const where = {};

    if (query.assetId) where.assetId = Number(query.assetId);
    if (query.status) where.status = query.status;
    // Employees only see their own bookings
    if (role === 'EMPLOYEE') where.bookedById = Number(userId);

    const [bookings, total] = await Promise.all([
      BookingRepository.list({ where, skip, take: limit }),
      BookingRepository.count(where),
    ]);

    return { bookings, pagination: buildPaginationMeta(total, page, limit) };
  },
};

module.exports = BookingService;
