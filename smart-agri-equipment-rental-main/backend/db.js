// backend/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirent';

let isConnected = false;

import bcrypt from 'bcryptjs';
import { TN_TALUKS_MAP } from './data/tnLocationData.js';

function getMockEquipment() {
  const baseEq = [
    {
      _id: '65d1b716f9f30b2cd8133501',
      id: 'eq-1',
      name: 'Mahindra Tractor 575 DI',
      regNumber: 'TN-37-AT-8821',
      category: 'Tractor',
      brand: 'Mahindra',
      model: 'Arjun Ultra',
      purchaseDate: '2025-01-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 12,
      totalUnits: 25,
      rentalRate: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-AT-8821',
      cooperativeHub: 'Pollachi Cooperative Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133502',
      id: 'eq-2',
      name: 'John Deere Combine Harvester 5050',
      regNumber: 'TN-37-RT-5510',
      category: 'Harvester',
      brand: 'John Deere',
      model: 'GreenSystem',
      purchaseDate: '2025-03-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 5,
      totalUnits: 25,
      rentalRate: 2800,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-RT-5510',
      cooperativeHub: 'Pollachi Cooperative Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133503',
      id: 'eq-3',
      name: 'Sonalika Rotavator 7 Feet',
      regNumber: 'TN-37-CL-4411',
      category: 'Rotavator',
      brand: 'Sonalika',
      model: 'ProTillage',
      purchaseDate: '2025-02-18',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1900,
      imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb28c?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-CL-4411',
      cooperativeHub: 'Pollachi Cooperative Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133504',
      id: 'eq-4',
      name: 'Dasmesh Multi-Crop Thresher 912',
      regNumber: 'TN-37-TH-2212',
      category: 'Thresher',
      brand: 'Dasmesh',
      model: 'PowerThresh 912',
      purchaseDate: '2025-04-05',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-TH-2212',
      cooperativeHub: 'Pollachi Cooperative Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133505',
      id: 'eq-5',
      name: 'Landforce Zero Till Seed Drill',
      regNumber: 'TN-33-SD-7711',
      category: 'Seed Drill',
      brand: 'Landforce',
      model: 'ZeroTill-X',
      purchaseDate: '2025-05-12',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-33-SD-7711',
      cooperativeHub: 'Perundurai Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133506',
      id: 'eq-6',
      name: 'Sonalika Heavy Duty Cultivator',
      regNumber: 'TN-33-CV-3311',
      category: 'Cultivator',
      brand: 'Sonalika',
      model: 'Cultivator-X',
      purchaseDate: '2025-05-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1850,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-33-CV-3311',
      cooperativeHub: 'Perundurai Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133507',
      id: 'eq-7',
      name: 'Bhavani Power Weeder',
      regNumber: 'TN-33-PW-1122',
      category: 'Cultivator',
      brand: 'Bhavani',
      model: 'PowerWeed-X',
      purchaseDate: '2025-06-01',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-33-PW-1122',
      cooperativeHub: 'Bhavani Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133508',
      id: 'eq-8',
      name: 'Gobi Heavy Subsoiler Plough',
      regNumber: 'TN-33-SS-4455',
      category: 'Cultivator',
      brand: 'GobiAgri',
      model: 'Subsoil-Heavy',
      purchaseDate: '2025-06-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-33-SS-4455',
      cooperativeHub: 'Gobichettipalayam Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133509',
      id: 'eq-9',
      name: 'Crop Sprayer Max Pro',
      regNumber: 'TN-37-SP-9911',
      category: 'Sprayer',
      brand: 'Mahindra',
      model: 'Sprayer-X',
      purchaseDate: '2025-06-12',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-SP-9911',
      cooperativeHub: 'Anaimalai Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350a',
      id: 'eq-10',
      name: 'Annur Automatic Paddy Planter',
      regNumber: 'TN-37-PP-2233',
      category: 'Seed Drill',
      brand: 'Kubota',
      model: 'PaddyPlanter-6',
      purchaseDate: '2025-06-20',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-PP-2233',
      cooperativeHub: 'Annur Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350b',
      id: 'eq-11',
      name: 'Mettupalayam Farm Excavator',
      regNumber: 'TN-37-EX-8899',
      category: 'Tractor',
      brand: 'JCB',
      model: 'AgriMaster-3',
      purchaseDate: '2025-06-28',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2900,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-37-EX-8899',
      cooperativeHub: 'Mettupalayam Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350c',
      id: 'eq-12',
      name: 'Power Tiller Heavy Duty',
      regNumber: 'TN-58-PT-4411',
      category: 'Power Tiller',
      brand: 'Honda',
      model: 'Tiller-X',
      purchaseDate: '2025-06-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-58-PT-4411',
      cooperativeHub: 'Melur Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350d',
      id: 'eq-13',
      name: 'Vadipatti Cotton Picker Machine',
      regNumber: 'TN-58-CP-6677',
      category: 'Harvester',
      brand: 'John Deere',
      model: 'CottonPick-2',
      purchaseDate: '2025-07-01',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2750,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-58-CP-6677',
      cooperativeHub: 'Vadipatti Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350e',
      id: 'eq-14',
      name: 'Usilampatti Heavy Disc Plough',
      regNumber: 'TN-58-DP-1122',
      category: 'Cultivator',
      brand: 'Lemken',
      model: 'DiscPlough-4',
      purchaseDate: '2025-07-05',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2050,
      imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb28c?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-58-DP-1122',
      cooperativeHub: 'Usilampatti Hub'
    },
    {
      _id: '65d1b716f9f30b2cd813350f',
      id: 'eq-15',
      name: 'Madurai Straw Harvester & Baler',
      regNumber: 'TN-58-SH-9900',
      category: 'Harvester',
      brand: 'New Holland',
      model: 'StrawBaler-X',
      purchaseDate: '2025-07-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2600,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-58-SH-9900',
      cooperativeHub: 'Madurai East Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133510',
      id: 'eq-16',
      name: 'Laser Land Leveler Trimble',
      regNumber: 'TN-45-LL-1122',
      category: 'Cultivator',
      brand: 'Trimble',
      model: 'LaserLand-1',
      purchaseDate: '2025-07-01',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-45-LL-1122',
      cooperativeHub: 'Lalgudi Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133511',
      id: 'eq-17',
      name: 'Srirangam Paddy Combine Harvester',
      regNumber: 'TN-45-PH-3344',
      category: 'Harvester',
      brand: 'CLAAS',
      model: 'PaddyCrop-7',
      purchaseDate: '2025-07-12',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-45-PH-3344',
      cooperativeHub: 'Srirangam Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133512',
      id: 'eq-18',
      name: 'Musiri Sugarcane Harvester',
      regNumber: 'TN-45-SH-5566',
      category: 'Harvester',
      brand: 'Case IH',
      model: 'CaneCut-9',
      purchaseDate: '2025-07-15',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 3300,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-45-SH-5566',
      cooperativeHub: 'Musiri Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133513',
      id: 'eq-19',
      name: 'Happy Seeder Kalgidhar',
      regNumber: 'TN-27-HS-3344',
      category: 'Seed Drill',
      brand: 'Kalgidhar',
      model: 'HappySeed-2',
      purchaseDate: '2025-07-10',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-27-HS-3344',
      cooperativeHub: 'Attur Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133514',
      id: 'eq-20',
      name: 'Mettur Hydraulic Mouldboard Plough',
      regNumber: 'TN-27-MP-7788',
      category: 'Cultivator',
      brand: 'Fieldking',
      model: 'HydraulicPlough-3',
      purchaseDate: '2025-07-18',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 1950,
      imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb28c?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-27-MP-7788',
      cooperativeHub: 'Mettur Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133515',
      id: 'eq-21',
      name: 'Omalur Heavy Duty Rotary Tiller',
      regNumber: 'TN-27-RT-1122',
      category: 'Rotavator',
      brand: 'Shaktiman',
      model: 'RotaryMaster-X',
      purchaseDate: '2025-07-22',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2000,
      imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb28c?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-27-RT-1122',
      cooperativeHub: 'Omalur Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133516',
      id: 'eq-22',
      name: 'Straw Baler New Holland',
      regNumber: 'TN-39-SB-5566',
      category: 'Tractor',
      brand: 'New Holland',
      model: 'Baler-3',
      purchaseDate: '2025-07-20',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-39-SB-5566',
      cooperativeHub: 'Avinashi Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133517',
      id: 'eq-23',
      name: 'Dharapuram Crop Reaper Harvester',
      regNumber: 'TN-39-CR-7788',
      category: 'Harvester',
      brand: 'Stihl',
      model: 'Reaper-4',
      purchaseDate: '2025-07-25',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2250,
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-39-CR-7788',
      cooperativeHub: 'Dharapuram Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133518',
      id: 'eq-24',
      name: 'Kangeyam Coconut Shredder Machine',
      regNumber: 'TN-39-CS-9900',
      category: 'Thresher',
      brand: 'VST Shakti',
      model: 'Shredder-Pro',
      purchaseDate: '2025-07-28',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2150,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-39-CS-9900',
      cooperativeHub: 'Kangeyam Hub'
    },
    {
      _id: '65d1b716f9f30b2cd8133519',
      id: 'eq-25',
      name: 'Udumalaipettai 4WD Heavy Tractor',
      regNumber: 'TN-39-TR-4433',
      category: 'Tractor',
      brand: 'Swaraj',
      model: '855 FE 4WD',
      purchaseDate: '2025-08-01',
      assignedOperator: null,
      status: 'Available',
      totalUsageHours: 0,
      totalUnits: 25,
      rentalRate: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      qrCode: 'AGRIRENT-QR-TN-39-TR-4433',
      cooperativeHub: 'Udumalaipettai Hub'
    }
  ];

  const locationSpecs = [];
  Object.entries(TN_TALUKS_MAP).forEach(([district, taluks]) => {
    taluks.forEach(taluk => {
      locationSpecs.push({ district, taluk, total: 24, avail: 20, res: 2, maint: 2 });
      locationSpecs.push({ district, taluk, total: 25, avail: 20, res: 3, maint: 2 });
    });
  });

  return locationSpecs.map((spec, index) => {
    const eq = baseEq[index % baseEq.length];
    const totalCount = spec.total;

    const units = Array.from({ length: totalCount }, (_, idx) => {
      const unitNum = idx + 1;
      return {
        unitNum,
        serial: `TN-${String((index % 80) + 10).padStart(2, '0')}-EQ-${String(index + 1).padStart(3, '0')}-${String(unitNum).padStart(2, '0')}`,
        hours: unitNum * 12,
        status: 'Available'
      };
    });

    const availCount = totalCount;
    const bookedCount = 0;
    const maintCount = 0;

    const eqIdNum = index + 1;
    const hexId = (1700000000000 + eqIdNum).toString(16).padStart(24, '0');

    return {
      ...eq,
      _id: hexId,
      id: `eq-${eqIdNum}`,
      name: `${spec.taluk} ${eq.name}`,
      regNumber: `TN-${String((index % 80) + 10).padStart(2, '0')}-EQ-${String(index + 1).padStart(4, '0')}`,
      district: spec.district,
      taluk: spec.taluk,
      cooperativeHub: `${spec.taluk} Hub`,
      location: `${spec.taluk}, ${spec.district}`,
      totalUnits: totalCount,
      totalQuantity: totalCount,
      availableQuantity: availCount,
      bookedQuantity: bookedCount,
      maintenanceQuantity: maintCount,
      units,
      totalUsageHours: Math.round(units.reduce((sum, u) => sum + u.hours, 0) / totalCount * 10) / 10
    };
  });
}

