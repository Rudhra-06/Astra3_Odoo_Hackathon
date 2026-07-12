const Documents = require('../services/documentService');
const { success, created } = require('../utils/response');
async function list(req, res, next) { try { success(res, { documents: await Documents.list(req.params.assetId) }); } catch (err) { next(err); } }
async function upload(req, res, next) { try { created(res, { document: await Documents.create(req.params.assetId, req.body, req.user?.id) }, 'Document uploaded'); } catch (err) { next(err); } }
async function replace(req, res, next) { try { success(res, { document: await Documents.replace(req.params.id, req.body, req.user?.id) }, 'Document replaced'); } catch (err) { next(err); } }
async function remove(req, res, next) { try { await Documents.remove(req.params.id); success(res, {}, 'Document deleted'); } catch (err) { next(err); } }
module.exports = { list, upload, replace, remove };
