const AssetService = require('../services/assetService');
const { success, created, paginated } = require('../utils/response');

async function registerAsset(req, res, next) {
  try {
    const asset = await AssetService.register(req.body, req);
    created(res, { asset }, 'Asset registered successfully');
  } catch (err) { next(err); }
}

async function searchAssets(req, res, next) {
  try {
    const { assets, pagination } = await AssetService.search(req.query);
    paginated(res, assets, pagination);
  } catch (err) { next(err); }
}

async function getAssetById(req, res, next) {
  try {
    const asset = await AssetService.getById(req.params.id);
    success(res, { asset });
  } catch (err) { next(err); }
}

async function getAssetPassport(req, res, next) {
  try {
    const passport = await AssetService.getPassport(req.params.id);
    success(res, { passport });
  } catch (err) { next(err); }
}

async function getAssetTimeline(req, res, next) {
  try {
    const events = await AssetService.getTimeline(req.params.id);
    success(res, { events });
  } catch (err) { next(err); }
}

async function lookupByQR(req, res, next) {
  try {
    const asset = await AssetService.lookupByQR(req.params.qrCode);
    success(res, { asset });
  } catch (err) { next(err); }
}

async function updateAsset(req, res, next) {
  try {
    const asset = await AssetService.update(req.params.id, req.body, req);
    success(res, { asset }, 'Asset updated successfully');
  } catch (err) { next(err); }
}

async function updateAssetStatus(req, res, next) {
  try {
    const asset = await AssetService.updateStatus(req.params.id, req.body.status, req);
    success(res, { asset }, 'Asset status updated');
  } catch (err) { next(err); }
}

async function regenerateQR(req, res, next) {
  try {
    const asset = await AssetService.regenerateQR(req.params.id, req);
    success(res, { asset }, 'QR code regenerated');
  } catch (err) { next(err); }
}

async function downloadQR(req, res, next) {
  try {
    const { buffer, assetTag } = await AssetService.downloadQR(req.params.id);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${assetTag}-qr.png"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

async function getWarrantyAlerts(req, res, next) {
  try {
    const alerts = await AssetService.getWarrantyAlerts();
    success(res, { alerts });
  } catch (err) { next(err); }
}

module.exports = { registerAsset, searchAssets, getAssetById, getAssetPassport, getAssetTimeline, lookupByQR, updateAsset, updateAssetStatus, regenerateQR, downloadQR, getWarrantyAlerts };
