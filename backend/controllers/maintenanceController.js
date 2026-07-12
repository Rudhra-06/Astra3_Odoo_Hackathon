const MaintenanceService = require('../services/maintenanceService');
const { success, created, paginated } = require('../utils/response');

async function scheduleMaintenance(req, res, next) {
  try {
    const record = await MaintenanceService.schedule(req.body, req);
    created(res, { record }, 'Maintenance scheduled');
  } catch (err) { next(err); }
}

async function updateMaintenanceStatus(req, res, next) {
  try {
    const record = await MaintenanceService.updateStatus(req.params.id, req.body, req);
    success(res, { record }, 'Maintenance status updated');
  } catch (err) { next(err); }
}

async function completeMaintenance(req, res, next) {
  try {
    const record = await MaintenanceService.complete(req.params.id, req.body, req);
    success(res, { record }, 'Maintenance record updated');
  } catch (err) { next(err); }
}

async function listMaintenance(req, res, next) {
  try {
    const { records, pagination } = await MaintenanceService.list(req.query);
    paginated(res, records, pagination);
  } catch (err) { next(err); }
}

async function getMaintenanceById(req, res, next) {
  try {
    const record = await MaintenanceService.getById(req.params.id);
    success(res, { record });
  } catch (err) { next(err); }
}

async function getMaintenanceDashboard(req, res, next) {
  try {
    const data = await MaintenanceService.getDashboard();
    success(res, data);
  } catch (err) { next(err); }
}

module.exports = { scheduleMaintenance, updateMaintenanceStatus, completeMaintenance, listMaintenance, getMaintenanceById, getMaintenanceDashboard };
