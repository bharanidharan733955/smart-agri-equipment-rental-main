// backend/routes/jobRoutes.js
import express from 'express';
import { Job, Booking, Equipment, User, Maintenance, Notification, Invoice, AssignmentHistory, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/jobs (Fetch jobs for logged in Operator or manager)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      if (req.user.role === 'Equipment Operator') {
        list = await Job.find({ operator: req.user.id })
          .sort({ createdAt: -1 })
          .populate('equipment')
          .populate('farmer', 'name email mobile');
      } else {
        list = await Job.find()
          .sort({ createdAt: -1 })
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
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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

    const durationDays = (booking && booking.durationDays) ? parseInt(booking.durationDays) : 1;
    const hours = (durationDays || 1) * 9;

    const resolvedStartTime = job.startTime || (booking ? new Date(booking.startDate) : new Date());
    const resolvedEndTime = new Date(new Date(resolvedStartTime).getTime() + (durationDays || 1) * 24 * 60 * 60 * 1000);

    const fuel = parseFloat(fuelUsed) || 0;
    const selectedFuelType = req.body.fuelType || booking?.tentativeBill?.fuelType || 'Diesel';
    const fuelPricePerLiter = selectedFuelType === 'Petrol' ? 102 : 95;

    // Billing calculations
    const baseAmount = booking?.tentativeBill?.baseAmount || ((eq?.rentalRate || booking?.rentalRate || 1800) * (durationDays || 1));
    const estimatedFuelCost = booking?.tentativeBill?.estimatedFuelCost || Math.round((durationDays || 1) * 6 * fuelPricePerLiter);
    const estimatedFuelLiters = booking?.tentativeBill?.estimatedFuelLiters || ((durationDays || 1) * 6);
    
    const actualFuelLiters = fuel;
    const actualFuelCost = Math.round(actualFuelLiters * fuelPricePerLiter);
    const fuelAdjustment = actualFuelCost - estimatedFuelCost; // Difference (+/-)
    
    const finalSubtotal = baseAmount + actualFuelCost;
    const finalTax = Math.round(finalSubtotal * 0.18);
    const finalTotal = finalSubtotal + finalTax + (booking?.penalty || 0);

    const finalBill = {
      baseAmount,
      estimatedFuelLiters,
      estimatedFuelCost,
      actualFuelLiters,
      fuelType: selectedFuelType,
      fuelPricePerLiter,
      actualFuelCost,
      fuelAdjustment,
      tax: finalTax,
      totalAmount: finalTotal,
      isFinalBilled: true,
      billedAt: new Date().toISOString()
    };

    // Update job details
    job.status = 'Completed';
    job.endTime = resolvedEndTime;
    job.startTime = resolvedStartTime;
    job.fuelUsed = fuel;
    job.fuelType = selectedFuelType;
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
      const curCycle = typeof eq.currentCycleHours === 'number' && !isNaN(eq.currentCycleHours) ? eq.currentCycleHours : 0;
      const totalHours = typeof eq.totalUsageHours === 'number' && !isNaN(eq.totalUsageHours) ? eq.totalUsageHours : 0;
      
      eq.currentCycleHours = Math.round((curCycle + hours) * 10) / 10;
      eq.totalUsageHours = Math.round((totalHours + hours) * 10) / 10;
      
      // Update sub-unit work hours
      if (job.unitNum && Array.isArray(eq.units)) {
        const unit = eq.units.find(u => u.unitNum === job.unitNum);
        if (unit) {
          const uHours = typeof unit.hours === 'number' && !isNaN(unit.hours) ? unit.hours : 0;
          unit.hours = Math.round((uHours + hours) * 10) / 10;
        }
      }

      eq.status = 'Available';
      if (job.unitNum && Array.isArray(eq.units)) {
        const unit = eq.units.find(u => u.unitNum === job.unitNum);
        if (unit) unit.status = 'Available';
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

      const completionDate = new Date();
      const dueDate = new Date(completionDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week (7 days) grace period to pay

      // Update booking status, final bill, and payment due window
      if (booking) {
        booking.status = 'Returned';
        booking.finalBill = finalBill;
        booking.isFinalBilled = true;
        booking.totalAmount = finalTotal;
        booking.dueDate = dueDate;
        booking.paymentStatus = 'Unpaid';
        await booking.save();
      }

      // Update Invoice for final bill and due date
      const inv = await Invoice.findOne({ booking: bookingId });
      if (inv) {
        inv.billingStatus = 'Final Billed';
        inv.isTentative = false;
        inv.actualFuelLiters = actualFuelLiters;
        inv.fuelType = selectedFuelType;
        inv.fuelPricePerLiter = fuelPricePerLiter;
        inv.actualFuelCost = actualFuelCost;
        inv.fuelAdjustment = fuelAdjustment;
        inv.tax = finalTax;
        inv.totalAmount = finalTotal;
        inv.finalAmount = finalTotal;
        inv.dueDate = dueDate;
        inv.paymentStatus = 'Unpaid';
        await inv.save();
      }

      // Notify Farmer
      await Notification.create({
        user: job.farmer,
        title: 'Work Completed & Final Bill Generated',
        message: `Your equipment rental order has been completed. Final Bill: ₹${finalTotal}. Please pay at your Cooperative Hub within 7 days (by ${dueDate.toLocaleDateString()}).`
      });
    } else {
      const completionDate = new Date();
      const dueDate = new Date(completionDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const jobs = localDb.read('jobs');
      const jIdx = jobs.findIndex(j => j._id === id || j.id === id);
      jobs[jIdx] = {
        ...jobs[jIdx],
        status: 'Completed',
        endTime: resolvedEndTime.toISOString(),
        startTime: resolvedStartTime.toISOString(),
        fuelUsed: fuel,
        fuelType: selectedFuelType,
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
      const bIdx = bookings.findIndex(b => b._id === bookingId || b.id === bookingId || b._id?.toString() === bookingId?.toString());
      if (bIdx !== -1) {
        bookings[bIdx].status = 'Returned';
        bookings[bIdx].finalBill = finalBill;
        bookings[bIdx].isFinalBilled = true;
        bookings[bIdx].totalAmount = finalTotal;
        bookings[bIdx].dueDate = dueDate.toISOString();
        bookings[bIdx].paymentStatus = 'Unpaid';
        localDb.write('bookings', bookings);
      }

      const invoices = localDb.read('invoices');
      const invIdx = invoices.findIndex(i => i.booking === bookingId || i.booking?.toString() === bookingId?.toString());
      if (invIdx !== -1) {
        invoices[invIdx].billingStatus = 'Final Billed';
        invoices[invIdx].isTentative = false;
        invoices[invIdx].actualFuelLiters = actualFuelLiters;
        invoices[invIdx].fuelType = selectedFuelType;
        invoices[invIdx].fuelPricePerLiter = fuelPricePerLiter;
        invoices[invIdx].actualFuelCost = actualFuelCost;
        invoices[invIdx].fuelAdjustment = fuelAdjustment;
        invoices[invIdx].tax = finalTax;
        invoices[invIdx].totalAmount = finalTotal;
        invoices[invIdx].finalAmount = finalTotal;
        invoices[invIdx].dueDate = dueDate.toISOString();
        invoices[invIdx].paymentStatus = 'Unpaid';
        localDb.write('invoices', invoices);
      }

      // Notify Farmer
      const notifications = localDb.read('notifications') || [];
      notifications.push({
        _id: 'NTF-' + Date.now(),
        user: job.farmer,
        title: 'Work Completed & Final Bill Generated',
        message: `Your equipment rental order has been completed. Final Bill: ₹${finalTotal} (Fuel adjustment: ${fuelAdjustment >= 0 ? '+' : ''}₹${fuelAdjustment}). Report details are available.`,
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

// GET /api/jobs/cancellation-requests (Staff views cancellation requests)
router.get('/cancellation-requests', authenticateToken, authorizeRoles('Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    let requests = [];
    if (isDbConnected()) {
      requests = await Job.find({
        $or: [
          { status: 'CANCELLATION_REQUESTED' },
          { cancellationRequested: true }
        ],
        cancellationDecision: { $nin: ['Approved', 'Rejected', 'APPROVED', 'REJECTED'] }
      })
      .populate('equipment')
      .populate('farmer', 'name email mobile')
      .populate('operator', 'name email mobile operatorId');
    } else {
      const jobs = localDb.read('jobs') || [];
      const equipment = localDb.read('equipment') || [];
      const users = localDb.read('users') || [];

      requests = jobs.filter(j => 
        (j.status === 'CANCELLATION_REQUESTED' || j.cancellationRequested === true) &&
        !['Approved', 'Rejected', 'APPROVED', 'REJECTED'].includes(j.cancellationDecision)
      )
        .map(j => ({
          ...j,
          equipment: equipment.find(e => e._id === j.equipment || e.id === j.equipment),
          farmer: users.find(u => u._id === j.farmer || u.id === j.farmer) || { name: 'Farmer' },
          operator: users.find(u => u._id === j.operator || u.id === j.operator) || { name: 'Operator' }
        }));
    }
    return res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    console.error('Fetch cancellation requests error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/jobs/operator-stats (Staff views operator performance & cancellation statistics)
router.get('/operator-stats', authenticateToken, authorizeRoles('Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    let operators = [];
    let jobs = [];

    if (isDbConnected()) {
      operators = await User.find({ role: 'Equipment Operator' }).lean();
      jobs = await Job.find().lean();
    } else {
      const users = localDb.read('users') || [];
      operators = users.filter(u => u.role === 'Equipment Operator');
      jobs = localDb.read('jobs') || [];
    }

    const stats = operators.map(op => {
      const opIdStr = (op._id || op.id)?.toString();
      const opJobs = jobs.filter(j => {
        const jOpStr = (j.operator?._id || j.operator)?.toString();
        return jOpStr === opIdStr;
      });

      const totalJobs = opJobs.length;
      const completed = opJobs.filter(j => j.status === 'Completed').length;
      const cancellationRequests = opJobs.filter(j => j.cancellationRequested || j.status === 'CANCELLATION_REQUESTED' || j.cancellationDecision).length;
      const approved = opJobs.filter(j => j.cancellationDecision === 'Approved').length;
      const rejected = opJobs.filter(j => j.cancellationDecision === 'Rejected').length;

      return {
        operatorId: op.operatorId || op.id || 'OP-00' + op._id,
        name: op.name || 'Operator',
        mobile: op.mobile || '',
        status: op.status || 'Active',
        totalJobs,
        completed,
        cancellationRequests,
        approved,
        rejected
      };
    });

    return res.json({ success: true, count: stats.length, data: stats });
  } catch (err) {
    console.error('Fetch operator stats error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/request-cancellation (Operator requests cancellation with reason and explanation)
router.post('/:id/request-cancellation', authenticateToken, authorizeRoles('Operator', 'Equipment Operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, explanation } = req.body;

    if (!reason || !explanation || !explanation.trim()) {
      return res.status(400).json({ success: false, message: 'Cancellation reason and detailed explanation are mandatory.' });
    }

    let job;
    if (isDbConnected()) {
      job = await Job.findById(id);
    } else {
      const jobs = localDb.read('jobs') || [];
      job = jobs.find(j => j._id === id || j.id === id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const jobOpId = (job.operator?._id || job.operator)?.toString();
    if (jobOpId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only request cancellation for your own assigned jobs.' });
    }

    if (job.cancellationRequested) {
      return res.status(400).json({ success: false, message: 'Cancellation request has already been submitted for this job.' });
    }

    job.cancellationRequested = true;
    job.cancellationReason = reason;
    job.cancellationNote = explanation;
    job.cancellationRequestedAt = new Date();
    job.status = 'CANCELLATION_REQUESTED';

    if (isDbConnected()) {
      await job.save();

      // Notify Staff
      const staffUsers = await User.find({ role: { $in: ['Cooperative Staff', 'Admin', 'Manager'] } });
      for (const st of staffUsers) {
        await Notification.create({
          user: st._id,
          title: '⚠️ Operator Cancellation Request',
          message: `Operator requested cancellation for Job #${job.jobId || job._id}. Reason: ${reason}`
        });
      }
    } else {
      const jobs = localDb.read('jobs') || [];
      const idx = jobs.findIndex(j => j._id === id || j.id === id);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          cancellationRequested: true,
          cancellationReason: reason,
          cancellationNote: explanation,
          cancellationRequestedAt: new Date().toISOString(),
          status: 'CANCELLATION_REQUESTED'
        };
        localDb.write('jobs', jobs);
      }
    }

    await logAudit(req, req.user, 'Operator Requested Cancellation', job.status, 'CANCELLATION_REQUESTED', `Reason: ${reason} - ${explanation}`);

    return res.json({ success: true, message: 'Cancellation request submitted. Awaiting Cooperative Staff review.', data: job });
  } catch (err) {
    console.error('Request cancellation error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/approve-cancellation (Staff approves cancellation)
router.post('/:id/approve-cancellation', authenticateToken, authorizeRoles('Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    const { id } = req.params;
    let job;

    if (isDbConnected()) {
      job = await Job.findById(id);
    } else {
      const jobs = localDb.read('jobs') || [];
      job = jobs.find(j => j._id === id || j.id === id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    job.cancellationDecision = 'Approved';
    job.cancellationDecisionBy = req.user.id;
    job.cancellationDecisionAt = new Date();
    job.cancellationRequested = false;
    job.status = 'MANUAL_REASSIGNMENT_REQUIRED';
    const oldOperatorId = job.operator;
    job.operator = null;

    if (isDbConnected()) {
      await job.save();

      // Log assignment history
      await AssignmentHistory.create({
        jobId: job._id,
        operatorId: oldOperatorId,
        assignmentType: 'AUTOMATIC_ROTATION',
        assignedBy: 'SYSTEM',
        unassignedAt: new Date(),
        reason: `Cancellation approved by Staff: ${job.cancellationReason}`
      });

      // Notify original operator
      if (oldOperatorId) {
        await Notification.create({
          user: oldOperatorId,
          title: 'Cancellation Approved',
          message: `Your cancellation request for Job #${job.jobId || job._id} has been approved by Cooperative Staff.`
        });
      }
    } else {
      const jobs = localDb.read('jobs') || [];
      const idx = jobs.findIndex(j => j._id === id || j.id === id);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          cancellationDecision: 'Approved',
          cancellationDecisionBy: req.user.id,
          cancellationDecisionAt: new Date().toISOString(),
          cancellationRequested: false,
          status: 'MANUAL_REASSIGNMENT_REQUIRED',
          operator: null
        };
        localDb.write('jobs', jobs);
      }
    }

    await logAudit(req, req.user, 'Approved Operator Cancellation', 'CANCELLATION_REQUESTED', 'MANUAL_REASSIGNMENT_REQUIRED', `Job #${id} cancellation approved. Manual reassignment required.`);

    return res.json({ success: true, message: 'Cancellation approved. Job requires manual operator reassignment by Cooperative Staff.', data: job });
  } catch (err) {
    console.error('Approve cancellation error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/reject-cancellation (Staff rejects cancellation)
router.post('/:id/reject-cancellation', authenticateToken, authorizeRoles('Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Staff rejection reason is required.' });
    }

    let job;
    if (isDbConnected()) {
      job = await Job.findById(id);
    } else {
      const jobs = localDb.read('jobs') || [];
      job = jobs.find(j => j._id === id || j.id === id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    job.cancellationDecision = 'Rejected';
    job.cancellationDecisionBy = req.user.id;
    job.cancellationDecisionAt = new Date();
    job.cancellationDecisionReason = reason;
    job.cancellationRequested = false;
    job.status = 'Assigned'; // Job remains assigned to original operator

    if (isDbConnected()) {
      await job.save();

      if (job.operator) {
        await Notification.create({
          user: job.operator,
          title: 'Cancellation Request Rejected',
          message: `Your cancellation request for Job #${job.jobId || job._id} was rejected by Cooperative Staff. Reason: ${reason}. Job remains assigned.`
        });
      }
    } else {
      const jobs = localDb.read('jobs') || [];
      const idx = jobs.findIndex(j => j._id === id || j.id === id);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          cancellationDecision: 'Rejected',
          cancellationDecisionBy: req.user.id,
          cancellationDecisionAt: new Date().toISOString(),
          cancellationDecisionReason: reason,
          cancellationRequested: false,
          status: 'Assigned'
        };
        localDb.write('jobs', jobs);
      }
    }

    await logAudit(req, req.user, 'Rejected Operator Cancellation', 'CANCELLATION_REQUESTED', 'Assigned', `Staff rejected cancellation for Job #${id}. Reason: ${reason}`);

    return res.json({ success: true, message: 'Cancellation request rejected. Job remains assigned to original operator.', data: job });
  } catch (err) {
    console.error('Reject cancellation error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/reassign (Staff manually reassigns job to replacement operator)
router.post('/:id/reassign', authenticateToken, authorizeRoles('Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId } = req.body;

    if (!operatorId) {
      return res.status(400).json({ success: false, message: 'Please select a replacement operator.' });
    }

    let job;
    let newOpUser;

    if (isDbConnected()) {
      job = await Job.findById(id);
      newOpUser = await User.findById(operatorId);
    } else {
      const jobs = localDb.read('jobs') || [];
      job = jobs.find(j => j._id === id || j.id === id);
      const users = localDb.read('users') || [];
      newOpUser = users.find(u => u._id === operatorId || u.id === operatorId);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    if (!newOpUser) {
      return res.status(404).json({ success: false, message: 'Selected operator not found.' });
    }

    const previousOperator = job.operator;
    job.operator = operatorId;
    job.status = 'Assigned';
    job.assignmentType = 'MANUAL_REASSIGNMENT';
    job.cancellationRequested = false;
    job.cancellationDecision = 'Approved';

    if (isDbConnected()) {
      await job.save();

      // Record Assignment History
      await AssignmentHistory.create({
        jobId: job._id,
        operatorId,
        assignmentType: 'MANUAL_REASSIGNMENT',
        assignedBy: req.user.name || req.user.id,
        assignedAt: new Date(),
        reason: 'Manual Staff Reassignment'
      });

      // Notify replacement operator
      await Notification.create({
        user: operatorId,
        title: 'New Job Assigned (Manual Reassignment)',
        message: `You have been manually assigned to Job #${job.jobId || job._id} by Cooperative Staff.`
      });
    } else {
      const jobs = localDb.read('jobs') || [];
      const idx = jobs.findIndex(j => j._id === id || j.id === id);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          operator: operatorId,
          status: 'Assigned',
          assignmentType: 'MANUAL_REASSIGNMENT',
          cancellationRequested: false,
          cancellationDecision: 'Approved'
        };
        localDb.write('jobs', jobs);
      }
    }

    await logAudit(req, req.user, 'Manual Operator Reassignment', String(previousOperator), String(operatorId), `Staff manually reassigned Job #${id} to ${newOpUser.name}`);

    return res.json({ success: true, message: `Job successfully reassigned to operator ${newOpUser.name}.`, data: job });
  } catch (err) {
    console.error('Reassign job error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/jobs/:id/report-issue (Operator reports equipment issue during work)
router.post('/:id/report-issue', authenticateToken, authorizeRoles('Operator', 'Equipment Operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { issueType, description, photo } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({ success: false, message: 'Issue type and description are required.' });
    }

    let job;
    if (isDbConnected()) {
      job = await Job.findById(id);
    } else {
      const jobs = localDb.read('jobs') || [];
      job = jobs.find(j => j._id === id || j.id === id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    job.status = 'EQUIPMENT_FAILURE';
    job.issueReported = {
      issueType,
      description,
      photo: photo || '',
      reportedAt: new Date()
    };

    if (isDbConnected()) {
      await job.save();

      // Notify Staff
      const staffUsers = await User.find({ role: { $in: ['Cooperative Staff', 'Admin', 'Manager'] } });
      for (const st of staffUsers) {
        await Notification.create({
          user: st._id,
          title: '🚨 Equipment Failure Reported',
          message: `Operator reported equipment issue on Job #${job.jobId || job._id}: ${issueType}`
        });
      }
    } else {
      const jobs = localDb.read('jobs') || [];
      const idx = jobs.findIndex(j => j._id === id || j.id === id);
      if (idx !== -1) {
        jobs[idx] = {
          ...jobs[idx],
          status: 'EQUIPMENT_FAILURE',
          issueReported: {
            issueType,
            description,
            photo: photo || '',
            reportedAt: new Date().toISOString()
          }
        };
        localDb.write('jobs', jobs);
      }
    }

    await logAudit(req, req.user, 'Operator Reported Equipment Issue', 'IN_PROGRESS', 'EQUIPMENT_FAILURE', `Issue: ${issueType} - ${description}`);

    return res.json({ success: true, message: 'Equipment issue reported to Cooperative Staff.', data: job });
  } catch (err) {
    console.error('Report issue error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;