function getAllTalukOperators() {
  const operators = [
    { name: 'Vikram Operator', email: 'operator@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543212', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Rajesh Operator', email: 'rajesh@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543220', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Ramesh Operator', email: 'ramesh@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543221', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Suresh Operator', email: 'suresh@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543222', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Ganesh Operator', email: 'ganesh@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543223', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Karthik Operator', email: 'karthik@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543224', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Murugan Operator', email: 'murugan@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543225', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Siva Operator', email: 'siva@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543226', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Hari Operator', email: 'hari@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543227', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Arjun Operator', email: 'arjun@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543228', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Vijay Operator', email: 'vijay@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543229', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'Kannan Operator', email: 'kannan@agrirent.gov', password: 'AgriRentGov#Secure2026!Operator', role: 'Equipment Operator', mobile: '9876543230', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true }
  ];

  const existingPollachiEmails = new Set(operators.map(o => o.email));

  let globalCounter = 1000;
  Object.entries(TN_TALUKS_MAP).forEach(([district, taluks]) => {
    taluks.forEach(taluk => {
      const talukSlug = taluk.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isPollachi = taluk.toLowerCase() === 'pollachi';
      const countNeeded = isPollachi ? 0 : 12;

      for (let i = 1; i <= countNeeded; i++) {
        const email = `op.${talukSlug}.${i}@agrirent.gov`;
        if (!existingPollachiEmails.has(email)) {
          globalCounter++;
          operators.push({
            name: `${taluk} Operator ${i}`,
            email,
            password: 'AgriRentGov#Secure2026!Operator',
            role: 'Equipment Operator',
            mobile: `98765${String(globalCounter).padStart(5, '0')}`,
            district,
            taluk,
            cooperativeHub: `${taluk} Hub`,
            isApproved: true,
            status: 'Active'
          });
        }
      }
    });
  });

  return operators;
}

