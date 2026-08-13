// backend/routes/farmerRoutes.js
import express from 'express';
import { User, Booking, Notification, Feedback, Equipment, isDbConnected, localDb, logAudit } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/farmer/overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let totalBookings = 0;
    let activeRentals = 0;
    let completed = 0;
    let totalSpent = 0;
    let unreadNotifications = 0;

    if (isDbConnected()) {
      totalBookings = await Booking.countDocuments({ farmer: userId });
      activeRentals = await Booking.countDocuments({ farmer: userId, status: { $in: ['Approved', 'Issued'] } });
      completed = await Booking.countDocuments({ farmer: userId, status: 'Returned' });
      
      const bookings = await Booking.find({ farmer: userId });
      totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      unreadNotifications = await Notification.countDocuments({ user: userId, read: false });
    } else {
      const bookings = localDb.read('bookings').filter(b => b.farmer === userId || b.farmerId === userId);
      const notifications = localDb.read('notifications').filter(n => n.user === userId);

      totalBookings = bookings.length;
      activeRentals = bookings.filter(b => ['Approved', 'Issued'].includes(b.status)).length;
      completed = bookings.filter(b => b.status === 'Returned').length;
      totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      unreadNotifications = notifications.filter(n => !n.read).length;
    }

    return res.json({
      success: true,
      data: {
        totalBookings,
        activeRentals,
        completed,
        totalSpent,
        unreadNotifications
      }
    });
  } catch (err) {
    console.error('Farmer overview error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/farmer/notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (isDbConnected()) {
      list = await Notification.find({ user: userId }).sort({ timestamp: -1 });
    } else {
      list = localDb.read('notifications').filter(n => n.user === userId);
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('Fetch farmer notifications error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/farmer/notifications/:id/read
router.post('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Notification.findByIdAndUpdate(id, { read: true });
    } else {
      const list = localDb.read('notifications');
      const idx = list.findIndex(n => n._id === id || n.id === id);
      if (idx !== -1) {
        list[idx].read = true;
        localDb.write('notifications', list);
      }
    }
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/farmer/feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { bookingId, rating, comments } = req.body;
    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Booking ID and rating are required.' });
    }

    let feedback;
    if (isDbConnected()) {
      feedback = await Feedback.create({
        booking: bookingId,
        farmer: req.user.id,
        rating: parseInt(rating),
        comments
      });
    } else {
      const list = localDb.read('feedbacks') || [];
      feedback = {
        _id: 'FB-' + Date.now(),
        booking: bookingId,
        farmer: req.user.id,
        rating: parseInt(rating),
        comments,
        createdAt: new Date().toISOString()
      };
      list.push(feedback);
      localDb.write('feedbacks', list);
    }

    await logAudit(req, req.user, 'Feedback Submitted', '', String(rating), `Submitted feedback rating ${rating} for booking ${bookingId}`);

    return res.status(201).json({ success: true, message: 'Feedback submitted successfully.', data: feedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
