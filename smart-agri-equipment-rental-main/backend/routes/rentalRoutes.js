// backend/routes/rentalRoutes.js
import express from 'express';
import { Booking, Equipment, User, Job, Invoice, Notification, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/rentals (All bookings - accessible by Farmer, Manager, Admin, Officer)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      if (req.user.role === 'Farmer') {
        list = await Booking.find({ farmer: req.user.id }).populate('equipment');
      } else {
        list = await Booking.find().populate('equipment').populate('farmer', 'name email mobile');
      }
    } else {
      list = localDb.read('bookings');
      // Populate equipment manually if in localdb
      const equipment = localDb.read('equipment');
      const users = localDb.read('users');

      list = list.map(b => ({
        ...b,
        equipment: equipment.find(e => e._id === b.equipment || e.id === b.equipment),
        farmer: users.find(u => u._id === b.farmer) || { name: 'Farmer' }
      }));

      if (req.user.role === 'Farmer') {
        list = list.filter(b => b.farmer._id === req.user.id || b.farmerId === req.user.id || b.farmer === req.user.id);
      }
    }

    let jobsList = [];
    if (isDbConnected()) {
      jobsList = await Job.find().populate('operator', 'name email mobile');
    } else {
      jobsList = localDb.read('jobs') || [];
      const users = localDb.read('users') || [];
      jobsList = jobsList.map(j => ({
        ...j,
        operator: users.find(u => u._id === j.operator || u.id === j.operator) || { name: 'Operator' }
      }));
    }

    const populatedList = list.map(b => {
      const bIdStr = b._id?.toString() || b.id?.toString();
      const job = jobsList.find(j => {
        const jBkId = j.booking?._id?.toString() || j.booking?.toString() || j.booking;
        return jBkId === bIdStr;
      });
      return {
        ...JSON.parse(JSON.stringify(b)),
        jobDetails: job || null
      };
    });

    return res.json({ success: true, count: populatedList.length, data: populatedList });
  } catch (err) {
    console.error('Fetch rentals error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/rentals (Farmer creates request)
router.post('/', authenticateToken, authorizeRoles('Farmer'), async (req, res) => {
  try {
    const { equipmentId, startDate, durationDays } = req.body;
    if (!equipmentId || !startDate || !durationDays) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const duration = parseInt(durationDays);
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);

    // Retrieve equipment details
    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(equipmentId);
    } else {
      const items = localDb.read('equipment');
      eq = items.find(e => e._id === equipmentId || e.id === equipmentId);
    }

    if (!eq) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    if (eq.status === 'Under Maintenance' || eq.status === 'Under Inspection' || eq.status === 'Maintenance Required' || eq.status === 'Awaiting Maintenance Approval') {
      return res.status(400).json({ success: false, message: 'Equipment is currently unavailable due to maintenance.' });
    }

    // Find all future bookings to evaluate availability and maintenance capacity
    let allFutureBookings = [];
    if (isDbConnected()) {
      allFutureBookings = await Booking.find({
        equipment: equipmentId,
        status: { $in: ['Approved', 'Issued', 'Reserved', 'Pending'] },
      });
    } else {
      const bookings = localDb.read('bookings');
      allFutureBookings = bookings.filter(b =>
        (b.equipment === equipmentId || b.equipmentId === equipmentId) &&
        ['Approved', 'Issued', 'Reserved', 'Pending'].includes(b.status)
      );
    }

    let selectedUnitNum = null;

    for (let i = 1; i <= 15; i++) {
      // 1. Time overlap check
      const unitBookings = allFutureBookings.filter(b => b.unitNum === i);
      
      const hasOverlap = unitBookings.some(b => 
        (new Date(b.startDate) <= end && new Date(b.endDate) >= start)
      );

      if (hasOverlap) continue; // Skip to next unit if dates overlap

      // 2. Maintenance hours simulation
      let currentUnitHours = 0;
      if (eq.units) {
        const u = eq.units.find(u => u.unitNum === i);
        if (u) currentUnitHours = u.hours || 0;
      } else {
        currentUnitHours = eq.totalUsageHours || 0;
      }

      // Collect all future bookings for this unit + the new requested booking
      const timeline = [
        ...unitBookings,
        { startDate: start, durationDays: duration }
      ];
      // Sort chronologically by start date
      timeline.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      let simHours = currentUnitHours;
      let maintenanceExceeded = false;
      
      for (const b of timeline) {
        simHours += (b.durationDays * 9); // 9 hours of operation per day
        if (simHours > 360) {
          maintenanceExceeded = true;
          break;
        }
      }

      // If unit satisfies both time and maintenance constraints, select it
      if (!maintenanceExceeded) {
        selectedUnitNum = i;
        break;
      }
    }

    if (!selectedUnitNum) {
      return res.status(400).json({ success: false, message: 'This equipment is not available for the selected dates (all units are booked or lack sufficient maintenance hours).' });
    }

    const totalAmount = eq.rentalRate * duration;
    
    // Automatically approve since stock is available
    const bookingStatus = 'Approved'; 
    let newBooking;

    // Resolve assigned operator
    let operatorId = eq.assignedOperator;
    if (!operatorId) {
      let opUser;
      if (isDbConnected()) {
        opUser = await User.findOne({ role: 'Equipment Operator' });
        if (opUser) operatorId = opUser._id;
      } else {
        const users = localDb.read('users');
        opUser = users.find(u => u.role === 'Equipment Operator');
        if (opUser) operatorId = opUser._id || opUser.id;
      }
    }

    const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const tax = Math.round(totalAmount * 0.18); // 18% GST
    const invoiceTotal = totalAmount + tax;

    if (isDbConnected()) {
      newBooking = await Booking.create({
        farmer: req.user.id,
        equipment: equipmentId,
        unitNum: selectedUnitNum,
        startDate: start,
        durationDays: duration,
        endDate: end,
        rentalRate: eq.rentalRate,
        totalAmount,
        status: bookingStatus
      });

      // Update the specific unit status to 'Reserved'
      const unit = eq.units.find(u => u.unitNum === selectedUnitNum);
      if (unit) {
        unit.status = 'Reserved';
        await eq.save();
      }

      // Create Job automatically
      await Job.create({
        booking: newBooking._id,
        farmer: req.user.id,
        equipment: equipmentId,
        unitNum: selectedUnitNum,
        operator: operatorId || null,
        status: 'Assigned'
      });

      // Create Invoice automatically
      await Invoice.create({
        invoiceNumber: invoiceNum,
        booking: newBooking._id,
        amount: totalAmount,
        tax,
        penalty: 0,
        totalAmount: invoiceTotal,
        paymentStatus: 'Paid'
      });

      // Send Notification to Operator if assigned
      if (operatorId) {
        await Notification.create({
          user: operatorId,
          title: 'New Job Assigned',
          message: `You have been assigned to work order for ${eq.name}.`
        });
      }

      // Send Notification to Farmer
      await Notification.create({
        user: req.user.id,
        title: 'Booking Approved',
        message: `Your booking request for ${eq.name} has been automatically approved.`
      });

    } else {
      const bookings = localDb.read('bookings');
      newBooking = {
        _id: 'BK-' + Date.now(),
        id: 'BK-' + Date.now(),
        farmer: req.user.id,
        farmerId: req.user.id,
        equipment: equipmentId,
        equipmentId,
        unitNum: selectedUnitNum,
        startDate: start.toISOString(),
        durationDays: duration,
        endDate: end.toISOString(),
        rentalRate: eq.rentalRate,
        totalAmount,
        status: bookingStatus,
        penalty: 0,
        createdAt: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      localDb.write('bookings', bookings);

      // Local db fallback jobs/invoices/notifications
      const jobs = localDb.read('jobs') || [];
      jobs.push({
        _id: 'JOB-' + Date.now(),
        booking: newBooking._id,
        farmer: req.user.id,
        equipment: equipmentId,
        unitNum: selectedUnitNum,
        operator: operatorId || null,
        status: 'Assigned',
        createdAt: new Date().toISOString()
      });
      localDb.write('jobs', jobs);

      const invoices = localDb.read('invoices') || [];
      invoices.push({
        _id: 'INV-' + Date.now(),
        invoiceNumber: invoiceNum,
        booking: newBooking._id,
        amount: totalAmount,
        tax,
        penalty: 0,
        totalAmount: invoiceTotal,
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString()
      });
      localDb.write('invoices', invoices);

      const notifications = localDb.read('notifications') || [];
      if (operatorId) {
        notifications.push({
          _id: 'NT-' + Date.now(),
          user: operatorId,
          title: 'New Job Assigned',
          message: `You have been assigned to work order for ${eq.name}.`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
      notifications.push({
        _id: 'NT-F-' + Date.now(),
        user: req.user.id,
        title: 'Booking Approved',
        message: `Your booking request for ${eq.name} has been automatically approved.`,
        read: false,
        createdAt: new Date().toISOString()
      });
      localDb.write('notifications', notifications);
    }

    await logAudit(req, req.user, 'Booking Approved', '', JSON.stringify({ equipmentId, totalAmount }), `Automatically approved booking request for ${eq.name}`);

    return res.status(201).json({ success: true, message: 'Booking request created and approved automatically.', data: newBooking });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/rentals/:id/approve (Manager only)
router.post('/:id/approve', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let booking;
    let eq;

    if (isDbConnected()) {
      booking = await Booking.findById(id).populate('equipment');
      if (booking) {
        eq = await Equipment.findById(booking.equipment._id);
      }
    } else {
      const bookings = localDb.read('bookings');
      booking = bookings.find(b => b._id === id || b.id === id);
      if (booking) {
        const equipments = localDb.read('equipment');
        eq = equipments.find(e => e._id === booking.equipment || e.id === booking.equipment);
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Booking status is already ${booking.status}` });
    }

    if (!eq.assignedOperator) {
      return res.status(400).json({ success: false, message: 'Cannot approve booking: No operator is permanently assigned to this equipment.' });
    }

    // Update status
    booking.status = 'Approved';
    eq.status = 'Reserved';

    let job;
    const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const tax = Math.round(booking.totalAmount * 0.18); // 18% GST
    const invoiceTotal = booking.totalAmount + tax;

    if (isDbConnected()) {
      await booking.save();
      await eq.save();

      // Create Job automatically
      job = await Job.create({
        booking: booking._id,
        farmer: booking.farmer,
        equipment: eq._id,
        operator: eq.assignedOperator,
        status: 'Assigned'
      });

      // Create Invoice automatically
      await Invoice.create({
        invoiceNumber: invoiceNum,
        booking: booking._id,
        amount: booking.totalAmount,
        tax,
        penalty: 0,
        totalAmount: invoiceTotal,
        paymentStatus: 'Paid'
      });

      // Send Notification to Operator
      await Notification.create({
        user: eq.assignedOperator,
        title: 'New Job Assigned',
        message: `You have been assigned to work order for ${eq.name}.`
      });

      // Send Notification to Farmer
      await Notification.create({
        user: booking.farmer,
        title: 'Booking Approved',
        message: `Your booking request for ${eq.name} has been approved.`
      });

    } else {
      const bookings = localDb.read('bookings');
      const idx = bookings.findIndex(b => b._id === id || b.id === id);
      bookings[idx].status = 'Approved';
      localDb.write('bookings', bookings);

      const equipments = localDb.read('equipment');
      const eqIdx = equipments.findIndex(e => e._id === eq._id || e.id === eq.id);
      equipments[eqIdx].status = 'Reserved';
      localDb.write('equipment', equipments);

      // Create Job
      const jobs = localDb.read('jobs');
      job = {
        _id: 'JOB-' + Date.now(),
        booking: booking.id,
        farmer: booking.farmer,
        equipment: eq.id,
        operator: eq.assignedOperator,
        status: 'Assigned',
        createdAt: new Date().toISOString()
      };
      jobs.push(job);
      localDb.write('jobs', jobs);

      // Create Invoice
      const invoices = localDb.read('invoices');
      invoices.push({
        _id: 'INV-DOC-' + Date.now(),
        invoiceNumber: invoiceNum,
        booking: booking.id,
        amount: booking.totalAmount,
        tax,
        penalty: 0,
        totalAmount: invoiceTotal,
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString()
      });
      localDb.write('invoices', invoices);

      // Create Notifications
      const notifications = localDb.read('notifications');
      notifications.push({
        _id: 'NTF-' + Date.now() + '-1',
        user: eq.assignedOperator,
        title: 'New Job Assigned',
        message: `You have been assigned to work order for ${eq.name}.`,
        read: false,
        timestamp: new Date().toISOString()
      });
      notifications.push({
        _id: 'NTF-' + Date.now() + '-2',
        user: booking.farmer,
        title: 'Booking Approved',
        message: `Your booking request for ${eq.name} has been approved.`,
        read: false,
        timestamp: new Date().toISOString()
      });
      localDb.write('notifications', notifications);
    }

    await logAudit(req, req.user, 'Booking Approval', 'Pending', 'Approved', `Approved booking ${booking._id || booking.id}`);

    return res.json({ success: true, message: 'Booking approved, job created and operator assigned.', job });
  } catch (err) {
    console.error('Approve booking error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/rentals/:id/reject (Manager only)
router.post('/:id/reject', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let booking;

    if (isDbConnected()) {
      booking = await Booking.findById(id);
      if (booking) {
        booking.status = 'Cancelled';
        await booking.save();
      }
    } else {
      const bookings = localDb.read('bookings');
      booking = bookings.find(b => b._id === id || b.id === id);
      if (booking) {
        booking.status = 'Cancelled';
        localDb.write('bookings', bookings);
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    await logAudit(req, req.user, 'Booking Rejection', 'Pending', 'Cancelled', `Rejected booking ${booking._id || booking.id}`);

    return res.json({ success: true, message: 'Booking request rejected/cancelled.' });
  } catch (err) {
    console.error('Reject booking error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
