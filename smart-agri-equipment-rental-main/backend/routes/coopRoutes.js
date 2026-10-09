// backend/routes/coopRoutes.js
import express from 'express';
import { User, Equipment, Booking, Invoice, Maintenance, Job, Feedback, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/cooperative/operators-with-equipment (Retrieve operators with their assigned vehicles)
router.get('/operators-with-equipment', authenticateToken, authorizeRoles('Manager', 'Admin', 'Operator', 'Equipment Operator'), async (req, res) => {
  try {
    let operators = [];
    let equipmentList = [];
    let activeJobs = [];

    const isOperator = req.user && (req.user.role === 'Operator' || req.user.role === 'Equipment Operator');

    if (isDbConnected()) {
      let query = { role: { $in: ['Equipment Operator', 'Operator'] } };

      if (isOperator) {
        let opUser = await User.findById(req.user.id);
        if (!opUser) opUser = req.user;
        let targetTaluk = opUser.taluk || req.user.taluk || '';
        if (!targetTaluk && opUser.cooperativeHub) {
          targetTaluk = opUser.cooperativeHub.replace(/ hub$/i, '').trim();
        }
        const targetDistrict = opUser.district || req.user.district || '';

        if (targetTaluk) {
          const talukRegex = new RegExp(targetTaluk.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
          query.$or = [
            { taluk: talukRegex },
            { cooperativeHub: talukRegex }
          ];
        } else if (targetDistrict) {
          query.district = new RegExp(`^${targetDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
        } else {
          // Default fallback to Pollachi taluk for operator team view
          query.$or = [
            { taluk: /Pollachi/i },
            { cooperativeHub: /Pollachi/i }
          ];
        }
      }

      operators = await User.find(query).select('-password');
      equipmentList = await Equipment.find();
      activeJobs = await Job.find({ status: { $in: ['Assigned', 'Started', 'ASSIGNED', 'IN_PROGRESS'] } });
    } else {
      let allOps = (localDb.read('users') || []).filter(u => u.role === 'Equipment Operator' || u.role === 'Operator');

      if (isOperator) {
        const users = localDb.read('users') || [];
        const opUser = users.find(u => String(u._id || u.id) === String(req.user.id)) || req.user;
        let targetTaluk = opUser.taluk || req.user.taluk || '';
        if (!targetTaluk && opUser.cooperativeHub) {
          targetTaluk = opUser.cooperativeHub.replace(/ hub$/i, '').trim();
        }
        const targetDistrict = opUser.district || req.user.district || '';

        if (targetTaluk) {
          const tNorm = targetTaluk.toLowerCase();
          operators = allOps.filter(u =>
            (u.taluk && u.taluk.toLowerCase() === tNorm) ||
            (u.cooperativeHub && u.cooperativeHub.toLowerCase().includes(tNorm))
          );
        } else if (targetDistrict) {
          const dNorm = targetDistrict.toLowerCase();
          operators = allOps.filter(u => u.district && u.district.toLowerCase() === dNorm);
        } else {
          operators = allOps.filter(u =>
            (u.taluk && u.taluk.toLowerCase() === 'pollachi') ||
            (u.cooperativeHub && u.cooperativeHub.toLowerCase().includes('pollachi'))
          );
        }
      } else {
        operators = allOps;
      }

      equipmentList = localDb.read('equipment') || [];
      activeJobs = (localDb.read('jobs') || []).filter(j => ['Assigned', 'Started', 'ASSIGNED', 'IN_PROGRESS'].includes(j.status));
    }

    // Map each operator with equipment they are currently actively working on (via active jobs)
    const result = operators.map(op => {
      const opId = op._id?.toString() || op.id;
      
      // Find all active jobs for this operator
      const opJobs = activeJobs.filter(j => {
        const jOpId = j.operator?._id?.toString() || j.operator?.toString();
        return jOpId === opId;
      });

      // Extract unique equipment assigned to these jobs
      const eqIds = [...new Set(opJobs.map(j => j.equipment?.toString() || j.equipment))];
      
      const assigned = equipmentList.filter(eq => {
        const eqId = eq._id?.toString() || eq.id;
        return eqIds.includes(eqId);
      });

      return {
        _id: opId,
        name: op.name,
        email: op.email,
        mobile: op.mobile,
        district: op.district,
        taluk: op.taluk || (op.cooperativeHub ? op.cooperativeHub.replace(/ hub$/i, '').trim() : ''),
        cooperativeHub: op.cooperativeHub,
        isApproved: op.isApproved,
        assignedVehicles: assigned.map(eq => ({
          _id: eq._id || eq.id,
          name: eq.name,
          regNumber: eq.regNumber,
          category: eq.category,
          brand: eq.brand,
          model: eq.model,
          status: eq.status,
          rentalRate: eq.rentalRate,
          totalUsageHours: eq.totalUsageHours || 0,
          imageUrl: eq.imageUrl
        }))
      };
    });

    return res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error('Fetch operators with equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/cooperative/operators (Retrieve list of operators for assigning to equipment)
router.get('/operators', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Cooperative Staff', 'Officer'), async (req, res) => {
  try {
    let list = [];
    const isStaff = req.user && (req.user.role === 'Staff' || req.user.role === 'Cooperative Staff');
    let staffDistrict = req.user?.district || req.query.district || '';

    if (isStaff && !staffDistrict) {
      if (isDbConnected()) {
        const dbUser = await User.findById(req.user.id || req.user._id);
        if (dbUser) staffDistrict = dbUser.district || '';
      } else {
        const users = localDb.read('users') || [];
        const dbUser = users.find(u => String(u._id || u.id) === String(req.user.id));
        if (dbUser) staffDistrict = dbUser.district || '';
      }
    }

    if (isDbConnected()) {
      let query = { role: { $in: ['Equipment Operator', 'Operator'] } };
      if (staffDistrict && staffDistrict !== 'ALL') {
        query.district = new RegExp(`^${staffDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      }
      list = await User.find(query).select('name email mobile district taluk cooperativeHub status operatorId');
    } else {
      let allOps = (localDb.read('users') || []).filter(u => u.role === 'Equipment Operator' || u.role === 'Operator');
      if (staffDistrict && staffDistrict !== 'ALL') {
        const dNorm = staffDistrict.toLowerCase();
        list = allOps.filter(u => u.district && u.district.toLowerCase() === dNorm);
      } else {
        list = allOps;
      }
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('Fetch operators error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

import { GOVT_FARMER_REGISTRY, findGovtRecord } from '../data/govtFarmerRegistry.js';

// GET /api/cooperative/farmers (Retrieve list of approved registered farmers filtered by Staff District)
router.get('/farmers', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff'), async (req, res) => {
  try {
    const userDistrict = req.user?.district;
    const isStaff = req.user?.role === 'Staff' || req.user?.role === 'Manager';
    const filterDistrict = req.query.district || (isStaff && userDistrict ? userDistrict : null);

    let list = [];
    if (isDbConnected()) {
      let filter = { role: 'Farmer', isApproved: true };
      if (filterDistrict) {
        filter.district = new RegExp(`^${filterDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      }
      list = await User.find(filter).select('-password');
    } else {
      list = localDb.read('users').filter(u => u.role === 'Farmer' && u.isApproved !== false);
      if (filterDistrict) {
        const dNorm = filterDistrict.toLowerCase();
        list = list.filter(u => u.district && u.district.toLowerCase() === dNorm);
      }
    }
    return res.json({ success: true, count: list.length, staffDistrict: userDistrict, data: list });
  } catch (err) {
    console.error('Fetch farmers error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/cooperative/farmer-verifications (Retrieve farmers filtered by Staff District)
router.get('/farmer-verifications', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { status, district } = req.query;
    const userDistrict = req.user?.district;
    const isStaff = req.user?.role === 'Staff' || req.user?.role === 'Manager';
    const targetDistrict = district || (isStaff && userDistrict ? userDistrict : null);

    let list = [];
    if (isDbConnected()) {
      let filter = { role: 'Farmer' };
      if (targetDistrict) {
        filter.district = new RegExp(`^${targetDistrict.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      }
      list = await User.find(filter).select('-password');
    } else {
      list = localDb.read('users').filter(u => u.role === 'Farmer');
      if (targetDistrict) {
        const dNorm = targetDistrict.toLowerCase();
        list = list.filter(u => u.district && u.district.toLowerCase() === dNorm);
      }
    }

    // Attach government registry match info
    const verifiedFarmers = list.map(f => {
      const farmerObj = JSON.parse(JSON.stringify(f));
      const govtRecord = findGovtRecord(farmerObj.farmerId, farmerObj.mobile);
      
      const isIdMatched = !!govtRecord && (govtRecord.govtFarmerId.toLowerCase() === (farmerObj.farmerId || '').trim().toLowerCase());
      
      const fNameNorm = (farmerObj.name || '').toLowerCase().trim();
      const gNameNorm = (govtRecord?.officialName || '').toLowerCase().trim();
      const isNameMatched = !!govtRecord && (
        fNameNorm === gNameNorm ||
        gNameNorm.includes(fNameNorm) ||
        fNameNorm.includes(gNameNorm)
      );

      const computedStatus = (farmerObj.isRejected || farmerObj.verificationStatus === 'REJECTED') 
        ? 'REJECTED' 
        : (farmerObj.isApproved ? 'APPROVED' : 'PENDING_VERIFICATION');

      return {
        ...farmerObj,
        govtMatch: govtRecord,
        isIdMatched,
        isNameMatched,
        isFullyVerified: isIdMatched && isNameMatched,
        verificationStatus: computedStatus
      };
    });

    let filtered = verifiedFarmers;
    if (status && status !== 'ALL') {
      filtered = verifiedFarmers.filter(f => f.verificationStatus === status);
    }

    return res.json({
      success: true,
      count: filtered.length,
      staffDistrict: userDistrict,
      data: filtered,
      govtRegistry: GOVT_FARMER_REGISTRY
    });
  } catch (err) {
    console.error('Fetch farmer verifications error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/farmers/:id/approve (Approve pending farmer)
router.post('/farmers/:id/approve', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    const { id } = req.params;
    let farmer;

    if (isDbConnected()) {
      farmer = await User.findByIdAndUpdate(id, { isApproved: true, isRejected: false, verificationStatus: 'APPROVED' }, { new: true });
    } else {
      const users = localDb.read('users');
      const idx = users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        users[idx].isApproved = true;
        users[idx].isRejected = false;
        users[idx].verificationStatus = 'APPROVED';
        farmer = users[idx];
        localDb.write('users', users);
      }
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    await logAudit(req, req.user, 'Farmer Approval', 'Pending', 'Approved', `Approved farmer registration for ${farmer.name} (${farmer.farmerId || 'N/A'})`);

    return res.json({ success: true, message: 'Farmer account approved successfully.', data: farmer });
  } catch (err) {
    console.error('Approve farmer error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/farmers/:id/reject (Reject farmer registration)
router.post('/farmers/:id/reject', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Cooperative Staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    let farmer;

    if (isDbConnected()) {
      farmer = await User.findByIdAndUpdate(
        id, 
        { isApproved: false, isRejected: true, verificationStatus: 'REJECTED', rejectionReason: reason || 'Farmer ID match failed against Government Registry.' }, 
        { new: true }
      );
    } else {
      const users = localDb.read('users');
      const idx = users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        users[idx].isApproved = false;
        users[idx].isRejected = true;
        users[idx].verificationStatus = 'REJECTED';
        users[idx].rejectionReason = reason || 'Farmer ID match failed against Government Registry.';
        farmer = users[idx];
        localDb.write('users', users);
      }
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    await logAudit(req, req.user, 'Farmer Rejection', 'Pending', 'Rejected', `Rejected farmer registration for ${farmer.name}. Reason: ${reason || 'ID Mismatch'}`);

    return res.json({ success: true, message: 'Farmer registration rejected.', data: farmer });
  } catch (err) {
    console.error('Reject farmer error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance (Schedule maintenance)
router.post('/equipment/:id/maintenance', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { description, partsChanged, cost, nextServiceDate } = req.body;

    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const equipmentList = localDb.read('equipment');
      eq = equipmentList.find(e => e._id === id || e.id === id);
    }

    if (!eq) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    const oldStatus = eq.status;
    eq.status = 'Under Maintenance';
    if (nextServiceDate) {
      eq.nextMaintenanceDate = new Date(nextServiceDate);
    }
    eq.lastMaintenanceDate = new Date();

    let mRecord;
    if (isDbConnected()) {
      await eq.save();
      mRecord = await Maintenance.create({
        equipment: eq._id,
        description,
        partsChanged,
        cost: parseFloat(cost) || 0,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null
      });
    } else {
      const equipmentList = localDb.read('equipment');
      const idx = equipmentList.findIndex(e => e._id === id || e.id === id);
      equipmentList[idx] = eq;
      localDb.write('equipment', equipmentList);

      const maintenanceList = localDb.read('maintenance') || [];
      mRecord = {
        _id: 'MNT-' + Date.now(),
        equipment: eq._id || eq.id,
        serviceDate: new Date().toISOString(),
        description,
        partsChanged,
        cost: parseFloat(cost) || 0,
        nextServiceDate: nextServiceDate || null,
        createdAt: new Date().toISOString()
      };
      maintenanceList.push(mRecord);
      localDb.write('maintenance', maintenanceList);
    }

    await logAudit(req, req.user, 'Schedule Maintenance', oldStatus, 'Under Maintenance', `Scheduled maintenance for equipment ${eq.name}`);

    return res.json({ success: true, message: 'Maintenance record created and equipment status updated.', data: mRecord });
  } catch (err) {
    console.error('Schedule maintenance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance/complete (Mark maintenance complete)
router.post('/equipment/:id/maintenance/complete', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let eq;

    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const equipmentList = localDb.read('equipment');
      eq = equipmentList.find(e => e._id === id || e.id === id);
    }

    if (!eq) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    const oldStatus = eq.status;
    eq.status = 'Available';
    eq.currentCycleHours = 0;

    if (isDbConnected()) {
      await eq.save();
    } else {
      const equipmentList = localDb.read('equipment');
      const idx = equipmentList.findIndex(e => e._id === id || e.id === id);
      equipmentList[idx] = eq;
      localDb.write('equipment', equipmentList);
    }

    await logAudit(req, req.user, 'Complete Maintenance', oldStatus, 'Available', `Completed maintenance for equipment ${eq.name}`);

    return res.json({ success: true, message: 'Maintenance completed successfully. Equipment is now Available.', data: eq });
  } catch (err) {
    console.error('Complete maintenance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// GET /api/cooperative/maintenance (Fetch all maintenance records)
router.get('/maintenance', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      list = await Maintenance.find().populate('equipment');
    } else {
      list = localDb.read('maintenance') || [];
      const equipment = localDb.read('equipment');
      list = list.map(m => ({
        ...m,
        equipment: equipment.find(e => e._id === m.equipment || e.id === m.equipment)
      }));
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('Fetch maintenance records error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// GET /api/cooperative/invoices (Fetch all invoices with dynamic delay fine evaluation)
router.get('/invoices', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    let invoices = [];
    if (isDbConnected()) {
      invoices = await Invoice.find().populate({
        path: 'booking',
        populate: [
          { path: 'equipment' },
          { path: 'farmer', select: 'name email mobile farmerId' }
        ]
      });
    } else {
      invoices = localDb.read('invoices');
      const bookings = localDb.read('bookings');
      const equipment = localDb.read('equipment');
      const users = localDb.read('users');

      invoices = invoices.map(inv => {
        const bk = bookings.find(b => b._id === inv.booking || b.id === inv.booking);
        return {
          ...inv,
          booking: bk ? {
            ...bk,
            equipment: equipment.find(e => e._id === bk.equipment || e.id === bk.equipment),
            farmer: users.find(u => u._id === bk.farmer) || { name: 'Farmer' }
          } : null
        };
      });
    }

    const now = new Date();

    // Evaluate dynamic late fines for overdue manual payments (>7 days after work completion)
    const evaluatedInvoices = invoices.map(inv => {
      const invObj = JSON.parse(JSON.stringify(inv));
      // Safeguard: Reset legacy auto-marked 'Paid' invoices to 'Unpaid' if staff hasn't manually collected them
      if (invObj.paymentStatus === 'Paid' && !invObj.paidByStaff && !invObj.paidAt) {
        invObj.paymentStatus = 'Unpaid';
      }
      if (invObj.paymentStatus !== 'Paid' && invObj.dueDate) {
        const due = new Date(invObj.dueDate);
        if (now > due) {
          const delayDays = Math.max(1, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
          const lateFine = delayDays * 200; // ₹200/day fine for delayed payment
          invObj.paymentStatus = 'Overdue';
          invObj.lateFine = lateFine;
          invObj.totalAmount = (invObj.finalAmount || invObj.tentativeAmount || invObj.totalAmount) + lateFine;
        }
      }
      return invObj;
    });

    return res.json({ success: true, count: evaluatedInvoices.length, data: evaluatedInvoices });
  } catch (err) {
    console.error('Fetch invoices error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/invoices/:id/pay (Cooperative staff records manual payment collection)
router.post('/invoices/:id/pay', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, staffNotes } = req.body;
    let invoice;
    let bookingId;

    const now = new Date();

    if (isDbConnected()) {
      invoice = await Invoice.findById(id);
      if (invoice) {
        let fine = 0;
        if (invoice.dueDate && now > new Date(invoice.dueDate)) {
          const delayDays = Math.max(1, Math.ceil((now - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)));
          fine = delayDays * 200;
        }

        invoice.paymentStatus = 'Paid';
        invoice.paidAt = now;
        invoice.paidByStaff = req.user.name || 'Cooperative Staff';
        invoice.paymentMethod = paymentMethod || 'Cash';
        if (fine > 0) {
          invoice.lateFine = fine;
          invoice.totalAmount = (invoice.finalAmount || invoice.totalAmount) + fine;
        }
        await invoice.save();

        bookingId = invoice.booking;
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'Paid',
            paidAt: now,
            paidByStaff: req.user.name || 'Cooperative Staff',
            paymentMethod: paymentMethod || 'Cash',
            lateFine: fine,
            totalAmount: invoice.totalAmount
          });
        }
      }
    } else {
      const invoices = localDb.read('invoices');
      const idx = invoices.findIndex(inv => inv._id === id || inv.id === id);
      if (idx !== -1) {
        invoice = invoices[idx];
        let fine = 0;
        if (invoice.dueDate && now > new Date(invoice.dueDate)) {
          const delayDays = Math.max(1, Math.ceil((now - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)));
          fine = delayDays * 200;
        }

        invoices[idx].paymentStatus = 'Paid';
        invoices[idx].paidAt = now.toISOString();
        invoices[idx].paidByStaff = req.user.name || 'Cooperative Staff';
        invoices[idx].paymentMethod = paymentMethod || 'Cash';
        if (fine > 0) {
          invoices[idx].lateFine = fine;
          invoices[idx].totalAmount = (invoices[idx].finalAmount || invoices[idx].totalAmount) + fine;
        }
        invoice = invoices[idx];
        localDb.write('invoices', invoices);

        bookingId = invoice.booking;
        if (bookingId) {
          const bookings = localDb.read('bookings');
          const bIdx = bookings.findIndex(b => b._id === bookingId || b.id === bookingId);
          if (bIdx !== -1) {
            bookings[bIdx].paymentStatus = 'Paid';
            bookings[bIdx].paidAt = now.toISOString();
            bookings[bIdx].paidByStaff = req.user.name || 'Cooperative Staff';
            bookings[bIdx].paymentMethod = paymentMethod || 'Cash';
            bookings[bIdx].lateFine = fine;
            bookings[bIdx].totalAmount = invoice.totalAmount;
            localDb.write('bookings', bookings);
          }
        }
      }
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    await logAudit(
      req,
      req.user,
      'Manual Payment Collected by Staff',
      'Unpaid',
      'Paid',
      `Staff ${req.user.name} recorded ${req.body.paymentMethod || 'Cash'} payment of ₹${invoice.totalAmount} for Invoice ${invoice.invoiceNumber}`
    );

    return res.json({ success: true, message: `Manual payment of ₹${invoice.totalAmount} recorded by ${req.user.name}.`, data: invoice });
  } catch (err) {
    console.error('Invoice pay error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance/start (Starts maintenance work)
router.post('/equipment/:id/maintenance/start', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const list = localDb.read('equipment');
      eq = list.find(e => e._id === id || e.id === id);
    }
    if (!eq) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    const oldStatus = eq.status;
    eq.status = 'Under Maintenance';

    if (isDbConnected()) {
      await eq.save();
      let maintRecord = await Maintenance.findOne({ equipment: id, status: 'Pending' });
      if (!maintRecord) {
        maintRecord = await Maintenance.create({
          equipment: id,
          description: 'Maintenance started manually by specialist',
          status: 'Pending',
          previousUsageHours: eq.totalUsageHours,
          maintenanceReason: 'Manual trigger'
        });
      }
    } else {
      const list = localDb.read('equipment');
      const idx = list.findIndex(e => e._id === id || e.id === id);
      list[idx] = eq;
      localDb.write('equipment', list);

      const maintList = localDb.read('maintenance') || [];
      let maintRecord = maintList.find(m => m.equipment === id && m.status === 'Pending');
      if (!maintRecord) {
        maintRecord = {
          _id: 'MNT-' + Date.now(),
          equipment: id,
          description: 'Maintenance started manually by specialist',
          status: 'Pending',
          previousUsageHours: eq.totalUsageHours,
          maintenanceReason: 'Manual trigger',
          createdAt: new Date().toISOString()
        };
        maintList.push(maintRecord);
        localDb.write('maintenance', maintList);
      }
    }

    await logAudit(req, req.user, 'Maintenance started', oldStatus, 'Under Maintenance', `Started maintenance work for equipment ${eq.name}`);
    return res.json({ success: true, message: 'Equipment maintenance started successfully.' });
  } catch (err) {
    console.error('Start maintenance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance/report (Specialist submits completion details)
router.post('/equipment/:id/maintenance/report', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { problemDescription, workPerformed, partsReplaced, partsCost, labourCost, remarks, photos, specialist } = req.body;
    
    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const list = localDb.read('equipment');
      eq = list.find(e => e._id === id || e.id === id);
    }
    if (!eq) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    const oldStatus = eq.status;
    eq.status = 'Awaiting Maintenance Approval';

    const pCost = parseFloat(partsCost) || 0;
    const lCost = parseFloat(labourCost) || 0;
    const totalCost = pCost + lCost;

    let maintRecord;
    if (isDbConnected()) {
      await eq.save();
      maintRecord = await Maintenance.findOne({ equipment: id, status: 'Pending' });
      if (!maintRecord) {
        maintRecord = new Maintenance({ equipment: id });
      }
      maintRecord.problemDescription = problemDescription;
      maintRecord.workPerformed = workPerformed;
      maintRecord.partsReplaced = partsReplaced;
      maintRecord.partsCost = pCost;
      maintRecord.labourCost = lCost;
      maintRecord.cost = totalCost;
      maintRecord.remarks = remarks || '';
      maintRecord.specialist = specialist || req.user.name || 'Technician';
      maintRecord.status = 'Completed';
      maintRecord.previousUsageHours = eq.totalUsageHours;
      maintRecord.serviceDate = new Date();
      if (photos && photos.length > 0) {
        maintRecord.photos = photos;
      }
      await maintRecord.save();
    } else {
      const list = localDb.read('equipment');
      const idx = list.findIndex(e => e._id === id || e.id === id);
      list[idx] = eq;
      localDb.write('equipment', list);

      const maintList = localDb.read('maintenance') || [];
      let mIdx = maintList.findIndex(m => m.equipment === id && m.status === 'Pending');
      if (mIdx === -1) {
        maintRecord = { _id: 'MNT-' + Date.now(), equipment: id, createdAt: new Date().toISOString() };
        maintList.push(maintRecord);
        mIdx = maintList.length - 1;
      }
      maintList[mIdx] = {
        ...maintList[mIdx],
        problemDescription,
        workPerformed,
        partsReplaced,
        partsCost: pCost,
        labourCost: lCost,
        cost: totalCost,
        remarks: remarks || '',
        specialist: specialist || req.user.name || 'Technician',
        status: 'Completed',
        previousUsageHours: eq.totalUsageHours,
        serviceDate: new Date().toISOString(),
        photos: photos || []
      };
      maintRecord = maintList[mIdx];
      localDb.write('maintenance', maintList);
    }

    await logAudit(req, req.user, 'Maintenance report submitted', oldStatus, 'Awaiting Maintenance Approval', `Submitted maintenance report for equipment ${eq.name}. Total cost: ₹${totalCost}`);
    return res.json({ success: true, message: 'Maintenance completion report submitted. Awaiting manager approval.', data: maintRecord });
  } catch (err) {
    console.error('Submit maintenance report error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance/approve (Approves completed maintenance)
router.post('/equipment/:id/maintenance/approve', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const list = localDb.read('equipment');
      eq = list.find(e => e._id === id || e.id === id);
    }
    if (!eq) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    let maintRecord;
    if (isDbConnected()) {
      maintRecord = await Maintenance.findOne({ equipment: id, status: 'Completed' });
    } else {
      const maintList = localDb.read('maintenance') || [];
      maintRecord = maintList.find(m => m.equipment === id && m.status === 'Completed');
    }

    if (!maintRecord) {
      return res.status(400).json({ success: false, message: 'Cannot approve maintenance: no completed report found to approve.' });
    }

    const oldStatus = eq.status;
    eq.status = 'Available';
    eq.currentCycleHours = 0;
    eq.lastMaintenanceDate = new Date();
    
    // Reset individual unit work hours for those under maintenance
    if (eq.units && eq.units.length > 0) {
      eq.units.forEach(u => {
        if (u.status === 'Under Maintenance' || u.hours >= 350) {
          u.hours = 0;
          u.status = 'Available';
        }
      });
    }

    if (isDbConnected()) {
      await eq.save();
      maintRecord.status = 'Approved';
      maintRecord.serviceDate = new Date();
      await maintRecord.save();
    } else {
      const list = localDb.read('equipment');
      const idx = list.findIndex(e => e._id === id || e.id === id);
      list[idx] = eq;
      localDb.write('equipment', list);

      const maintList = localDb.read('maintenance') || [];
      const mIdx = maintList.findIndex(m => m.equipment === id && m.status === 'Completed');
      if (mIdx !== -1) {
        maintList[mIdx].status = 'Approved';
        maintList[mIdx].serviceDate = new Date().toISOString();
        localDb.write('maintenance', maintList);
      }
    }

    await logAudit(req, req.user, 'Maintenance approved', oldStatus, 'Available', `Approved maintenance completion for equipment ${eq.name}`);
    await logAudit(req, null, 'Equipment returned to Available status', oldStatus, 'Available', `Equipment ${eq.name} returned to available status after maintenance.`);

    return res.json({ success: true, message: 'Equipment maintenance approved and returned to service.', data: eq });
  } catch (err) {
    console.error('Approve maintenance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/equipment/:id/maintenance/reject (Rejects completed maintenance)
router.post('/equipment/:id/maintenance/reject', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    let eq;
    if (isDbConnected()) {
      eq = await Equipment.findById(id);
    } else {
      const list = localDb.read('equipment');
      eq = list.find(e => e._id === id || e.id === id);
    }
    if (!eq) return res.status(404).json({ success: false, message: 'Equipment not found.' });

    const oldStatus = eq.status;
    eq.status = 'Under Maintenance';

    let maintRecord;
    if (isDbConnected()) {
      await eq.save();
      maintRecord = await Maintenance.findOne({ equipment: id, status: 'Completed' });
      if (maintRecord) {
        maintRecord.status = 'Rejected';
        await maintRecord.save();
      }
    } else {
      const list = localDb.read('equipment');
      const idx = list.findIndex(e => e._id === id || e.id === id);
      list[idx] = eq;
      localDb.write('equipment', list);

      const maintList = localDb.read('maintenance') || [];
      const mIdx = maintList.findIndex(m => m.equipment === id && m.status === 'Completed');
      if (mIdx !== -1) {
        maintList[mIdx].status = 'Rejected';
        localDb.write('maintenance', maintList);
      }
    }

    await logAudit(req, req.user, 'Maintenance rejected', oldStatus, 'Under Maintenance', `Rejected maintenance completion for equipment ${eq.name}`);
    return res.json({ success: true, message: 'Equipment maintenance report rejected. Reverted status to Under Maintenance.' });
  } catch (err) {
    console.error('Reject maintenance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/cooperative/feedback (Fetch all farmer feedbacks for managers)
router.get('/feedback', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      list = await Feedback.find()
        .populate({
          path: 'booking',
          populate: [
            { path: 'equipment' },
            { path: 'farmer', select: 'name email mobile' }
          ]
        })
        .populate('farmer', 'name email mobile')
        .sort({ createdAt: -1 });
    } else {
      list = localDb.read('feedbacks') || [];
      const bookings = localDb.read('bookings');
      const equipmentList = localDb.read('equipment');
      const users = localDb.read('users');

      list = list.map(f => {
        const bk = bookings.find(b => b._id === f.booking || b.id === f.booking);
        const farmerUser = users.find(u => u._id === f.farmer || u.id === f.farmer) || { name: 'Farmer' };
        
        return {
          ...f,
          farmer: farmerUser,
          booking: bk ? {
            ...bk,
            equipment: equipmentList.find(e => e._id === bk.equipment || e.id === bk.equipment),
            farmer: users.find(u => u._id === bk.farmer || u.id === bk.farmer) || farmerUser
          } : null
        };
      });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    let jobsList = [];
    let usersList = [];
    if (isDbConnected()) {
      jobsList = await Job.find().populate('operator', 'name email mobile');
    } else {
      jobsList = localDb.read('jobs') || [];
      usersList = localDb.read('users') || [];
    }

    const populatedList = list.map(f => {
      let operatorName = 'N/A';
      let operatorRemarks = '';
      const bookingIdStr = f.booking?._id?.toString() || f.booking?.id?.toString() || f.booking;
      if (bookingIdStr) {
        const job = jobsList.find(j => {
          const jBkId = j.booking?._id?.toString() || j.booking?.toString() || j.booking;
          return jBkId === bookingIdStr;
        });
        if (job) {
          operatorRemarks = job.remarks || '';
          if (typeof job.operator === 'object' && job.operator) {
            operatorName = job.operator.name;
          } else if (job.operator) {
            const opUser = usersList.find(u => u._id === job.operator || u.id === job.operator);
            if (opUser) operatorName = opUser.name;
          }
        }
      }

      return {
        ...JSON.parse(JSON.stringify(f)),
        operatorName,
        operatorRemarks
      };
    });

    return res.json({ success: true, count: populatedList.length, data: populatedList });
  } catch (err) {
    console.error('Fetch cooperative feedback error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/cooperative/billing-report (Generates financial report for custom period)
router.get('/billing-report', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Cooperative Staff', 'Officer'), async (req, res) => {
  try {
    const { from, to, district, taluk } = req.query;
    const userDistrict = req.user?.district;
    const userRole = req.user?.role;

    // District Staff must only see their own district's report/payroll.
    // Government Officers and Admins can view all districts ('ALL') or filter by specific district.
    let targetDistrict = district;
    if (userRole !== 'Officer' && userRole !== 'Admin') {
      targetDistrict = userDistrict || district || null;
    } else if (district === 'ALL' || !district) {
      targetDistrict = null;
    }
    const targetTaluk = taluk && taluk !== 'ALL' ? taluk : null;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'From and To dates are required.' });
    }

    const parseDate = (dStr) => {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
      }
      return new Date(dStr);
    };

    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    toDate.setHours(23, 59, 59, 999);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid Date format.' });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ success: false, message: 'From Date cannot be after To Date.' });
    }

    let bookings = [];
    let jobs = [];
    let maintenance = [];
    let invoices = [];

    if (isDbConnected()) {
      bookings = await Booking.find({
        createdAt: { $gte: fromDate, $lte: toDate }
      }).populate('farmer', 'name email mobile farmerId district taluk')
        .populate('equipment', 'name category regNumber rentalRate district taluk');

      const bookingIds = bookings.map(b => b._id);
      jobs = await Job.find({
        booking: { $in: bookingIds }
      }).populate('operator', 'name email mobile');

      invoices = await Invoice.find({
        booking: { $in: bookingIds }
      });

      maintenance = await Maintenance.find({
        createdAt: { $gte: fromDate, $lte: toDate }
      }).populate('equipment', 'name category regNumber district taluk');
    } else {
      const allBookings = localDb.read('bookings') || [];
      bookings = allBookings.filter(b => {
        const d = new Date(b.createdAt);
        return d >= fromDate && d <= toDate;
      });

      const bIds = bookings.map(b => b._id || b.id);
      const allJobs = localDb.read('jobs') || [];
      jobs = allJobs.filter(j => bIds.includes(j.booking));

      const allInvoices = localDb.read('invoices') || [];
      invoices = allInvoices.filter(i => bIds.includes(i.booking));

      const allMaint = localDb.read('maintenance') || [];
      maintenance = allMaint.filter(m => {
        const d = new Date(m.createdAt || m.serviceDate);
        return d >= fromDate && d <= toDate;
      });

      const allEq = localDb.read('equipment') || [];
      const allUsers = localDb.read('users') || [];

      bookings = bookings.map(b => ({
        ...b,
        farmer: allUsers.find(u => u._id === b.farmer || u.id === b.farmer) || { name: 'Farmer', farmerId: 'N/A' },
        equipment: allEq.find(e => e._id === b.equipment || e.id === b.equipment)
      }));

      jobs = jobs.map(j => ({
        ...j,
        operator: allUsers.find(u => u._id === j.operator || u.id === j.operator) || { name: 'Operator' }
      }));

      maintenance = maintenance.map(m => ({
        ...m,
        equipment: allEq.find(e => e._id === m.equipment || e.id === m.equipment)
      }));
    }

    if (targetDistrict) {
      const dNorm = targetDistrict.toLowerCase();
      bookings = bookings.filter(b => {
        const eqDist = b.equipment?.district || b.farmer?.district;
        return !eqDist || eqDist.toLowerCase() === dNorm;
      });
      maintenance = maintenance.filter(m => {
        const eqDist = m.equipment?.district;
        return !eqDist || eqDist.toLowerCase() === dNorm;
      });
    }

    if (targetTaluk) {
      const tNorm = targetTaluk.toLowerCase();
      bookings = bookings.filter(b => {
        const eqTaluk = b.equipment?.taluk || b.farmer?.taluk;
        return !eqTaluk || eqTaluk.toLowerCase() === tNorm;
      });
      maintenance = maintenance.filter(m => {
        const eqTaluk = m.equipment?.taluk;
        return !eqTaluk || eqTaluk.toLowerCase() === tNorm;
      });
    }

    const bookingDetails = bookings.map(b => {
      const bIdStr = b._id?.toString() || b.id?.toString();
      const job = jobs.find(j => {
        const jBkId = j.booking?._id?.toString() || j.booking?.toString() || j.booking;
        return jBkId === bIdStr;
      });
      const invoice = invoices.find(inv => {
        const invBkId = inv.booking?._id?.toString() || inv.booking?.toString() || inv.booking;
        return invBkId === bIdStr;
      });

      const farmerName = b.farmer?.name || 'Farmer';
      const farmerId = b.farmer?.farmerId || 'N/A';
      const equipmentName = b.equipment?.name || 'Equipment';
      const equipmentReg = b.equipment?.regNumber || 'N/A';
      const operatorName = job?.operator?.name || 'Assigned Operator';
      const operatorId = job?.operator?._id?.toString() || job?.operator?.id?.toString() || 'N/A';
      const workingHours = job?.workingHours || 0;
      
      const hourlyRate = 0;
      const operatorCost = 0;

      const penalty = b.penalty || invoice?.penalty || 0;
      const tax = invoice?.tax || Math.round(b.totalAmount * 0.18);
      const totalAmount = invoice?.totalAmount || (b.totalAmount + tax + penalty);
      const paymentStatus = invoice?.paymentStatus || 'Unpaid';
      const invoiceNumber = invoice?.invoiceNumber || 'INV-TEMP';
      
      return {
        bookingId: bIdStr,
        farmerName,
        farmerId,
        equipmentId: b.equipment?._id?.toString() || b.equipment?.id?.toString() || 'N/A',
        equipmentName,
        equipmentReg,
        operatorName,
        operatorId,
        cooperative: b.equipment?.cooperativeHub || 'Ludhiana Central Hub #1',
        bookingDate: b.createdAt,
        workDate: job?.endTime || b.startDate,
        startTime: job?.startTime || null,
        endTime: job?.endTime || null,
        workingHours,
        bookingStatus: b.status,
        equipmentRentalCost: b.rentalRate,
        baseRentalAmount: b.totalAmount,
        penalty,
        tax,
        totalAmount,
        paymentStatus,
        paymentDate: invoice?.createdAt || b.createdAt,
        invoiceNumber,
        operatorHourlyRate: hourlyRate,
        operatorCost
      };
    });

    // Calculate the number of days in this period
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Fetch operators and specialists
    let operators = [];
    let specialists = [];
    if (isDbConnected()) {
      operators = await User.find({ role: 'Equipment Operator' }).select('name email mobile district taluk');
      specialists = await User.find({ role: 'Equipmaintance' }).select('name email mobile district taluk');
    } else {
      const allUsers = localDb.read('users') || [];
      operators = allUsers.filter(u => u.role === 'Equipment Operator');
      specialists = allUsers.filter(u => u.role === 'Equipmaintance');
    }

    // Filter operators and specialists by target District & Taluk
    if (targetDistrict) {
      const dNorm = targetDistrict.toLowerCase();
      operators = operators.filter(u => u.district && u.district.toLowerCase() === dNorm);
      specialists = specialists.filter(u => u.district && u.district.toLowerCase() === dNorm);
    }

    if (targetTaluk) {
      const tNorm = targetTaluk.toLowerCase();
      operators = operators.filter(u => u.taluk && u.taluk.toLowerCase() === tNorm);
      specialists = specialists.filter(sp => sp.taluk && sp.taluk.toLowerCase() === tNorm);
    }

    const OPERATOR_MONTHLY = 25000;
    const SPECIALIST_MONTHLY = 30000;

    const operatorCostsList = operators.map(op => {
      const periodCost = Math.round((OPERATOR_MONTHLY / 30) * diffDays);
      return {
        operatorName: op.name,
        operatorId: op._id?.toString() || op.id,
        workingHours: 'Salaried',
        hourlyRate: 'Fixed',
        monthlySalary: OPERATOR_MONTHLY,
        totalCost: periodCost
      };
    });

    const specialistCostsList = specialists.map(sp => {
      const periodCost = Math.round((SPECIALIST_MONTHLY / 30) * diffDays);
      return {
        specialistName: sp.name,
        specialistId: sp._id?.toString() || sp.id,
        monthlySalary: SPECIALIST_MONTHLY,
        totalCost: periodCost
      };
    });

    const maintenanceExpensesList = maintenance.map(m => {
      const pCost = m.partsCost || 0;
      const lCost = 0; // Covered under specialist monthly salary
      const totalCost = pCost + lCost;
      return {
        equipmentId: m.equipment?._id?.toString() || m.equipment?.id?.toString() || 'N/A',
        equipmentName: m.equipment?.name || 'Equipment',
        equipmentReg: m.equipment?.regNumber || 'N/A',
        maintenanceDate: m.serviceDate || m.createdAt,
        maintenanceType: m.maintenanceReason || 'Routine Maintenance',
        maintenanceDescription: m.description || m.problemDescription || 'Service',
        partsCost: pCost,
        labourCost: lCost,
        totalCost,
        specialist: m.specialist || 'Technician',
        status: m.status || 'Completed'
      };
    });

    const totalBookings = bookings.length;
    const completedJobs = bookings.filter(b => b.status === 'Returned').length;
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;

    const totalRentalRevenue = bookingDetails.reduce((sum, bd) => sum + bd.baseRentalAmount, 0);
    const totalOperatorCost = operatorCostsList.reduce((sum, oc) => sum + oc.totalCost, 0);
    const totalSpecialistCost = specialistCostsList.reduce((sum, sc) => sum + sc.totalCost, 0);
    const totalStaffPayroll = totalOperatorCost + totalSpecialistCost;

    const totalMaintenanceCost = maintenanceExpensesList.reduce((sum, me) => sum + me.totalCost, 0);
    
    const totalPenalties = bookingDetails.reduce((sum, bd) => sum + bd.penalty, 0);
    const totalTaxes = bookingDetails.reduce((sum, bd) => sum + bd.tax, 0);
    
    const netRevenue = totalRentalRevenue - totalStaffPayroll - totalMaintenanceCost;
    
    const totalAmountCollected = bookingDetails
      .filter(bd => bd.paymentStatus === 'Paid')
      .reduce((sum, bd) => sum + bd.totalAmount, 0);
      
    const pendingAmount = bookingDetails
      .filter(bd => bd.paymentStatus === 'Pending')
      .reduce((sum, bd) => sum + bd.totalAmount, 0);

    const summary = {
      totalBookings,
      completedJobs,
      cancelledBookings,
      totalRentalRevenue,
      totalOperatorCost: totalStaffPayroll, // maps staff payroll combined
      totalOperatorSalariesOnly: totalOperatorCost,
      totalSpecialistSalariesOnly: totalSpecialistCost,
      totalMaintenanceCost,
      totalPenalties,
      totalTaxes,
      netRevenue,
      totalAmountCollected,
      pendingAmount
    };

    await logAudit(req, req.user, 'Billing report generated', '', `Period: ${from} to ${to}`, `Generated billing financial report containing ${totalBookings} bookings.`);

    return res.json({
      success: true,
      data: {
        period: { from, to, days: diffDays },
        summary,
        bookings: bookingDetails,
        operatorCosts: operatorCostsList,
        specialistCosts: specialistCostsList,
        maintenanceCosts: maintenanceExpensesList
      }
    });
  } catch (err) {
    console.error('Generate billing report error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/cooperative/equipment/:id/units/:unitNum/operator (Assign 1 operator per equipment unit)
router.put('/equipment/:id/units/:unitNum/operator', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff'), async (req, res) => {
  try {
    const { id, unitNum } = req.params;
    const { operatorId } = req.body;
    const targetUnitNum = parseInt(unitNum);

    let eq;
    let operatorUser = null;

    if (isDbConnected()) {
      if (operatorId) {
        operatorUser = await User.findById(operatorId);
      }
      eq = await Equipment.findById(id);
      if (!eq) return res.status(404).json({ success: false, message: 'Equipment not found.' });

      const unit = eq.units.find(u => u.unitNum === targetUnitNum);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found.' });

      unit.assignedOperator = operatorId || null;
      await eq.save();
    } else {
      const users = localDb.read('users');
      if (operatorId) {
        operatorUser = users.find(u => u._id === operatorId || u.id === operatorId);
      }
      const equipmentList = localDb.read('equipment');
      const idx = equipmentList.findIndex(e => e._id === id || e.id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Equipment not found.' });

      eq = equipmentList[idx];
      if (!eq.units) eq.units = [];
      const uIdx = eq.units.findIndex(u => u.unitNum === targetUnitNum);
      if (uIdx === -1) return res.status(404).json({ success: false, message: 'Unit not found.' });

      eq.units[uIdx].assignedOperator = operatorId || null;
      equipmentList[idx] = eq;
      localDb.write('equipment', equipmentList);
    }

    const opName = operatorUser ? operatorUser.name : 'Unassigned';
    await logAudit(req, req.user, 'Assign Unit Operator', '', `Unit #${targetUnitNum}: ${opName}`, `Assigned operator ${opName} to ${eq.name} Unit #${targetUnitNum}`);

    return res.json({ success: true, message: `Operator ${opName} assigned to Unit #${targetUnitNum} successfully.`, data: eq });
  } catch (err) {
    console.error('Assign unit operator error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
