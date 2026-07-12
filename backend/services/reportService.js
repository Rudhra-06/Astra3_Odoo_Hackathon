const prisma = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const REPORT_STYLES = {
  headerColor: '101828',
  accentColor: '14B8A6',
  altRowColor: 'F9FAFB',
};

async function getAssetData(filters = {}) {
  const where = { deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = Number(filters.categoryId);
  if (filters.departmentId) where.departmentId = Number(filters.departmentId);
  if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
  if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };

  return prisma.asset.findMany({
    where,
    include: {
      category: true,
      vendor: true,
      allocations: { where: { isActive: true }, include: { allocatedToUser: { select: { name: true } } } },
    },
    orderBy: { assetTag: 'asc' },
  });
}

async function getAllocationData(filters = {}) {
  const where = {};
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
  if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };

  return prisma.allocation.findMany({
    where,
    include: {
      asset: { select: { assetTag: true, name: true, category: true } },
      allocatedToUser: { select: { name: true, email: true } },
      allocatedByUser: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getMaintenanceData(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.dateFrom) where.scheduledDate = { gte: new Date(filters.dateFrom) };
  if (filters.dateTo) where.scheduledDate = { ...where.scheduledDate, lte: new Date(filters.dateTo) };

  return prisma.maintenanceRecord.findMany({
    where,
    include: { asset: { select: { assetTag: true, name: true } } },
    orderBy: { scheduledDate: 'desc' },
  });
}

async function getBookingData(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.dateFrom) where.startTime = { gte: new Date(filters.dateFrom) };
  if (filters.dateTo) where.startTime = { ...where.startTime, lte: new Date(filters.dateTo) };

  return prisma.booking.findMany({
    where,
    include: {
      asset: { select: { assetTag: true, name: true } },
      bookedBy: { select: { name: true, email: true } },
    },
    orderBy: { startTime: 'desc' },
  });
}

async function getWarrantyData() {
  const in90 = new Date();
  in90.setDate(in90.getDate() + 90);
  return prisma.asset.findMany({
    where: { deletedAt: null, warrantyExpiry: { not: null } },
    include: { category: true, vendor: true },
    orderBy: { warrantyExpiry: 'asc' },
  });
}

function warrantyStatus(expiry) {
  if (!expiry) return 'N/A';
  const now = new Date();
  const diff = Math.ceil((new Date(expiry) - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'EXPIRED';
  if (diff <= 7) return 'CRITICAL';
  if (diff <= 30) return 'WARNING';
  if (diff <= 90) return 'NOTICE';
  return 'VALID';
}

const ReportService = {
  generateExcel: async (type, filters) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'AssetFlow ERP';
    wb.created = new Date();

    const ws = wb.addWorksheet(type, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + REPORT_STYLES.headerColor } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { bottom: { style: 'thin', color: { argb: 'FF' + REPORT_STYLES.accentColor } } },
    };

    if (type === 'assets') {
      const data = await getAssetData(filters);
      ws.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 14 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Status', key: 'status', width: 18 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Condition', key: 'condition', width: 12 },
        { header: 'Acquisition Cost', key: 'acquisitionCost', width: 18 },
        { header: 'Warranty Expiry', key: 'warrantyExpiry', width: 18 },
        { header: 'Warranty Status', key: 'warrantyStatus', width: 16 },
        { header: 'Current Holder', key: 'holder', width: 22 },
        { header: 'Vendor', key: 'vendor', width: 20 },
        { header: 'Registered On', key: 'createdAt', width: 18 },
      ];
      ws.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
      data.forEach((a, i) => {
        const row = ws.addRow({
          assetTag: a.assetTag,
          name: a.name,
          category: a.category?.name || '',
          status: a.status,
          location: a.location || '',
          condition: a.condition || '',
          acquisitionCost: a.acquisitionCost ? Number(a.acquisitionCost) : '',
          warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : '',
          warrantyStatus: warrantyStatus(a.warrantyExpiry),
          holder: a.allocations[0]?.allocatedToUser?.name || 'Unallocated',
          vendor: a.vendor?.name || '',
          createdAt: new Date(a.createdAt).toLocaleDateString(),
        });
        if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    } else if (type === 'maintenance') {
      const data = await getMaintenanceData(filters);
      ws.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 14 },
        { header: 'Asset Name', key: 'assetName', width: 28 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Description', key: 'description', width: 35 },
        { header: 'Vendor', key: 'vendor', width: 20 },
        { header: 'Scheduled Date', key: 'scheduledDate', width: 18 },
        { header: 'Completed Date', key: 'completedDate', width: 18 },
        { header: 'Estimated Cost', key: 'estimatedCost', width: 16 },
        { header: 'Actual Cost', key: 'actualCost', width: 14 },
      ];
      ws.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
      data.forEach((r, i) => {
        const row = ws.addRow({
          assetTag: r.asset?.assetTag || '',
          assetName: r.asset?.name || '',
          status: r.status,
          priority: r.priority,
          description: r.description,
          vendor: r.vendor || '',
          scheduledDate: new Date(r.scheduledDate).toLocaleDateString(),
          completedDate: r.completedDate ? new Date(r.completedDate).toLocaleDateString() : '',
          estimatedCost: r.estimatedCost ? Number(r.estimatedCost) : '',
          actualCost: r.actualCost ? Number(r.actualCost) : '',
        });
        if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    } else if (type === 'bookings') {
      const data = await getBookingData(filters);
      ws.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 14 },
        { header: 'Asset Name', key: 'assetName', width: 28 },
        { header: 'Booked By', key: 'bookedBy', width: 22 },
        { header: 'Start Time', key: 'startTime', width: 22 },
        { header: 'End Time', key: 'endTime', width: 22 },
        { header: 'Purpose', key: 'purpose', width: 30 },
        { header: 'Status', key: 'status', width: 14 },
      ];
      ws.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
      data.forEach((b, i) => {
        const row = ws.addRow({
          assetTag: b.asset?.assetTag || '',
          assetName: b.asset?.name || '',
          bookedBy: b.bookedBy?.name || '',
          startTime: new Date(b.startTime).toLocaleString(),
          endTime: new Date(b.endTime).toLocaleString(),
          purpose: b.purpose || '',
          status: b.status,
        });
        if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    } else if (type === 'warranty') {
      const data = await getWarrantyData();
      ws.columns = [
        { header: 'Asset Tag', key: 'assetTag', width: 14 },
        { header: 'Name', key: 'name', width: 28 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Vendor', key: 'vendor', width: 20 },
        { header: 'Warranty Start', key: 'warrantyStart', width: 18 },
        { header: 'Warranty Expiry', key: 'warrantyExpiry', width: 18 },
        { header: 'Days Remaining', key: 'daysRemaining', width: 16 },
        { header: 'Status', key: 'status', width: 14 },
      ];
      ws.getRow(1).eachCell(cell => Object.assign(cell, headerStyle));
      data.forEach((a, i) => {
        const now = new Date();
        const days = a.warrantyExpiry
          ? Math.ceil((new Date(a.warrantyExpiry) - now) / (1000 * 60 * 60 * 24))
          : null;
        const row = ws.addRow({
          assetTag: a.assetTag,
          name: a.name,
          category: a.category?.name || '',
          vendor: a.vendor?.name || '',
          warrantyStart: a.warrantyStart ? new Date(a.warrantyStart).toLocaleDateString() : '',
          warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : '',
          daysRemaining: days !== null ? days : '',
          status: warrantyStatus(a.warrantyExpiry),
        });
        if (i % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    }

    return wb.xlsx.writeBuffer();
  },

  generateCSV: async (type, filters) => {
    let data, headers, rows;

    if (type === 'assets') {
      data = await getAssetData(filters);
      headers = ['Asset Tag', 'Name', 'Category', 'Status', 'Location', 'Condition', 'Acquisition Cost', 'Warranty Expiry', 'Warranty Status', 'Current Holder', 'Vendor'];
      rows = data.map(a => [
        a.assetTag, a.name, a.category?.name || '', a.status, a.location || '',
        a.condition || '', a.acquisitionCost || '', a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : '',
        warrantyStatus(a.warrantyExpiry), a.allocations[0]?.allocatedToUser?.name || 'Unallocated', a.vendor?.name || '',
      ]);
    } else if (type === 'maintenance') {
      data = await getMaintenanceData(filters);
      headers = ['Asset Tag', 'Asset Name', 'Status', 'Priority', 'Description', 'Vendor', 'Scheduled Date', 'Actual Cost'];
      rows = data.map(r => [
        r.asset?.assetTag || '', r.asset?.name || '', r.status, r.priority,
        r.description, r.vendor || '', new Date(r.scheduledDate).toLocaleDateString(), r.actualCost || '',
      ]);
    } else if (type === 'bookings') {
      data = await getBookingData(filters);
      headers = ['Asset Tag', 'Asset Name', 'Booked By', 'Start Time', 'End Time', 'Purpose', 'Status'];
      rows = data.map(b => [
        b.asset?.assetTag || '', b.asset?.name || '', b.bookedBy?.name || '',
        new Date(b.startTime).toLocaleString(), new Date(b.endTime).toLocaleString(), b.purpose || '', b.status,
      ]);
    } else {
      data = await getWarrantyData();
      headers = ['Asset Tag', 'Name', 'Category', 'Vendor', 'Warranty Expiry', 'Days Remaining', 'Status'];
      rows = data.map(a => {
        const days = a.warrantyExpiry ? Math.ceil((new Date(a.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : '';
        return [a.assetTag, a.name, a.category?.name || '', a.vendor?.name || '',
          a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : '', days, warrantyStatus(a.warrantyExpiry)];
      });
    }

    const escape = v => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    return Buffer.from(csv, 'utf-8');
  },

  generatePDF: async (type, filters) => {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, doc.page.width, 60).fill('#101828');
      doc.fillColor('#14B8A6').fontSize(20).font('Helvetica-Bold').text('AssetFlow ERP', 40, 18);
      doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica').text(`${type.toUpperCase()} REPORT`, 40, 40);
      doc.fillColor('#9CA3AF').fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, doc.page.width - 220, 40);

      doc.moveDown(3);
      doc.fillColor('#101828').fontSize(10).font('Helvetica');

      if (type === 'assets') {
        const data = await getAssetData(filters);
        doc.text(`Total Assets: ${data.length}`, 40, 80);
        doc.moveDown();

        const cols = [
          { label: 'Tag', width: 70 }, { label: 'Name', width: 160 },
          { label: 'Category', width: 90 }, { label: 'Status', width: 90 },
          { label: 'Location', width: 110 }, { label: 'Warranty', width: 80 },
        ];
        let x = 40, y = doc.y;

        // Table header
        doc.rect(x, y, cols.reduce((s, c) => s + c.width, 0), 20).fill('#1D2839');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        cols.forEach(col => {
          doc.text(col.label, x + 4, y + 6, { width: col.width - 8 });
          x += col.width;
        });
        y += 20;

        data.slice(0, 50).forEach((a, i) => {
          if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
          x = 40;
          if (i % 2 === 0) doc.rect(40, y, cols.reduce((s, c) => s + c.width, 0), 18).fill('#F9FAFB');
          doc.fillColor('#101828').fontSize(7.5).font('Helvetica');
          const vals = [a.assetTag, a.name, a.category?.name || '', a.status, a.location || '', warrantyStatus(a.warrantyExpiry)];
          cols.forEach((col, ci) => {
            doc.text(vals[ci] || '', x + 4, y + 5, { width: col.width - 8, ellipsis: true });
            x += col.width;
          });
          y += 18;
        });
      }

      doc.end();
    });
  },
};

module.exports = ReportService;
