const prisma = require('../config/db');

const TransferRepository = {
  create: (data) =>
    prisma.transferRequest.create({ data, include: { asset: true } }),

  findById: (id) =>
    prisma.transferRequest.findUnique({
      where: { id: Number(id) },
      include: { asset: true },
    }),

  update: (id, data) =>
    prisma.transferRequest.update({ where: { id: Number(id) }, data }),

  findPendingForAsset: (assetId) =>
    prisma.transferRequest.findFirst({
      where: { assetId: Number(assetId), status: 'REQUESTED' },
    }),
};

module.exports = TransferRepository;
