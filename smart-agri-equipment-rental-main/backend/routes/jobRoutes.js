// backend/routes/jobRoutes.js
import express from 'express';
import { Job, Booking, Equipment, User, Maintenance, Notification, logAudit, isDbConnected, localDb } from '../db.js';
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
      if (job.unitNum) {
        const unit = eq.units.find(u => u.unitNum === job.unitNum);
        if (unit) unit.status = 'In Use';
      }
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
    const { fuelUsed, startTime, endTime, remarks, workCompleted, fieldLocation, equipmentCondition, damageInfo, photos } = req.body;
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

    let booking;
    if (isDbConnected()) {
      booking = await Booking.findById(job.booking);
    } else {
      const bookings = localDb.read('bookings') || [];
      booking = bookings.find(b => b._id?.toString() === job.booking?.toString() || b.id?.toString() === job.booking?.toString());
    }

    const durationDays = booking ? booking.durationDays : 1;
    const hours = durationDays * 9;

    const resolvedStartTime = job.startTime || (booking ? new Date(booking.startDate) : new Date());
    const resolvedEndTime = new Date(new Date(resolvedStartTime).getTime() + durationDays * 24 * 60 * 60 * 1000);

    const fuel = parseFloat(fuelUsed) || 0;

    // Update job details
    job.status = 'Completed';
    job.endTime = resolvedEndTime;
    job.startTime = resolvedStartTime;
    job.fuelUsed = fuel;
    job.workingHours = hours;
    job.remarks = remarks || '';
    job.workCompleted = workCompleted || '';
    job.fieldLocation = fieldLocation || '';
    job.equipmentCondition = equipmentCondition || 'Good';
    job.damageInfo = damageInfo || '';
    if (photos && photos.length > 0) {
      job.photos = photos;
    }

    let bookingId = job.booking;
    let oldEquipmentStatus = eq ? eq.status : 'In Use';
    let newEquipmentStatus = 'Available';

    // Update equipment usage hours
    if (eq) {
      eq.currentCycleHours = Math.round((eq.currentCycleHours + hours) * 10) / 10;
      eq.totalUsageHours = Math.round((eq.totalUsageHours + hours) * 10) / 10;
      
      // Update sub-unit work hours
      if (job.unitNum) {
        const unit = eq.units.find(u => u.unitNum === job.unitNum);
        if (unit) {
          unit.hours = Math.round((unit.hours + hours) * 10) / 10;
        }
      }

      // Check 360-hour threshold
      if (eq.currentCycleHours >= 360) {
        newEquipmentStatus = 'Maintenance Required';
        eq.status = 'Maintenance Required';
        if (job.unitNum) {
          const unit = eq.units.find(u => u.unitNum === job.unitNum);
          if (unit) unit.status = 'Under Maintenance';
        }
      } else {
        eq.status = 'Available';
        if (job.unitNum) {
          const unit = eq.units.find(u => u.unitNum === job.unitNum);
          if (unit) unit.status = 'Available';
        }
      }
    }

    if (isDbConnected()) {
      await job.save();
      if (eq) {
        await eq.save();
        
        // If maintenance is required, create a Maintenance record and notify
        if (newEquipmentStatus === 'Maintenance Required') {
          await Maintenance.create({
            equipment: eq._id,
            description: 'Automated 360-hour preventative maintenance trigger',
            cost: 0,
            status: 'Pending',
            previousUsageHours: eq.totalUsageHours,
            maintenanceReason: '360 Hour Threshold Reached'
          });

          // Notify Specialists
          const specialists = await User.find({ role: 'Equipmaintance' });
          for (const sp of specialists) {
            await Notification.create({
              user: sp._id,
              title: 'Preventative Maintenance Required',
              message: `Equipment ${eq.name} (${eq.regNumber}) has reached ${eq.currentCycleHours}/360 hours. Maintenance task has been auto-generated.`
            });
          }
        }
      }

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
      jobs[jIdx] = {
        ...jobs[jIdx],
        status: 'Completed',
        endTime: resolvedEndTime.toISOString(),
        startTime: resolvedStartTime.toISOString(),
        fuelUsed: fuel,
        workingHours: hours,
        remarks: remarks || '',
        workCompleted: workCompleted || '',
        fieldLocation: fieldLocation || '',
        equipmentCondition: equipmentCondition || 'Good',
        damageInfo: damageInfo || '',
        photos: photos || []
      };
      localDb.write('jobs', jobs);

      if (eq) {
        const equipmentList = localDb.read('equipment');
        const eqIdx = equipmentList.findIndex(e => e._id === eq._id || e.id === eq.id);
        if (eqIdx !== -1) {
          equipmentList[eqIdx] = eq;
          localDb.write('equipment', equipmentList);
        }

        if (newEquipmentStatus === 'Maintenance Required') {
          const maintenanceList = localDb.read('maintenance') || [];
          maintenanceList.push({
            _id: 'MNT-' + Date.now(),
            equipment: eq._id || eq.id,
            serviceDate: new Date().toISOString(),
            description: 'Automated 360-hour preventative maintenance trigger',
            cost: 0,
            status: 'Pending',
            previousUsageHours: eq.totalUsageHours,
            maintenanceReason: '360 Hour Threshold Reached',
            createdAt: new Date().toISOString()
          });
          localDb.write('maintenance', maintenanceList);

          const users = localDb.read('users');
          const specialists = users.filter(u => u.role === 'Equipmaintance');
          const notifications = localDb.read('notifications') || [];
          for (const sp of specialists) {
            notifications.push({
              _id: 'NTF-M-' + Date.now() + Math.random().toString(36).substr(2, 4),
              user: sp._id || sp.id,
              title: 'Preventative Maintenance Required',
              message: `Equipment ${eq.name} (${eq.regNumber}) has reached ${eq.currentCycleHours}/360 hours. Maintenance task has been auto-generated.`,
              read: false,
              timestamp: new Date().toISOString()
            });
          }
          localDb.write('notifications', notifications);
        }
      }

      const bookings = localDb.read('bookings');
      const bIdx = bookings.findIndex(b => b._id === bookingId || b.id === bookingId);
      if (bIdx !== -1) {
        bookings[bIdx].status = 'Returned';
        localDb.write('bookings', bookings);
      }

      // Notify Farmer
      const notifications = localDb.read('notifications') || [];
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

    // Audit logs
    await logAudit(req, req.user, 'Operator submitted work completion report', 'Started', 'Completed', `Operator completed job ID ${id}. Working hours: ${hours}`);
    if (newEquipmentStatus === 'Maintenance Required') {
      await logAudit(req, null, 'Equipment reached 360 usage hours', String(hours), String(eq.currentCycleHours), `Equipment ${eq.name} reached 360 hours threshold.`);
      await logAudit(req, null, 'Equipment automatically marked Maintenance Required', oldEquipmentStatus, 'Maintenance Required', `Equipment ${eq.name} status updated automatically.`);
      await logAudit(req, null, 'Maintenance task created', '', 'Pending', `Automated maintenance task created for ${eq.name}`);
    }

    return res.json({ success: true, message: 'Job completed successfully.', data: job });
  } catch (err) {
    console.error('Complete job error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
