const VendorService = require('../services/vendorService');
const { success, created, paginated } = require('../utils/response');

async function createVendor(req, res, next) {
  try {
    const vendor = await VendorService.create(req.body, req);
    created(res, { vendor }, 'Vendor created');
  } catch (err) { next(err); }
}

async function listVendors(req, res, next) {
  try {
    const { vendors, pagination } = await VendorService.list(req.query);
    paginated(res, vendors, pagination);
  } catch (err) { next(err); }
}

async function getVendorById(req, res, next) {
  try {
    const vendor = await VendorService.getById(req.params.id);
    success(res, { vendor });
  } catch (err) { next(err); }
}

async function updateVendor(req, res, next) {
  try {
    const vendor = await VendorService.update(req.params.id, req.body, req);
    success(res, { vendor }, 'Vendor updated');
  } catch (err) { next(err); }
}

async function deleteVendor(req, res, next) {
  try {
    await VendorService.delete(req.params.id);
    success(res, {}, 'Vendor deleted');
  } catch (err) { next(err); }
}

module.exports = { createVendor, listVendors, getVendorById, updateVendor, deleteVendor };
