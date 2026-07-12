const Intelligence = require('../services/assetIntelligenceService');
const Assistant = require('../services/assistantService');
const Ocr = require('../services/ocrService');
const { success } = require('../utils/response');
const { NotFoundError } = require('../errors');

async function getAssetInsights(req, res, next) { try { const insights = await Intelligence.assetInsights(req.params.id); if (!insights) throw new NotFoundError('Asset'); success(res, { insights }); } catch (err) { next(err); } }
async function getOverview(req, res, next) { try { success(res, { intelligence: await Intelligence.overview() }); } catch (err) { next(err); } }
async function naturalSearch(req, res, next) { try { success(res, await Assistant.search(req.body.query || req.query.query || '')); } catch (err) { next(err); } }
async function ask(req, res, next) { try { success(res, await Assistant.ask(req.body.question || '')); } catch (err) { next(err); } }
async function report(req, res, next) { try { success(res, { report: await Assistant.report(req.body.type || 'Operations') }); } catch (err) { next(err); } }
async function invoiceOcr(req, res, next) { try { success(res, { extracted: Ocr.extractInvoiceFields(req.body.text || '') }); } catch (err) { next(err); } }
module.exports = { getAssetInsights, getOverview, naturalSearch, ask, report, invoiceOcr };
