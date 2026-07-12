require('dotenv').config();
const express = require('express');
const cors = require('cors');

const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const auditCycleRoutes = require('./routes/auditCycleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orgRoutes = require('./routes/orgRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const reportRoutes = require('./routes/reportRoutes');

const errorHandler = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const { startCronJobs } = require('./utils/cronJobs');

const app = express();

app.use(cors({ exposedHeaders: ['X-Unread-Count'] }));
app.use(express.json({ limit: '10mb' }));
app.use(requestId);

app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/audit-cycles', auditCycleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AssetFlow backend running on port ${PORT}`);
  startCronJobs();
});
