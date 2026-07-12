const prisma = require('../config/db');
const Intelligence = require('./assetIntelligenceService');
const LLM = require('./llmProvider');

function parseQuery(input = '') {
  const q = input.toLowerCase(); const where = { deletedAt: null };
  if (/available|unused|idle/.test(q)) where.status = 'AVAILABLE';
  if (/maintenance/.test(q)) where.status = 'UNDER_MAINTENANCE';
  if (/lost/.test(q)) where.status = 'LOST';
  if (/expired warranty/.test(q)) where.warrantyExpiry = { lt: new Date() };
  if (/warranty expires? (this month|soon)/.test(q)) { const end = new Date(); end.setMonth(end.getMonth() + 1, 0); where.warrantyExpiry = { gte: new Date(), lte: end }; }
  const brands = ['dell', 'macbook', 'apple', 'lenovo', 'hp', 'projector']; const brand = brands.find(x => q.includes(x));
  if (brand) where.name = { contains: brand, mode: 'insensitive' };
  return where;
}
async function search(query) {
  const assets = await prisma.asset.findMany({ where: parseQuery(query), take: 50, orderBy: { updatedAt: 'desc' }, include: { category: true, vendor: true, allocations: { where: { isActive: true }, include: { allocatedToUser: { select: { name: true } } } } } });
  return { query, interpretation: 'Structured filters were inferred from your request.', results: assets.map(a => ({ id:a.id, assetTag:a.assetTag, name:a.name, status:a.status, category:a.category?.name, location:a.location, holder:a.allocations[0]?.allocatedToUser?.name || null, warrantyExpiry:a.warrantyExpiry })) };
}
async function metrics(question) {
  const q = question.toLowerCase();
  if (/most allocated|employee.*most/.test(q)) { const rows = await prisma.allocation.groupBy({ by:['allocatedToUserId'], where:{ isActive:true, allocatedToUserId:{ not:null } }, _count:{id:true}, orderBy:{_count:{id:'desc'}}, take:1 }); const user = rows[0] && await prisma.user.findUnique({where:{id:rows[0].allocatedToUserId},select:{name:true}}); return { text: user ? `${user.name} has the most current allocations (${rows[0]._count.id}).` : 'No active allocations were found.' }; }
  if (/overdue/.test(q)) { const count = await prisma.allocation.count({where:{isActive:true,expectedReturnDate:{lt:new Date()}}}); return { text: `${count} asset${count===1?' is':'s are'} overdue for return.` }; }
  if (/highest utilization/.test(q)) { const rows = await prisma.asset.groupBy({by:['departmentId'],where:{deletedAt:null,status:'ALLOCATED',departmentId:{not:null}},_count:{id:true},orderBy:{_count:{id:'desc'}},take:1}); const dept = rows[0] && await prisma.department.findUnique({where:{id:rows[0].departmentId},select:{name:true}}); return { text: dept ? `${dept.name} currently has the highest allocated asset count (${rows[0]._count.id}).` : 'No department utilization data is available.' }; }
  const results = await search(question); return { text: `Found ${results.results.length} matching assets.`, results: results.results };
}
async function ask(question) { const answer = await metrics(question); let generated = null; try { generated = await LLM.generate(`Question: ${question}\nVerified AssetFlow result: ${answer.text}\nReturn a concise, professional answer without inventing facts.`); } catch (_) { /* deterministic result remains available when provider is unreachable */ } return { question, answer: generated?.text || answer.text, results: answer.results || [], provider: generated?.provider || 'heuristic', degraded: !generated }; }
async function report(type) { const data = await Intelligence.overview(); const total = data.assets.length; const critical = data.assets.filter(x=>x.health.label==='Critical').length; return { type, generatedAt:new Date(), summary: `${type} report: AssetFlow is tracking ${total} assets. ${critical} require critical attention. ${data.idleAssets.length} currently idle assets can be redeployed.`, recommendations:data.recommendations.slice(0,5), metrics:{totalAssets:total, healthDistribution:data.healthDistribution} }; }
module.exports = { search, ask, report };
