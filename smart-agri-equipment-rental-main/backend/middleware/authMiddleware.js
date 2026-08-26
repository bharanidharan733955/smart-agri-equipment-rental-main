// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agrirent-super-secret-key-12345';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions.' });
    }
    const userRole = req.user.role;
    let isAuthorized = false;
    for (const r of roles) {
      if (r === 'Farmer' && userRole === 'Farmer') isAuthorized = true;
      if (r === 'Operator' && userRole === 'Equipment Operator') isAuthorized = true;
      if (r === 'Officer' && userRole === 'Officer') isAuthorized = true;
      if ((r === 'Admin' || r === 'Manager' || r === 'Officer') && (userRole === 'Staff' || userRole === 'Equipmaintance')) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions.' });
    }
    next();
  };
}
