const ReportService = require('../services/reportService');

const MIME = {
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  pdf: 'application/pdf',
};

const EXT = { excel: 'xlsx', csv: 'csv', pdf: 'pdf' };

async function generateReport(req, res, next) {
  try {
    const { type = 'assets', format = 'excel' } = req.params;
    const filters = req.query;

    let buffer;
    if (format === 'excel') buffer = await ReportService.generateExcel(type, filters);
    else if (format === 'csv') buffer = await ReportService.generateCSV(type, filters);
    else buffer = await ReportService.generatePDF(type, filters);

    const filename = `assetflow-${type}-report-${Date.now()}.${EXT[format]}`;
    res.setHeader('Content-Type', MIME[format]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) { next(err); }
}

module.exports = { generateReport };
