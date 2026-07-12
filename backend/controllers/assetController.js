const AssetModel = require('../models/assetModel');
const generateAssetTag = require('../utils/generateAssetTag');
const { canTransition } = require('../utils/assetStateMachine');

// POST /api/assets
async function registerAsset(req, res) {
  try {
    const { name, categoryId, serialNumber, acquisitionDate, acquisitionCost,
            condition, location, isBookable, photoUrl } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'name and categoryId are required' });
    }

    const assetTag = await generateAssetTag();

    const asset = await AssetModel.create({
      assetTag,
      name,
      categoryId: Number(categoryId),
      serialNumber,
      acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : null,
      acquisitionCost: acquisitionCost ? Number(acquisitionCost) : null,
      condition,
      location,
      isBookable: Boolean(isBookable),
      photoUrl,
    });

    res.status(201).json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register asset' });
  }
}

// GET /api/assets?assetTag=&serialNumber=&status=&categoryId=&location=
async function searchAssets(req, res) {
  try {
    const assets = await AssetModel.search(req.query);
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
}

// GET /api/assets/:id
async function getAssetById(req, res) {
  try {
    const asset = await AssetModel.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
}

// PATCH /api/assets/:id/status
async function updateAssetStatus(req, res) {
  try {
    const { status: newStatus } = req.body;
    const asset = await AssetModel.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (!canTransition(asset.status, newStatus)) {
      return res.status(400).json({
        error: `Cannot transition asset from ${asset.status} to ${newStatus}`,
      });
    }

    const updated = await AssetModel.updateStatus(req.params.id, newStatus);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Status update failed' });
  }
}

module.exports = { registerAsset, searchAssets, getAssetById, updateAssetStatus };