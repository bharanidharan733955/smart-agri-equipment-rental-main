// backend/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirent';

let isConnected = false;

import bcrypt from 'bcryptjs';

function getMockEquipment() {
  const baseEq = [
    {
      _id: '65d1b716f9f30b2cd8133501',
      id: 'eq-1',
      name: 'Mahindra Tractor 6670',
      regNumber: 'PB-10-AT-8821',
      category: 'Tractor',
      brand: 'Mahindra',
      model: 'Arjun Ultra',
      purchaseDate: '2025-01-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 12,
      totalUnits: 15,
      rentalRate: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-AT-8821',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133502',
      id: 'eq-2',
      name: 'John Deere Harvester 84',
      regNumber: 'PB-10-RT-5510',
      category: 'Harvester',
      brand: 'John Deere',
      model: 'GreenSystem',
      purchaseDate: '2025-03-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 5,
      totalUnits: 15,
      rentalRate: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-RT-5510',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133503',
      id: 'eq-3',
      name: 'Sonalika Rotavator Premium',
      regNumber: 'PB-10-CL-4411',
      category: 'Rotavator',
      brand: 'Sonalika',
      model: 'ProTillage',
      purchaseDate: '2025-02-18',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 800,
      imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb28c?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-CL-4411',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133504',
      id: 'eq-4',
      name: 'Dasmesh Multi-Crop Thresher',
      regNumber: 'PB-10-TH-2212',
      category: 'Thresher',
      brand: 'Dasmesh',
      model: 'PowerThresh 912',
      purchaseDate: '2025-04-05',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 1100,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-TH-2212',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133505',
      id: 'eq-5',
      name: 'Landforce Zero Till Seed Drill',
      regNumber: 'PB-10-SD-7711',
      category: 'Seed Drill',
      brand: 'Landforce',
      model: 'ZeroTill-X',
      purchaseDate: '2025-05-12',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 900,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-SD-7711',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133506',
      id: 'eq-6',
      name: 'Tillage Cultivator Pro',
      regNumber: 'PB-10-CV-3311',
      category: 'Cultivator',
      brand: 'Sonalika',
      model: 'Cultivator-X',
      purchaseDate: '2025-05-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 700,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-CV-3311',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133507',
      id: 'eq-7',
      name: 'Crop Sprayer Max',
      regNumber: 'PB-10-SP-9911',
      category: 'Sprayer',
      brand: 'Mahindra',
      model: 'Sprayer-X',
      purchaseDate: '2025-06-12',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 500,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-SP-9911',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133508',
      id: 'eq-8',
      name: 'Power Tiller Pro',
      regNumber: 'PB-10-PT-4411',
      category: 'Power Tiller',
      brand: 'Honda',
      model: 'Tiller-X',
      purchaseDate: '2025-06-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 600,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-PT-4411',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd8133509',
      id: 'eq-9',
      name: 'Laser Land Leveler',
      regNumber: 'PB-10-LL-1122',
      category: 'Cultivator',
      brand: 'Trimble',
      model: 'LaserLand-1',
      purchaseDate: '2025-07-01',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 1300,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-LL-1122',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd813350a',
      id: 'eq-10',
      name: 'Happy Seeder',
      regNumber: 'PB-10-HS-3344',
      category: 'Seed Drill',
      brand: 'Kalgidhar',
      model: 'HappySeed-2',
      purchaseDate: '2025-07-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 950,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-HS-3344',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd813350b',
      id: 'eq-11',
      name: 'Straw Baler',
      regNumber: 'PB-10-SB-5566',
      category: 'Tractor',
      brand: 'New Holland',
      model: 'Baler-3',
      purchaseDate: '2025-07-20',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-SB-5566',
      cooperativeHub: 'Ludhiana Central Hub #1'
    },
    {
      _id: '65d1b716f9f30b2cd813350c',
      id: 'eq-12',
      name: 'Crop Reaper',
      regNumber: 'PB-10-CR-7788',
      category: 'Rotavator',
      brand: 'Stihl',
      model: 'Reaper-4',
      purchaseDate: '2025-07-25',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 15,
      rentalRate: 750,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-PB-10-CR-7788',
      cooperativeHub: 'Ludhiana Central Hub #1'
    }
  ];

  return baseEq.map(eq => {
    const seed = parseInt(eq.id.split('-')[1]) || 1;
    const units = Array.from({ length: 15 }, (_, idx) => {
      const unitNum = idx + 1;
      // Deterministic work hours ranging up to 370 hours
      const hours = Math.round((((seed * 37 + unitNum * 17) % 38) * 9.8) * 10) / 10;
      
      let status = 'Available';
      if (hours >= 350) {
        status = 'Under Maintenance';
      } else {
        const rand = (seed * 11 + unitNum * 7) % 10;
        if (rand === 3 || rand === 7) status = 'Rented';
        else if (rand === 5) status = 'Reserved';
      }

      return {
        unitNum,
        serial: `${eq.regNumber}-${String(unitNum).padStart(2, '0')}`,
        hours,
        status
      };
    });

    const totalUsageHours = Math.round(units.reduce((sum, u) => sum + u.hours, 0) / 15 * 10) / 10;

    return {
      ...eq,
      units,
      totalUsageHours
    };
  });
}

