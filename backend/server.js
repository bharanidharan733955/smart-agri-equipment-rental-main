// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import { setupCronJobs } from './cron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/authRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import coopRoutes from './routes/coopRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  // Start background cron monitors
  setupCronJobs();
});

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'AGRIX State Cooperative Backend API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/cooperative', coopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/audit-logs', auditRoutes);

// Serve Frontend Production Build if present
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 AGRIX Backend Server Running on Port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
