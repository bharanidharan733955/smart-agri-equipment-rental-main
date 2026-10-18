// backend/routes/auditRoutes.js
import express from 'express';
import { AuditLog, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', authenticateToken, authorizeRoles('Manager', 'Officer', 'Admin'), async (req, res) => {
  try {
    let logs = [];
    if (isDbConnected()) {
      logs = await AuditLog.find().sort({ timestamp: -1 });
    } else {
      logs = localDb.read('auditlogs');
      // Sort reverse chronological
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