async function seedDemoData() {
  const demoUsers = [
    { name: 'Siva Farmer', email: 'farmer@agrirent.gov', password: 'farmer123', role: 'Farmer', mobile: '9876543210', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', farmerId: '123456789012', isApproved: true },
    { name: 'Vikram Operator', email: 'operator@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543212', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Rajesh Operator', email: 'rajesh@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543220', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Ramesh Operator', email: 'ramesh@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543221', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Suresh Operator', email: 'suresh@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543222', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Ganesh Operator', email: 'ganesh@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543223', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Karthik Operator', email: 'karthik@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543224', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Murugan Operator', email: 'murugan@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543225', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Siva Operator', email: 'siva@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543226', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Hari Operator', email: 'hari@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543227', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Arjun Operator', email: 'arjun@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543228', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Vijay Operator', email: 'vijay@agrirent.gov', password: 'operator123', role: 'Equipment Operator', mobile: '9876543229', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Maintenance Tech', email: 'maint@agrirent.gov', password: 'maint123', role: 'Equipmaintance', mobile: '9876543213', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'Staff Controller', email: 'staff@agrirent.gov', password: 'staff123', role: 'Staff', mobile: '9876543214', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true },
    { name: 'State Government Auditor', email: 'officer@agrirent.gov', password: 'officer123', role: 'Officer', mobile: '9876543215', district: 'Ludhiana', cooperativeHub: 'Ludhiana Central Hub #1', isApproved: true }
  ];

  if (isConnected) {
    try {
      for (const u of demoUsers) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
          console.log(`🌱 Seeding database user: ${u.email}...`);
          const hashedPassword = await bcrypt.hash(u.password, 10);
          await User.create({ ...u, password: hashedPassword });
        }
      }

      // Seed equipment to MongoDB if count < 12 or units array is missing
      const eqCount = await Equipment.countDocuments();
      const eqWithUnits = await Equipment.countDocuments({ units: { $exists: true, $not: { $size: 0 } } });
      if (eqCount < 12 || eqWithUnits < eqCount) {
        console.log("🌱 Seeding MongoDB equipment database (with units fleet)...");
        await Equipment.deleteMany({}); // clear existing
        const mockEq = getMockEquipment();
        const opUser = await User.findOne({ role: 'Equipment Operator' });
        if (opUser) {
          mockEq[0].assignedOperator = opUser._id;
          mockEq[1].assignedOperator = opUser._id;
        }
        await Equipment.insertMany(mockEq);
        console.log("✅ MongoDB Equipment Seeding completed with units fleet.");
      }
    } catch (err) {
      console.error('Error seeding DB users:', err);
    }
  } else {
    // Local memory file seeding
    const fileUsers = localDb.read('users');
    let updatedUsers = [...fileUsers];
    let seededAny = false;

    for (const u of demoUsers) {
      const exists = fileUsers.find(item => item.email === u.email);
      if (!exists) {
        console.log(`🌱 Seeding local JSON user: ${u.email}...`);
        const hashedPassword = await bcrypt.hash(u.password, 10);
        updatedUsers.push({
          _id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
          ...u,
          password: hashedPassword,
          createdAt: new Date().toISOString()
        });
        seededAny = true;
      }
    }

    if (seededAny) {
      localDb.write('users', updatedUsers);
      console.log('✅ Local JSON Seeding completed.');
    }

    // Seed equipment locally if count < 12 or units are missing
    const fileEq = localDb.read('equipment');
    if (fileEq.length < 12 || !fileEq[0] || !fileEq[0].units || fileEq[0].units.length === 0) {
      console.log("🌱 Seeding local JSON equipment database (with units fleet)...");
      const mockEq = getMockEquipment();
      const users = localDb.read('users');
      const op = users.find(u => u.role === 'Equipment Operator');
      if (op) {
        mockEq[0].assignedOperator = op._id;
        mockEq[1].assignedOperator = op._id;
      }
      localDb.write('equipment', mockEq);
      console.log('✅ Local JSON Seeding of equipment completed with units fleet.');
    }
  }
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log('🔌 Connected to MongoDB successfully.');
  } catch (err) {
    console.error('⚠️ MongoDB connection failed. Falling back to local file-based database schema layer.', err.message);
    isConnected = false;
  }
  await seedDemoData();
}

