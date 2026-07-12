const AuditRepository = require('../repositories/auditRepository');
const { success, paginated } = require('../utils/response');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function listAuditLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {};
    if (req.query.entityType) where.entityType = req.query.entityType;
    if (req.query.entityId) where.entityId = Number(req.query.entityId);
    if (req.query.userId) where.userId = Number(req.query.userId);
    if (req.query.action) where.action = req.query.action;

    const [logs, total] = await Promise.all([
      AuditRepository.list({ where, skip, take: limit }),
      AuditRepository.count(where),
    ]);

    paginated(res, logs, buildPaginationMeta(total, page, limit));
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
