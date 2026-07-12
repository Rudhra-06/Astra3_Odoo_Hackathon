const AuditCycleService = require('../services/auditCycleService');
const { success, created, paginated } = require('../utils/response');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function createCycle(req, res, next) {
  try {
    const cycle = await AuditCycleService.create(req.body, req);
    created(res, { cycle }, 'Audit cycle created');
  } catch (err) { next(err); }
}

async function listCycles(req, res, next) {
  try {
    const { cycles, pagination } = await AuditCycleService.list(req.query);
    paginated(res, cycles, pagination);
  } catch (err) { next(err); }
}

async function getCycleById(req, res, next) {
  try {
    const cycle = await AuditCycleService.getById(req.params.id);
    success(res, { cycle });
  } catch (err) { next(err); }
}

async function updateCycleStatus(req, res, next) {
  try {
    const cycle = await AuditCycleService.updateStatus(req.params.id, req.body.status, req);
    success(res, { cycle }, 'Audit cycle status updated');
  } catch (err) { next(err); }
}

async function verifyItem(req, res, next) {
  try {
    const item = await AuditCycleService.verifyItem(req.params.itemId, req.body, req);
    success(res, { item }, 'Asset verification recorded');
  } catch (err) { next(err); }
}

async function getDiscrepancyReport(req, res, next) {
  try {
    const report = await AuditCycleService.getDiscrepancyReport(req.params.id);
    success(res, { report });
  } catch (err) { next(err); }
}

module.exports = { createCycle, listCycles, getCycleById, updateCycleStatus, verifyItem, getDiscrepancyReport };
