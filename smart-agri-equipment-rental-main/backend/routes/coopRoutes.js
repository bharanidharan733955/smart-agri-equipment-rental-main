// backend/routes/coopRoutes.js
import express from 'express';
import { User, Equipment, Booking, Invoice, Maintenance, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/cooperative/operators-with-equipment (Retrieve operators with their assigned vehicles)
router.get('/operators-with-equipment', authenticateToken, authorizeRoles('Manager', 'Admin', 'Equipment Operator'), async (req, res) => {
  try {
    let operators = [];
    let equipmentList = [];

    if (isDbConnected()) {
      operators = await User.find({ role: 'Equipment Operator' }).select('-password');
      equipmentList = await Equipment.find();
    } else {
      operators = localDb.read('users').filter(u => u.role === 'Equipment Operator');
      equipmentList = localDb.read('equipment');
    }

    // Map each operator with their assigned equipment
    const result = operators.map(op => {
      const opId = op._id?.toString() || op.id;
      const assigned = equipmentList.filter(eq => {
        const eqOpId = eq.assignedOperator?._id?.toString() || eq.assignedOperator?.toString() || eq.assignedOperator;
        return eqOpId === opId;
      });
      return {
        _id: opId,
        name: op.name,
        email: op.email,
        mobile: op.mobile,
        district: op.district,
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
router.get('/operators', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      list = await User.find({ role: 'Equipment Operator' }).select('name email mobile');
    } else {
      list = localDb.read('users').filter(u => u.role === 'Equipment Operator');
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('Fetch operators error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/cooperative/farmers (Retrieve pending and approved farmers)
router.get('/farmers', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    let list = [];
    if (isDbConnected()) {
      list = await User.find({ role: 'Farmer' }).select('-password');
    } else {
      list = localDb.read('users').filter(u => u.role === 'Farmer');
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error('Fetch farmers error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/farmers/:id/approve (Approve pending farmer)
router.post('/farmers/:id/approve', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let farmer;

    if (isDbConnected()) {
      farmer = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    } else {
      const users = localDb.read('users');
      const idx = users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        users[idx].isApproved = true;
        farmer = users[idx];
        localDb.write('users', users);
      }
    }

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }

    await logAudit(req, req.user, 'Farmer Approval', 'Pending', 'Approved', `Approved farmer registration for ${farmer.name}`);

    return res.json({ success: true, message: 'Farmer account approved successfully.', data: farmer });
  } catch (err) {
    console.error('Approve farmer error:', err);
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
router.get('/maintenance', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
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
// GET /api/cooperative/invoices (Fetch all invoices)
router.get('/invoices', authenticateToken, authorizeRoles('Manager', 'Admin', 'Officer'), async (req, res) => {
  try {
    let invoices = [];
    if (isDbConnected()) {
      invoices = await Invoice.find().populate({
        path: 'booking',
        populate: [
          { path: 'equipment' },
          { path: 'farmer', select: 'name email mobile' }
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

    return res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    console.error('Fetch invoices error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/cooperative/invoices/:id/pay (Pay invoice)
router.post('/invoices/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let invoice;

    if (isDbConnected()) {
      invoice = await Invoice.findByIdAndUpdate(id, { paymentStatus: 'Paid' }, { new: true });
    } else {
      const invoices = localDb.read('invoices');
      const idx = invoices.findIndex(inv => inv._id === id || inv.id === id);
      if (idx !== -1) {
        invoices[idx].paymentStatus = 'Paid';
        invoice = invoices[idx];
        localDb.write('invoices', invoices);
      }
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    await logAudit(req, req.user, 'Payment Received', 'Pending', 'Paid', `Payment completed for Invoice ID ${invoice.invoiceNumber}`);

    return res.json({ success: true, message: 'Payment registered successfully.', data: invoice });
  } catch (err) {
    console.error('Invoice pay error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