function getDistrictStaffUsers() {
  const staffList = [
    { name: 'Coimbatore District Staff', email: 'staff@agrirent.gov', password: 'AgriRentGov#Secure2026!Staff', role: 'Staff', mobile: '9876543214', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Coimbatore District Central Hub', isApproved: true }
  ];
  let mobileCounter = 9876580000;
  Object.keys(TN_TALUKS_MAP).forEach((district) => {
    const districtSlug = district.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `staff.${districtSlug}@agrirent.gov`;
    if (!staffList.some(s => s.email === email)) {
      mobileCounter++;
      const firstTaluk = TN_TALUKS_MAP[district]?.[0] || 'Central';
      staffList.push({
        name: `${district} Cooperative Staff`,
        email,
        password: 'AgriRentGov#Secure2026!Staff',
        role: 'Staff',
        mobile: String(mobileCounter),
        district,
        taluk: firstTaluk,
        cooperativeHub: `${district} District Central Hub`,
        isApproved: true
      });
    }
  });
  return staffList;
}

export async function seedDemoData() {
  const allTalukOperators = getAllTalukOperators();
  const districtStaffUsers = getDistrictStaffUsers();
  const otherDemoUsers = [
    { name: 'Maintenance Tech', email: 'maint@agrirent.gov', password: 'AgriRentGov#Secure2026!Maint', role: 'Equipmaintance', mobile: '9876543213', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true },
    { name: 'State Government Auditor', email: 'officer@agrirent.gov', password: 'AgriRentGov#Secure2026!Officer', role: 'Officer', mobile: '9876543215', district: 'Coimbatore', taluk: 'Pollachi', cooperativeHub: 'Pollachi Hub', isApproved: true }
  ];
  const demoUsers = [...allTalukOperators, ...districtStaffUsers, ...otherDemoUsers];

  if (isConnected) {
    try {
      console.log(`🌱 Bulk seeding ${demoUsers.length} users (12 operators per taluk)...`);
      const hashedOpPassword = await bcrypt.hash('AgriRentGov#Secure2026!Operator', 10);
      const hashedMaintPassword = await bcrypt.hash('AgriRentGov#Secure2026!Maint', 10);
      const hashedStaffPassword = await bcrypt.hash('AgriRentGov#Secure2026!Staff', 10);
      const hashedOfficerPassword = await bcrypt.hash('AgriRentGov#Secure2026!Officer', 10);

      const bulkOps = demoUsers.map(u => {
        let pass = hashedOpPassword;
        if (u.role === 'Equipmaintance') pass = hashedMaintPassword;
        if (u.role === 'Staff') pass = hashedStaffPassword;
        if (u.role === 'Officer') pass = hashedOfficerPassword;

        return {
          updateOne: {
            filter: { email: u.email },
            update: { $set: { ...u, password: pass } },
            upsert: true
          }
        };
      });

      await User.bulkWrite(bulkOps);
      console.log(`✅ MongoDB User Seeding completed for ${demoUsers.length} accounts.`);

      const eqCount = await Equipment.countDocuments();
      const eqWithUnits = await Equipment.countDocuments({ units: { $exists: true, $not: { $size: 0 } } });
      const outOfBounds = await Equipment.countDocuments({ $or: [{ rentalRate: { $lt: 1800 } }, { rentalRate: { $gt: 3500 } }] });
      const eqWithoutLocation = await Equipment.countDocuments({ district: { $exists: false } });
      if (eqCount < 100 || eqWithUnits < eqCount || outOfBounds > 0 || eqWithoutLocation > 0) {
        console.log("🌱 Seeding MongoDB equipment database (with statewide taluk units fleet)...");
        await Equipment.deleteMany({});
        const mockEq = getMockEquipment();
        const opUsers = await User.find({ role: { $in: ['Equipment Operator', 'Operator'] } });
        if (opUsers.length > 0) {
          mockEq.forEach(eq => {
            const talukOps = opUsers.filter(op => 
              (op.taluk && op.taluk.toLowerCase() === (eq.taluk || '').toLowerCase()) ||
              (op.cooperativeHub && op.cooperativeHub.toLowerCase().includes((eq.taluk || '').toLowerCase()))
            );
            const activePool = talukOps.length > 0 ? talukOps : opUsers;

            if (eq.units && Array.isArray(eq.units)) {
              eq.units.forEach((u, uIdx) => {
                const assignedOp = activePool[uIdx % activePool.length];
                u.assignedOperator = assignedOp._id;
              });
            }
            eq.assignedOperator = activePool[0]._id;
          });
        }
        await Equipment.insertMany(mockEq);
        console.log("✅ MongoDB Equipment Seeding completed with taluk-matched operator assignments per unit.");
      }

      // Ensure all existing equipment units have 1 assigned operator per unit matching their taluk
      const opUsersAll = await User.find({ role: { $in: ['Equipment Operator', 'Operator'] } });
      if (opUsersAll.length > 0) {
        const allEquip = await Equipment.find();
        for (const eqDoc of allEquip) {
          let updated = false;
          const talukOps = opUsersAll.filter(op => 
            (op.taluk && op.taluk.toLowerCase() === (eqDoc.taluk || '').toLowerCase()) ||
            (op.cooperativeHub && op.cooperativeHub.toLowerCase().includes((eqDoc.taluk || '').toLowerCase()))
          );
          const activePool = talukOps.length > 0 ? talukOps : opUsersAll;

          if (eqDoc.units && eqDoc.units.length > 0) {
            eqDoc.units.forEach((u, uIdx) => {
              if (!u.assignedOperator) {
                u.assignedOperator = activePool[uIdx % activePool.length]._id;
                updated = true;
              }
            });
          }
          if (updated) {
            await eqDoc.save();
          }
        }
      }
    } catch (err) {
      console.error('Error seeding DB users:', err);
    }
  }

  // Local memory file seeding (always runs to ensure local fallback files are in sync)
  try {
    const fileUsers = localDb.read('users') || [];
    const hashedOpPassword = await bcrypt.hash('AgriRentGov#Secure2026!Operator', 10);
    const hashedMaintPassword = await bcrypt.hash('AgriRentGov#Secure2026!Maint', 10);
    const hashedStaffPassword = await bcrypt.hash('AgriRentGov#Secure2026!Staff', 10);
    const hashedOfficerPassword = await bcrypt.hash('AgriRentGov#Secure2026!Officer', 10);

    const userMap = new Map(fileUsers.map(u => [u.email, u]));
    let modified = false;

    for (const u of demoUsers) {
      let pass = hashedOpPassword;
      if (u.role === 'Equipmaintance') pass = hashedMaintPassword;
      if (u.role === 'Staff') pass = hashedStaffPassword;
      if (u.role === 'Officer') pass = hashedOfficerPassword;

      if (userMap.has(u.email)) {
        const existing = userMap.get(u.email);
        existing.password = pass;
        existing.role = u.role;
        existing.district = u.district;
        existing.taluk = u.taluk;
        existing.cooperativeHub = u.cooperativeHub;
        existing.isApproved = true;
        modified = true;
      } else {
        userMap.set(u.email, {
          _id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
          ...u,
          password: pass,
          createdAt: new Date().toISOString()
        });
        modified = true;
      }
    }

    if (modified) {
      localDb.write('users', Array.from(userMap.values()));
      console.log('✅ Local JSON Seeding completed for demo users with correct role passwords.');
    }
  } catch (lErr) {
    console.error('Error in local seeding:', lErr);
  }

    // Seed equipment locally if count < 100 or units are missing or rates out of range
    const fileEq = localDb.read('equipment') || [];
    const outOfBoundsLocal = fileEq.some(e => e.rentalRate < 1800 || e.rentalRate > 3500);
    if (fileEq.length < 100 || !fileEq[0] || !fileEq[0].units || fileEq[0].units.length === 0 || outOfBoundsLocal) {
      console.log("🌱 Seeding local JSON equipment database (with statewide taluk units fleet)...");
      const mockEq = getMockEquipment();
      const users = localDb.read('users');
      const opUsers = users.filter(u => u.role === 'Equipment Operator');
      const farmer = users.find(u => u.role === 'Farmer');

      if (opUsers.length > 0) {
        mockEq.forEach(eq => {
          if (eq.units && Array.isArray(eq.units)) {
            eq.units.forEach((u, uIdx) => {
              const assignedOp = opUsers[uIdx % opUsers.length];
              u.assignedOperator = assignedOp._id || assignedOp.id;
            });
          }
          eq.assignedOperator = opUsers[0]._id || opUsers[0].id;
        });
        mockEq[0].status = 'In Use';
      }
      localDb.write('equipment', mockEq);
      console.log('✅ Local JSON Seeding of equipment completed with units fleet.');

      // Also seed a mock booking and job so the operator has something to see
      const op = opUsers[0];
      if (op && farmer) {
        const bookings = localDb.read('bookings') || [];
        const jobs = localDb.read('jobs') || [];

        if (jobs.length === 0) {
          console.log("🌱 Seeding local JSON mock job for operator...");
          const bookingId = 'BKG-' + Math.floor(1000 + Math.random() * 9000);
          const jobId = 'JOB-' + Math.floor(1000 + Math.random() * 9000);

          bookings.push({
            _id: bookingId,
            farmer: farmer._id,
            equipment: mockEq[0]._id || mockEq[0].id,
            startDate: new Date().toISOString(),
            durationDays: 2,
            totalCost: 5000,
            status: 'Approved',
            paymentStatus: 'Unpaid',
            createdAt: new Date().toISOString()
          });

          jobs.push({
            _id: jobId,
            booking: bookingId,
            operator: op._id,
            equipment: mockEq[0]._id || mockEq[0].id,
            farmer: farmer._id,
            status: 'Assigned',
            workLocation: farmer.farmAddress || 'Ludhiana North Fields',
            assignedDate: new Date().toISOString()
          });

          localDb.write('bookings', bookings);
          localDb.write('jobs', jobs);
          console.log('✅ Local JSON Seeding of mock job completed.');
        }
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
  taluk: String,
  address: String,
  cooperativeHub: String,
  farmerId: String,
  isApproved: { type: Boolean, default: true },
  isRejected: { type: Boolean, default: false },
  verificationStatus: { type: String, default: 'PENDING_VERIFICATION' },
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Unit Sub-schema for individual equipment tracking
const unitSchema = new mongoose.Schema({
  unitNum: { type: Number, required: true },
  serial: { type: String, required: true },
  hours: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Reserved', 'In Use', 'Rented', 'Under Maintenance'], default: 'Available' },
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Equipment Schema
const equipmentSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: String,
  model: String,
  purchaseDate: Date,
  district: { type: String, default: 'Coimbatore' },
  taluk: { type: String, default: 'Pollachi' },
  totalQuantity: { type: Number, default: 5 },
  availableQuantity: { type: Number, default: 3 },
  bookedQuantity: { type: Number, default: 1 },
  maintenanceQuantity: { type: Number, default: 1 },
  assignedOperator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Available', 'Reserved', 'In Use', 'Under Inspection', 'Under Maintenance', 'Maintenance Required', 'Awaiting Maintenance Approval'], default: 'Available' },
  totalUsageHours: { type: Number, default: 0 },
  currentCycleHours: { type: Number, default: 0 },
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
  tentativeBill: { type: mongoose.Schema.Types.Mixed },
  finalBill: { type: mongoose.Schema.Types.Mixed },
  isFinalBilled: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Overdue'], default: 'Unpaid' },
  dueDate: Date,
  lateFine: { type: Number, default: 0 },
  paidAt: Date,
  paidByStaff: String,
  paymentMethod: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Issued', 'Returned', 'Cancelled'], default: 'Pending' },
  penalty: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  jobId: String,
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  unitNum: { type: Number },
  equipmentUnitId: String,
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hubId: String,

  scheduledDate: Date,
  scheduledTime: String,
  expectedDuration: String,

  assignmentType: { type: String, enum: ['AUTOMATIC_ROTATION', 'MANUAL_REASSIGNMENT'], default: 'AUTOMATIC_ROTATION' },
  assignmentStatus: { type: String, default: 'ASSIGNED' },

  status: { 
    type: String, 
    enum: [
      'ASSIGNED', 'ACCEPTED', 'REJECTED', 'PRECHECK', 'READY', 
      'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'SUBMITTED', 
      'CORRECTION_REQUIRED', 'STAFF_VERIFIED', 'FINALIZED', 'EQUIPMENT_FAILURE', 
      'CANCELLATION_REQUESTED', 'CANCELLATION_REJECTED', 'CANCELLATION_APPROVED', 
      'MANUAL_REASSIGNMENT_REQUIRED', 'MANUALLY_REASSIGNED', 
      'Cancelled', 'Assigned', 'Started', 'Completed'
    ], 
    default: 'ASSIGNED' 
  },

  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  rejectionNote: String,

  cancellationRequested: { type: Boolean, default: false },
  cancellationReason: String,
  cancellationNote: String,
  cancellationRequestedAt: Date,

  cancellationDecision: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'Approved', 'Rejected', 'Pending'], default: 'PENDING' },
  cancellationDecisionBy: String,
  cancellationDecisionAt: Date,
  cancellationDecisionReason: String,

  preCheckCompleted: { type: Boolean, default: false },
  preCheckItems: { type: mongoose.Schema.Types.Mixed },
  preCheckObservation: String,

  startEngineHours: { type: Number, default: 0 },
  startFuelLevel: { type: Number, default: 0 },
  beforeImage: String,
  beforeImageUploadedAt: Date,

  startTime: Date,
  startedAt: Date,

  pauseHistory: [{
    pauseTime: Date,
    resumeTime: Date,
    pauseReason: String
  }],

  workType: String,
  areaCovered: String,
  actualWorkingHours: { type: Number, default: 0 },

  endEngineHours: { type: Number, default: 0 },
  fuelAdded: { type: Number, default: 0 },
  endFuelLevel: { type: Number, default: 0 },

  endTime: Date,
  fuelUsed: { type: Number, default: 0 },
  fuelType: { type: String, default: 'Diesel' },
  workingHours: { type: Number, default: 0 },

  afterImage: String,
  afterImageUploadedAt: Date,

  remarks: String,
  operatorNotes: String,
  workCompleted: String,
  fieldLocation: String,
  equipmentCondition: String,
  damageInfo: String,
  photos: [String],

  submittedAt: Date,

  staffVerificationStatus: { type: String, enum: ['Pending', 'Approved', 'Correction Required'], default: 'Pending' },
  staffVerifiedAt: Date,
  staffVerificationNote: String,
  correctionReason: String,

  equipmentIssue: {
    issueType: String,
    description: String,
    photo: String,
    reportedAt: Date
  },

  completedAt: Date,
  finalizedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

// Assignment History Schema
const assignmentHistorySchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobId: { type: mongoose.Schema.Types.Mixed },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  operatorId: { type: mongoose.Schema.Types.Mixed },
  operatorName: String,
  assignmentType: { type: String, enum: ['AUTOMATIC_ROTATION', 'MANUAL_REASSIGNMENT'], default: 'AUTOMATIC_ROTATION' },
  assignedBy: { type: String, default: 'SYSTEM' },
  assignedAt: { type: Date, default: Date.now },
  unassignedAt: Date,
  reason: String,
  cancellationRequested: { type: Boolean, default: false },
  cancellationReason: String,
  cancellationNote: String,
  cancellationDecision: { type: String, enum: ['APPROVED', 'REJECTED', 'PENDING', 'Approved', 'Rejected'], default: 'PENDING' },
  decisionBy: String,
  decisionAt: Date,
  decisionReason: String
});

export const AssignmentHistory = mongoose.models.AssignmentHistory || mongoose.model('AssignmentHistory', assignmentHistorySchema);


// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  isTentative: { type: Boolean, default: true },
  billingStatus: { type: String, enum: ['Tentative', 'Final Billed'], default: 'Tentative' },
  tentativeAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  estimatedFuelCost: { type: Number, default: 0 },
  estimatedFuelLiters: { type: Number, default: 0 },
  actualFuelCost: { type: Number, default: 0 },
  actualFuelLiters: { type: Number, default: 0 },
  fuelType: { type: String, default: 'Diesel' },
  fuelPricePerLiter: { type: Number, default: 95 },
  fuelAdjustment: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Overdue'], default: 'Unpaid' },
  dueDate: Date,
  lateFine: { type: Number, default: 0 },
  paidAt: Date,
  paidByStaff: String,
  paymentMethod: String,
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
  createdAt: { type: Date, default: Date.now },
  problemDescription: String,
  workPerformed: String,
  partsReplaced: String,
  partsCost: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  specialist: String,
  remarks: String,
  photos: [String],
  status: { type: String, enum: ['Pending', 'Completed', 'Approved', 'Rejected'], default: 'Pending' },
  previousUsageHours: Number,
  maintenanceReason: String
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
  equipmentRating: { type: Number, min: 1, max: 5 },
  serviceRating: { type: Number, min: 1, max: 5 },
  operatorFeedback: String,
  createdAt: { type: Date, default: Date.now }
});

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);


// Memory fallback layer implementation
const DATA_DIR = path.resolve(__dirname, 'data/db');
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