export function isDbConnected() {
  return isConnected;
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['Farmer', 'Equipment Operator', 'Equipmaintance', 'Staff', 'Officer'], required: true },
  mobile: String,
  district: String,
  address: String,
  cooperativeHub: String,
  farmerId: String,
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Unit Sub-schema for individual equipment tracking
const unitSchema = new mongoose.Schema({
  unitNum: { type: Number, required: true },
  serial: { type: String, required: true },
  hours: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Reserved', 'In Use', 'Rented', 'Under Maintenance'], default: 'Available' }
});

// Equipment Schema
const equipmentSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: String,
  model: String,
  purchaseDate: Date,
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Available', 'Reserved', 'In Use', 'Under Inspection', 'Under Maintenance'], default: 'Available' },
  totalUsageHours: { type: Number, default: 0 },
  totalUnits: { type: Number, default: 15 },
  units: [unitSchema],
  rentalRate: { type: Number, required: true },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  imageUrl: String,
  qrCode: String,
  cooperativeHub: String,
  createdAt: { type: Date, default: Date.now }
});

export const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  unitNum: { type: Number },
  startDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  endDate: { type: Date, required: true },
  rentalRate: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Issued', 'Returned', 'Cancelled'], default: 'Pending' },
  penalty: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  unitNum: { type: Number },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: Date,
  endTime: Date,
  fuelUsed: { type: Number, default: 0 },
  workingHours: { type: Number, default: 0 },
  remarks: String,
  beforeImage: String,
  afterImage: String,
  status: { type: String, enum: ['Assigned', 'Started', 'Completed', 'Cancelled'], default: 'Assigned' },
  createdAt: { type: Date, default: Date.now }
});

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid'], default: 'Paid' },
  createdAt: { type: Date, default: Date.now }
});

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

// Maintenance Schema
const maintenanceSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  serviceDate: { type: Date, default: Date.now },
  description: String,
  partsChanged: String,
  cost: { type: Number, default: 0 },
  nextServiceDate: Date,
  createdAt: { type: Date, default: Date.now }
});

export const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);

// AuditLog Schema
const auditLogSchema = new mongoose.Schema({
  user: String,
  role: String,
  action: { type: String, required: true },
  oldValue: String,
  newValue: String,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  device: String,
  description: String
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: String,
  createdAt: { type: Date, default: Date.now }
});

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// Memory fallback layer implementation
const DATA_DIR = path.resolve('backend/data/db');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const localDb = {
  read(collection) {
    const file = path.join(DATA_DIR, `${collection}.json`);
    if (!fs.existsSync(file)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return [];
    }
  },
  write(collection, data) {
    const file = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  }
};

// Log action helper
export async function logAudit(req, user, action, oldValue = '', newValue = '', description = '') {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM';
  const device = req ? req.headers['user-agent'] : 'SYSTEM';
  const uName = user ? (user.name || user.email) : 'SYSTEM';
  const uRole = user ? user.role : 'SYSTEM';

  if (isConnected) {
    try {
      await AuditLog.create({
        user: uName,
        role: uRole,
        action,
        oldValue: String(oldValue),
        newValue: String(newValue),
        ipAddress: ip,
        device,
        description
      });
    } catch (err) {
      console.error('Audit logging failed in DB', err);
    }
  } else {
    const logs = localDb.read('auditlogs');
    logs.push({
      id: 'AUD-' + Date.now() + Math.random().toString(36).substr(2, 5),
      user: uName,
      role: uRole,
      action,
      oldValue: String(oldValue),
      newValue: String(newValue),
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      device,
      description
    });
    localDb.write('auditlogs', logs);
  }
}
