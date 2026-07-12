const prisma = require('../config/db');

async function generateAssetTag() {
  const lastAsset = await prisma.asset.findFirst({
    orderBy: { id: 'desc' },
  });
  const nextNumber = lastAsset ? lastAsset.id + 1 : 1;
  return `AF-${String(nextNumber).padStart(4, '0')}`;
}

module.exports = generateAssetTag;