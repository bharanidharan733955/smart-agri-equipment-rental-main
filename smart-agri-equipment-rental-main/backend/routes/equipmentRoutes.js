// backend/routes/equipmentRoutes.js
import express from 'express';
import { Equipment, User, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/equipment
router.get('/', async (req, res) => {
  try {
    const { category, search, district } = req.query;
    let items = [];

    if (isDbConnected()) {
      let query = {};
      if (category && category !== 'All' && category !== 'All categories') {
        query.category = { $regex: new RegExp(category, 'i') };
      }
      if (search) {
        query.$or = [
          { name: { $regex: new RegExp(search, 'i') } },
          { model: { $regex: new RegExp(search, 'i') } },
          { brand: { $regex: new RegExp(search, 'i') } }
        ];
      }
      items = await Equipment.find(query).populate('assignedOperator', 'name email mobile');
    } else {
      items = localDb.read('equipment');
      if (category && category !== 'All' && category !== 'All categories') {
        items = items.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(e =>
          e.name.toLowerCase().includes(q) ||
          (e.brand && e.brand.toLowerCase().includes(q)) ||
          (e.model && e.model.toLowerCase().includes(q))
        );
      }
    }

    return res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error('Fetch equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/equipment/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let item;

    if (isDbConnected()) {
      item = await Equipment.findById(id).populate('assignedOperator', 'name email mobile');
    } else {
      const items = localDb.read('equipment');
      item = items.find(e => e.id === id || e._id === id);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('Fetch equipment detail error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/equipment (Manager and Admin)
router.post('/', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { name, regNumber, category, brand, model, purchaseDate, assignedOperator, rentalRate, imageUrl } = req.body;
    if (!name || !regNumber || !category || !rentalRate) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const rate = parseFloat(rentalRate);
    if (isNaN(rate) || rate < 1800 || rate > 3500) {
      return res.status(400).json({ success: false, message: 'Rental rate must be between ₹1800 and ₹3500 per day.' });
    }

    const qrCode = `AGRIRENT-QR-${regNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    let newEq;
    if (isDbConnected()) {
      newEq = await Equipment.create({
        name,
        regNumber,
        category,
        brand,
        model,
        purchaseDate,
        assignedOperator: assignedOperator || null,
        rentalRate: parseFloat(rentalRate),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
        qrCode,
        status: 'Available',
        cooperativeHub: req.user.cooperativeHub || 'Ludhiana Hub'
      });
    } else {
      const equipments = localDb.read('equipment');
      newEq = {
        _id: 'eq-' + Date.now(),
        id: 'eq-' + Date.now(),
        name,
        regNumber,
        category,
        brand,
        model,
        purchaseDate,
        assignedOperator: assignedOperator || null,
        rentalRate: parseFloat(rentalRate),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
        qrCode,
        status: 'Available',
        totalUsageHours: 0,
        cooperativeHub: req.user.cooperativeHub || 'Ludhiana Hub',
        createdAt: new Date().toISOString()
      };
      equipments.unshift(newEq);
      localDb.write('equipment', equipments);
    }

    await logAudit(req, req.user, 'Add Equipment', '', newEq.name, `Added equipment ${newEq.name} (${newEq.regNumber})`);

    return res.status(201).json({ success: true, message: 'Equipment added successfully.', data: newEq });
  } catch (err) {
    console.error('Create equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/equipment/:id (Manager and Admin)
router.put('/:id', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.rentalRate !== undefined) {
      const rate = parseFloat(updateData.rentalRate);
      if (isNaN(rate) || rate < 1800 || rate > 3500) {
        return res.status(400).json({ success: false, message: 'Rental rate must be between ₹1800 and ₹3500 per day.' });
      }
    }

    let updated;

    if (isDbConnected()) {
      updated = await Equipment.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const equipments = localDb.read('equipment');
      const idx = equipments.findIndex(e => e._id === id || e.id === id);
      if (idx !== -1) {
        equipments[idx] = { ...equipments[idx], ...updateData };
        updated = equipments[idx];
        localDb.write('equipment', equipments);
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    await logAudit(req, req.user, 'Update Equipment', '', updated.name, `Updated equipment ${updated.name}`);

    return res.json({ success: true, message: 'Equipment updated successfully.', data: updated });
  } catch (err) {
    console.error('Update equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// DELETE /api/equipment/:id (Manager and Admin)
router.delete('/:id', authenticateToken, authorizeRoles('Manager', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    let deleted;

    if (isDbConnected()) {
      deleted = await Equipment.findByIdAndDelete(id);
    } else {
      const equipments = localDb.read('equipment');
      const idx = equipments.findIndex(e => e._id === id || e.id === id);
      if (idx !== -1) {
        deleted = equipments.splice(idx, 1)[0];
        localDb.write('equipment', equipments);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    await logAudit(req, req.user, 'Delete Equipment', deleted.name, '', `Deleted equipment ${deleted.name}`);

    return res.json({ success: true, message: 'Equipment deleted successfully.', data: deleted });
  } catch (err) {
    console.error('Delete equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
