require('dotenv').config();
const express = require('express');
const cors = require('cors');

const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const authRoutes = require("./routes/authRoutes");
// Namii will add: const bookingRoutes = require('./routes/bookingRoutes');
// Namii will add: const auditRoutes = require('./routes/auditRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use("/api/auth", authRoutes);

// app.use('/api/bookings', bookingRoutes);
// app.use('/api/audits', auditRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AssetFlow backend running on port ${PORT}`));