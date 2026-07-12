const prisma = require('../config/db');

const daysBetween = (a, b) => Math.max(0, Math.round((new Date(a) - new Date(b)) / 86400000));
const labelForScore = score => score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 40 ? 'Warning' : 'Critical';

function health(asset) {
  const now = new Date();
  const ageYears = asset.acquisitionDate ? daysBetween(now, asset.acquisitionDate) / 365 : 0;
  const repairs = asset.maintenances.filter(m => ['RESOLVED', 'COMPLETED'].includes(m.status)).length;
  const failedAudit = asset.auditItems.filter(a => ['MISSING', 'DAMAGED'].includes(a.verificationStatus)).length;
  let score = 100 - Math.min(25, ageYears * 4) - Math.min(30, repairs * 7) - Math.min(25, failedAudit * 12);
  if (asset.condition && /poor|damaged|bad/i.test(asset.condition)) score -= 20;
  if (asset.warrantyExpiry && new Date(asset.warrantyExpiry) < now) score -= 8;
  if (asset.status === 'LOST') score = 0;
  if (asset.status === 'UNDER_MAINTENANCE') score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, label: labelForScore(score), factors: { ageYears: Number(ageYears.toFixed(1)), repairs, failedAudit, warrantyActive: !asset.warrantyExpiry || new Date(asset.warrantyExpiry) >= now } };
}

function maintenancePrediction(asset) {
  const completed = asset.maintenances.filter(m => m.completedDate).sort((a, b) => new Date(a.completedDate) - new Date(b.completedDate));
  const intervals = completed.slice(1).map((m, i) => daysBetween(m.completedDate, completed[i].completedDate));
  const averageRepairInterval = intervals.length ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : null;
  const last = completed.at(-1)?.completedDate || asset.acquisitionDate || asset.createdAt;
  const daysSinceRepair = daysBetween(new Date(), last);
  const failureCount = completed.length;
  const riskScore = Math.min(100, failureCount * 18 + (averageRepairInterval && daysSinceRepair > averageRepairInterval ? 25 : 0) + (asset.condition && /poor|damaged/i.test(asset.condition) ? 25 : 0));
  const risk = riskScore >= 55 ? 'High Risk' : riskScore >= 25 ? 'Medium Risk' : 'Low Risk';
  const recommendedDate = new Date(); recommendedDate.setDate(recommendedDate.getDate() + (averageRepairInterval ? Math.max(7, averageRepairInterval - daysSinceRepair) : risk === 'High Risk' ? 7 : 45));
  return { maintenanceFrequency: failureCount, averageRepairInterval, failureCount, daysSinceRepair, risk, recommendedMaintenanceDate: recommendedDate, recommendation: risk === 'Low Risk' ? 'Continue scheduled inspection cadence.' : 'Schedule preventive maintenance before the next likely failure.' };
}

async function assetInsights(id) {
  const asset = await prisma.asset.findFirst({ where: { id: Number(id), deletedAt: null }, include: { maintenances: true, auditItems: true, bookings: true } });
  if (!asset) return null;
  return { health: health(asset), maintenance: maintenancePrediction(asset) };
}

async function overview() {
  const assets = await prisma.asset.findMany({ where: { deletedAt: null }, include: { maintenances: true, auditItems: true, bookings: true, category: true } });
  const insights = assets.map(a => ({ asset: a, health: health(a), maintenance: maintenancePrediction(a) }));
  const idle = insights.filter(x => x.asset.status === 'AVAILABLE' && x.asset.bookings.length === 0);
  const recommendations = [];
  for (const x of insights.filter(x => x.health.score < 40)) recommendations.push({ type: 'REPLACE', priority: 'high', assetId: x.asset.id, message: `Replace or inspect ${x.asset.assetTag}; health is ${x.health.score}/100.` });
  for (const x of idle.slice(0, 10)) recommendations.push({ type: 'REDEPLOY', priority: 'medium', assetId: x.asset.id, message: `Redeploy under-utilized asset ${x.asset.assetTag} (${x.asset.name}).` });
  return { healthDistribution: ['Excellent', 'Good', 'Warning', 'Critical'].map(label => ({ label, count: insights.filter(x => x.health.label === label).length })), topUsedAssets: [...assets].sort((a,b) => b.bookings.length - a.bookings.length).slice(0, 5).map(a => ({ id:a.id, assetTag:a.assetTag, name:a.name, bookings:a.bookings.length })), idleAssets: idle.slice(0, 10).map(x => ({ id:x.asset.id, assetTag:x.asset.assetTag, name:x.asset.name })), recommendations, assets: insights.map(x => ({ id:x.asset.id, assetTag:x.asset.assetTag, health:x.health, maintenance:x.maintenance })) };
}

module.exports = { assetInsights, overview, health, maintenancePrediction };
