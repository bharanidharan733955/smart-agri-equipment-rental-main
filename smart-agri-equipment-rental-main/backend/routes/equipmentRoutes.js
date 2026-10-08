// backend/routes/equipmentRoutes.js
import express from 'express';
import { Equipment, User, logAudit, isDbConnected, localDb } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { getTaluksForDistrict } from '../data/tnLocationData.js';

const router = express.Router();

import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

// GET /api/equipment
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const { category, search, district: queryDistrict, taluk: queryTaluk } = req.query;
    let targetDistrict = queryDistrict;
    let targetTaluk = queryTaluk;
    let farmerLocation = null;

    if (req.user && req.user.role === 'Farmer') {
      let farmerUser = null;
      if (isDbConnected()) {
        farmerUser = await User.findById(req.user.id);
      } else {
        const users = localDb.read('users');
        farmerUser = users.find(u => u._id === req.user.id || u.id === req.user.id);
      }
      if (farmerUser) {
        targetDistrict = farmerUser.district || targetDistrict;
        targetTaluk = farmerUser.taluk || targetTaluk;
        farmerLocation = {
          district: farmerUser.district || '',
          taluk: farmerUser.taluk || '',
          village: farmerUser.village || ''
        };
      }
    } else if (req.user && (req.user.role === 'Staff' || req.user.role === 'Cooperative Staff' || req.user.role === 'Manager') && req.user.district) {
      targetDistrict = req.user.district;
    }

    let items = [];

    if (isDbConnected()) {
      let query = {};
      if (category && category !== 'All' && category !== 'All categories') {
        query.category = { $regex: new RegExp(category, 'i') };
      }
      if (targetDistrict) {
        query.district = { $regex: new RegExp(`^${targetDistrict}$`, 'i') };
      }
      if (targetTaluk) {
        query.taluk = { $regex: new RegExp(`^${targetTaluk}$`, 'i') };
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
      if (targetDistrict) {
        items = items.filter(e => e.district && e.district.toLowerCase() === targetDistrict.toLowerCase());
      }
      if (targetTaluk) {
        items = items.filter(e => e.taluk && e.taluk.toLowerCase() === targetTaluk.toLowerCase());
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

    // Attach accurate inventory stats for each equipment item
    const formattedItems = items.map((item, index) => {
      const e = JSON.parse(JSON.stringify(item));
      const defaultLocations = [
        { district: 'Coimbatore', taluk: 'Pollachi' },
        { district: 'Coimbatore', taluk: 'Pollachi' },
        { district: 'Coimbatore', taluk: 'Pollachi' },
        { district: 'Erode', taluk: 'Perundurai' },
        { district: 'Erode', taluk: 'Perundurai' },
        { district: 'Coimbatore', taluk: 'Anaimalai' },
        { district: 'Madurai', taluk: 'Melur' },
        { district: 'Tiruchirappalli', taluk: 'Lalgudi' },
        { district: 'Salem', taluk: 'Attur' }
      ];
      const loc = defaultLocations[index % defaultLocations.length];
      e.district = e.district || loc.district;
      e.taluk = e.taluk || loc.taluk;

      if (e.units && Array.isArray(e.units) && e.units.length > 0) {
        const total = e.units.length;
        const avail = e.units.filter(u => u.status === 'Available').length;
        const booked = e.units.filter(u => ['Reserved', 'In Use', 'Rented', 'BOOKED'].includes(u.status)).length;
        const maint = e.units.filter(u => ['Under Maintenance', 'Under Inspection', 'Maintenance Required', 'AWAITING_APPROVAL', 'UNDER_MAINTENANCE', 'MAINTENANCE_REQUIRED'].includes(u.status)).length;
        e.totalQuantity = total;
        e.availableQuantity = avail;
        e.bookedQuantity = booked;
        e.maintenanceQuantity = maint;
      } else {
        e.totalQuantity = e.totalQuantity || e.totalUnits || 5;
        e.availableQuantity = e.availableQuantity ?? (e.status === 'Available' ? 3 : 0);
        e.bookedQuantity = e.bookedQuantity ?? (e.status === 'Reserved' || e.status === 'In Use' ? 1 : 0);
        e.maintenanceQuantity = e.maintenanceQuantity ?? (e.status === 'Under Maintenance' ? 1 : 0);
      }
      return e;
    });

    return res.json({
      success: true,
      count: formattedItems.length,
      farmerLocation,
      data: formattedItems
    });
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

// POST /api/equipment (Manager, Admin, Staff, Officer)
router.post('/', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Officer'), async (req, res) => {
  try {
    const {
      name,
      regNumber,
      category,
      brand,
      manufacturer,
      model,
      purchaseDate,
      assignedOperator,
      rentalRate,
      price,
      imageUrl,
      district,
      taluk,
      cooperativeHub,
      location,
      totalUnits
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const rate = parseFloat(rentalRate || price || 1800);
    if (isNaN(rate) || rate < 1800 || rate > 3500) {
      return res.status(400).json({ success: false, message: 'Rental rate must be between ₹1800 and ₹3500 per day.' });
    }

    const targetDistrict = district || 'Coimbatore';
    const validTaluks = getTaluksForDistrict(targetDistrict);
    const targetTaluk = (taluk && validTaluks.includes(taluk)) ? taluk : (validTaluks[0] || targetDistrict);
    const targetHub = cooperativeHub || `${targetTaluk} Cooperative Hub`;
    const targetRegNumber = regNumber || `TN-${Math.floor(10 + Math.random() * 80)}-EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrCode = `AGRIRENT-QR-${targetRegNumber}-${Math.floor(1000 + Math.random() * 9000)}`;
    const numUnits = parseInt(totalUnits) || 15;

    // Build unit fleet serials for this taluk hub
    const unitsList = Array.from({ length: numUnits }, (_, idx) => {
      const unitNum = idx + 1;
      return {
        unitNum,
        serial: `TN-EQ-${targetTaluk.substring(0, 3).toUpperCase()}-${String(unitNum).padStart(2, '0')}`,
        hours: 0,
        status: 'Available'
      };
    });

    const eqData = {
      name,
      regNumber: targetRegNumber,
      category,
      brand: brand || manufacturer || name.split(' ')[0] || 'Mahindra',
      model: model || 'Arjun Ultra',
      purchaseDate: purchaseDate || new Date().toISOString(),
      assignedOperator: assignedOperator || null,
      rentalRate: rate,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      qrCode,
      status: 'Available',
      district: targetDistrict,
      taluk: targetTaluk,
      cooperativeHub: targetHub,
      location: location || `${targetTaluk} Hub, ${targetDistrict}`,
      totalUnits: numUnits,
      totalQuantity: numUnits,
      availableQuantity: numUnits,
      bookedQuantity: 0,
      maintenanceQuantity: 0,
      units: unitsList,
      totalUsageHours: 0,
      createdAt: new Date().toISOString()
    };

    let newEq;
    if (isDbConnected()) {
      newEq = await Equipment.create(eqData);
    } else {
      const equipments = localDb.read('equipment');
      newEq = {
        _id: 'eq-' + Date.now(),
        id: 'eq-' + Date.now(),
        ...eqData
      };
      equipments.unshift(newEq);
      localDb.write('equipment', equipments);
    }

    await logAudit(req, req.user, 'Add Equipment', '', newEq.name, `Added equipment ${newEq.name} to ${targetTaluk}, ${targetDistrict}`);

    return res.status(201).json({ success: true, message: `Equipment added successfully to ${targetTaluk} Hub (${targetDistrict}).`, data: newEq });
  } catch (err) {
    console.error('Create equipment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PUT /api/equipment/:id (Manager, Admin, Staff, Officer)
router.put('/:id', authenticateToken, authorizeRoles('Manager', 'Admin', 'Staff', 'Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.rentalRate !== undefined || updateData.price !== undefined) {
      const rate = parseFloat(updateData.rentalRate || updateData.price);
      if (isNaN(rate) || rate < 1800 || rate > 3500) {
        return res.status(400).json({ success: false, message: 'Rental rate must be between ₹1800 and ₹3500 per day.' });
      }
      updateData.rentalRate = rate;
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
