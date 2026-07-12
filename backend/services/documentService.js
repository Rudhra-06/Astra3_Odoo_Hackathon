const prisma = require('../config/db');
const { NotFoundError, BusinessRuleError } = require('../errors');

async function list(assetId) { return prisma.assetDocument.findMany({ where: { assetId: Number(assetId) }, orderBy: { createdAt: 'desc' } }); }
async function create(assetId, data, userId) {
  const asset = await prisma.asset.findFirst({ where: { id: Number(assetId), deletedAt: null } });
  if (!asset) throw new NotFoundError('Asset');
  if (!data.name || !data.type || (!data.dataUrl && !data.externalUrl)) throw new BusinessRuleError('Document name, type, and file content or URL are required');
  if (data.dataUrl && data.dataUrl.length > 9_000_000) throw new BusinessRuleError('Document exceeds the 6 MB upload limit');
  return prisma.assetDocument.create({ data: { assetId: Number(assetId), name: data.name, type: data.type, mimeType: data.mimeType || 'application/octet-stream', size: Number(data.size || 0), dataUrl: data.dataUrl || null, externalUrl: data.externalUrl || null, createdById: userId || null } });
}
async function replace(id, data, userId) { const current = await prisma.assetDocument.findUnique({ where: { id: Number(id) } }); if (!current) throw new NotFoundError('Document'); return prisma.assetDocument.update({ where: { id: Number(id) }, data: { name: data.name || current.name, type: data.type || current.type, mimeType: data.mimeType || current.mimeType, size: Number(data.size ?? current.size), dataUrl: data.dataUrl || current.dataUrl, externalUrl: data.externalUrl || current.externalUrl, createdById: userId || current.createdById } }); }
async function remove(id) { const doc = await prisma.assetDocument.findUnique({ where: { id: Number(id) } }); if (!doc) throw new NotFoundError('Document'); await prisma.assetDocument.delete({ where: { id: Number(id) } }); }
module.exports = { list, create, replace, remove };
