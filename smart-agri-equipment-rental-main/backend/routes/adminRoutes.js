// backend/routes/adminRoutes.js
import express from 'express';
import { User, Equipment, AuditLog, isDbConnected, localDb, logAudit } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/users (Admin gets list of all users)
router.get('/users', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    let users = [];
    if (isDbConnected()) {
      users = await User.find().select('-password');
    } else {
      users = localDb.read('users');
    }
    return res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/admin/users/:id/role (Modify user role/details)
router.put('/users/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, district, cooperativeHub, isApproved } = req.body;
    let user;

    if (isDbConnected()) {
      user = await User.findByIdAndUpdate(id, { role, district, cooperativeHub, isApproved }, { new: true });
    } else {
      const users = localDb.read('users');
      const idx = users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], role, district, cooperativeHub, isApproved };
        user = users[idx];
        localDb.write('users', users);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logAudit(req, req.user, 'Update User Role', '', role, `Admin updated role details for user ${user.name}`);

    return res.json({ success: true, message: 'User updated successfully.', data: user });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let deleted;

    if (isDbConnected()) {
      deleted = await User.findByIdAndDelete(id);
    } else {
      const users = localDb.read('users');
      const idx = users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        deleted = users.splice(idx, 1)[0];
        localDb.write('users', users);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logAudit(req, req.user, 'Delete User', deleted.email, '', `Admin deleted user ${deleted.name}`);

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
