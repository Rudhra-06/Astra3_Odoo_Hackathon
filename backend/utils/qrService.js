const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const QRService = {
  generateCode: () => uuidv4(),

  generateDataUrl: async (assetId, qrCode) => {
    const url = `${FRONTEND_URL}/assets/${assetId}?qr=${qrCode}`;
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: { dark: '#101828', light: '#FFFFFF' },
    });
  },

  generateBuffer: async (assetId, qrCode) => {
    const url = `${FRONTEND_URL}/assets/${assetId}?qr=${qrCode}`;
    return QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
    });
  },
};

module.exports = QRService;
