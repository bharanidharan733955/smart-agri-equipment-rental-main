// backend/routes/jobRoutes.js
import express from 'express';
import { Job, Booking, Equipment, Notification, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/jobs (Fetch jobs for logged in Operator or manager)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      if (req.user.role === 'Equipment Operator') {
        list = await Job.find({ operator: req.user.id })
          .populate('equipment')
          .populate('farmer', 'name email mobile');
      } else {
        list = await Job.find()
          .populate('equipment')
          .populate('farmer', 'name email mobile')
          .populate('operator', 'name email mobile');
      }
    } else {
      list = localDb.read('jobs');
      const equipment = localDb.read('equipment');
      const users = localDb.read('users');

      list = list.map(j => ({
        ...j,
        equipment: equipment.find(e => e._id === j.equipment || e.id === j.equipment),
        farmer: users.find(u => u._id === j.farmer) || { name: 'Farmer' },
        operator: users.find(u => u._id === j.operator) || { name: 'Equipment Operator' }
      }));

      if (req.user.role === 'Equipment Operator') {
        list = list.filter(j => j.operator._id === req.user.id || j.operator === req.user.id);
      }
    }

    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('Fetch jobs error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/start (Operator starts job)
router.post('/:id/start', authenticateToken, authorizeRoles('Operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { beforeImage } = req.body;
    let job;
    let eq;

    if (isDbConnected()) {
      job = await Job.findById(id);
      if (job) {
        eq = await Equipment.findById(job.equipment);
      }
    } else {
      const jobs = localDb.read('jobs');
      job = jobs.find(j => j._id === id || j.id === id);
      if (job) {
        const equipment = localDb.read('equipment');
        eq = equipment.find(e => e._id === job.equipment || e.id === job.equipment);
      }
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: `Job has already been ${job.status}` });
    }

    // Update states
    job.status = 'Started';
    job.startTime = new Date();
    if (beforeImage) {
      job.beforeImage = beforeImage;
    }

    if (eq) {
      eq.status = 'In Use';
    }

    // Update Booking status
    let bookingId = job.booking;

    if (isDbConnected()) {
      await job.save();
      await eq.save();
      await Booking.findByIdAndUpdate(bookingId, { status: 'Issued' });

      // Notify Farmer
      await Notification.create({
        user: job.farmer,
        title: 'Work Started',
        message: `Operator has started work on your booking for ${eq.name}.`
      });
    } else {
      const jobs = localDb.read('jobs');
      const jIdx = jobs.findIndex(j => j._id === id || j.id === id);
      jobs[jIdx].status = 'Started';
      jobs[jIdx].startTime = new Date().toISOString();
      if (beforeImage) jobs[jIdx].beforeImage = beforeImage;
      localDb.write('jobs', jobs);

      if (eq) {
        const equipment = localDb.read('equipment');
        const eqIdx = equipment.findIndex(e => e._id === eq._id || e.id === eq.id);
        equipment[eqIdx].status = 'In Use';
        localDb.write('equipment', equipment);
      }

      const bookings = localDb.read('bookings');
      const bIdx = bookings.findIndex(b => b._id === bookingId || b.id === bookingId);
      if (bIdx !== -1) {
        bookings[bIdx].status = 'Issued';
        localDb.write('bookings', bookings);
      }

      // Notify Farmer
      const notifications = localDb.read('notifications');
      notifications.push({
        _id: 'NTF-' + Date.now(),
        user: job.farmer,
        title: 'Work Started',
        message: `Operator has started work on your booking for ${eq?.name || 'equipment'}.`,
        read: false,
        timestamp: new Date().toISOString()
      });
      localDb.write('notifications', notifications);
    }

    await logAudit(req, req.user, 'Work Started', 'Assigned', 'Started', `Operator started job ID ${id}`);

    return res.json({ success: true, message: 'Job started successfully.', data: job });
  } catch (err) {
    console.error('Start job error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/complete (Operator completes job)
router.post('/:id/complete', authenticateToken, authorizeRoles('Operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fuelUsed, workingHours, remarks, afterImage } = req.body;
    let job;
    let eq;

    if (isDbConnected()) {
      job = await Job.findById(id);
      if (job) {
        eq = await Equipment.findById(job.equipment);
      }
    } else {
      const jobs = localDb.read('jobs');
      job = jobs.find(j => j._id === id || j.id === id);
      if (job) {
        const equipment = localDb.read('equipment');
        eq = equipment.find(e => e._id === job.equipment || e.id === job.equipment);
      }
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    if (job.status !== 'Started') {
      return res.status(400).json({ success: false, message: 'Job must be started before completing.' });
    }

    const hours = parseFloat(workingHours) || 1;
    const fuel = parseFloat(fuelUsed) || 0;

    // Update job details
    job.status = 'Completed';
    job.endTime = new Date();
    job.fuelUsed = fuel;
    job.workingHours = hours;
    job.remarks = remarks || '';
    if (afterImage) {
      job.afterImage = afterImage;
    }

    let bookingId = job.booking;

    // Check preventative maintenance threshold
    let newEquipmentHours = (eq ? (eq.totalUsageHours || 0) : 0) + hours;
    let nextStatus = 'Available';

    if (newEquipmentHours >= 100) {
      nextStatus = 'Under Maintenance';
    }

    if (eq) {
      eq.status = nextStatus;
      eq.totalUsageHours = newEquipmentHours;
    }

    if (isDbConnected()) {
      await job.save();
      if (eq) await eq.save();

      // Update booking
      await Booking.findByIdAndUpdate(bookingId, { status: 'Returned' });

      // Notify Farmer
      await Notification.create({
        user: job.farmer,
        title: 'Work Completed',
        message: `Your equipment rental order has been completed. Job report details are available.`
      });
    } else {
      const jobs = localDb.read('jobs');
      const jIdx = jobs.findIndex(j => j._id === id || j.id === id);
      jobs[jIdx].status = 'Completed';
      jobs[jIdx].endTime = new Date().toISOString();
      jobs[jIdx].fuelUsed = fuel;
      jobs[jIdx].workingHours = hours;
      jobs[jIdx].remarks = remarks || '';
      if (afterImage) jobs[jIdx].afterImage = afterImage;
      localDb.write('jobs', jobs);

      if (eq) {
        const equipment = localDb.read('equipment');
        const eqIdx = equipment.findIndex(e => e._id === eq._id || e.id === eq.id);
        equipment[eqIdx].status = nextStatus;
        equipment[eqIdx].totalUsageHours = newEquipmentHours;
        localDb.write('equipment', equipment);
      }

      const bookings = localDb.read('bookings');
      const bIdx = bookings.findIndex(b => b._id === bookingId || b.id === bookingId);
      if (bIdx !== -1) {
        bookings[bIdx].status = 'Returned';
        localDb.write('bookings', bookings);
      }

      // Notify Farmer
      const notifications = localDb.read('notifications');
      notifications.push({
        _id: 'NTF-' + Date.now(),
        user: job.farmer,
        title: 'Work Completed',
        message: `Your equipment rental order has been completed. Job report details are available.`,
        read: false,
        timestamp: new Date().toISOString()
      });
      localDb.write('notifications', notifications);
    }

    await logAudit(req, req.user, 'Work Completed', 'Started', 'Completed', `Operator completed job ID ${id}. Working hours: ${hours}, Fuel: ${fuel}`);

    return res.json({ success: true, message: 'Job completed successfully.', data: job });
  } catch (err) {
    console.error('Complete job error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
