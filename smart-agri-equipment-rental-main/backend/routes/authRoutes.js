// backend/routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, logAudit, isDbConnected, localDb } from '../db.js';
import { GOVT_FARMER_REGISTRY, findGovtRecord } from '../data/govtFarmerRegistry.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agrirent-super-secret-key-12345';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mobile, district, address, cooperativeHub, farmerId } = req.body;

    let finalFarmerId = farmerId ? farmerId.trim() : null;
    let govtRecord = null;

    if (role === 'Farmer') {
      if (!name || !mobile) {
        return res.status(400).json({ success: false, message: 'Name and Mobile Number are required.' });
      }
      if (!finalFarmerId) {
        return res.status(400).json({ success: false, message: 'Farmer ID is required. Please use a valid Seeded Farmer ID (GOV-FARMER-1001 to GOV-FARMER-1050).' });
      }

      govtRecord = findGovtRecord(finalFarmerId, mobile);
      if (!govtRecord) {
        return res.status(400).json({
          success: false,
          message: `Invalid Farmer ID: '${finalFarmerId}' is not found in the Government Agriculture Registry. Please enter a valid Seeded Farmer ID (GOV-FARMER-1001 to GOV-FARMER-1050).`
        });
      }

      finalFarmerId = govtRecord.govtFarmerId;
    } else {
      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password || finalFarmerId || 'default123', 10);

    let newUser;
    if (isDbConnected()) {
      if (email) {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
      }
      if (role === 'Farmer') {
        const existingFarmer = await User.findOne({
          role: 'Farmer',
          $or: [
            { farmerId: finalFarmerId },
            { farmerId: govtRecord.altFarmerId },
            { mobile }
          ]
        });
        if (existingFarmer) {
          return res.status(400).json({
            success: false,
            message: `Duplicate Registration Blocked: Farmer ID '${finalFarmerId}' is already registered to account '${existingFarmer.name}'.`
          });
        }
      }
      newUser = await User.create({
        name,
        email: email || `${mobile}@agrirent.gov`,
        password: hashedPassword,
        role,
        mobile,
        district: district || govtRecord?.district || 'Coimbatore',
        address: address || `${govtRecord?.village}, ${govtRecord?.taluk}`,
        farmerId: finalFarmerId,
        cooperativeHub: cooperativeHub || `${govtRecord?.taluk || 'Cooperative'} Hub`,
        isApproved: false,
        verificationStatus: 'PENDING_VERIFICATION'
      });
    } else {
      const users = localDb.read('users');
      if (email) {
        const existing = users.find(u => u.email === email);
        if (existing) {
          return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
      }
      if (role === 'Farmer') {
        const existingFarmer = users.find(u =>
          u.role === 'Farmer' && (
            u.farmerId === finalFarmerId ||
            u.farmerId === govtRecord.altFarmerId ||
            u.mobile === mobile
          )
        );
        if (existingFarmer) {
          return res.status(400).json({
            success: false,
            message: `Duplicate Registration Blocked: Farmer ID '${finalFarmerId}' is already registered to account '${existingFarmer.name}'.`
          });
        }
      }
      newUser = {
        _id: 'USR-' + Date.now(),
        name,
        email: email || `${mobile}@agrirent.gov`,
        password: hashedPassword,
        role,
        mobile,
        district: district || govtRecord?.district || 'Coimbatore',
        address: address || `${govtRecord?.village}, ${govtRecord?.taluk}`,
        farmerId: finalFarmerId,
        cooperativeHub: cooperativeHub || `${govtRecord?.taluk || 'Cooperative'} Hub`,
        isApproved: false,
        verificationStatus: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localDb.write('users', users);
    }

    // Audit log
    await logAudit(req, newUser, 'Registration', '', JSON.stringify({ email, role }), `User registered with role ${role}`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. ' + (role === 'Farmer' ? 'Pending manager approval.' : ''),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user;
    if (isDbConnected()) {
      user = await User.findOne({ email });
    } else {
      const users = localDb.read('users');
      user = users.find(u => u.email === email);
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }


    // Generate JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district, cooperativeHub: user.cooperativeHub },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit(req, user, 'Login', '', '', `User logged in successfully`);

    return res.json({
      success: true,
      message: 'Authenticated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        district: user.district,
        cooperativeHub: user.cooperativeHub
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

export default router;
