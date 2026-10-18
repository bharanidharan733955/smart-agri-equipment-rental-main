// backend/data/equipment.js

export const initialEquipmentData = [
  {
    id: 'eq-1',
    name: 'Tractor',
    category: 'Tractors',
    price: 800,
    unit: 'day',
    badge: 'Heavy Utility',
    tagColor: 'green',
    availableCount: 145,
    description: 'Heavy duty & compact utility tractors for field plowing, tilling, and heavy agricultural transport.',
    specs: { hp: '45-90 HP', fuel: 'Diesel / Hybrid', gps: 'Sub-meter RTK Enabled' }
  },
  {
    id: 'eq-2',
    name: 'Harvester',
    category: 'Harvesters',
    price: 800,
    unit: 'day',
    badge: 'Multi-Crop Combine',
    tagColor: 'green',
    availableCount: 42,
    description: 'Multi-crop combine harvesters equipped with grain loss sensors and automated header height controls.',
    specs: { capacity: '12 Tons/Hr', power: '120 HP', lossRate: '< 0.4%' }
  },
  {
    id: 'eq-3',
    name: 'Rotavator',
    category: 'Tillage',
    price: 800,
    unit: 'day',
    badge: 'Secondary Tillage',
    tagColor: 'green',
    availableCount: 88,
    description: 'Rotary tillers for secondary seedbed preparation, soil pulverization, and crop residue mixing.',
    specs: { blades: '36-48 Boron Steel', width: '6 Feet', pto: '540 RPM' }
  },
  {
    id: 'eq-4',
    name: 'Power Tiller',
    category: 'Tillage',
    price: 800,
    unit: 'day',
    badge: 'Walk-Behind',
    tagColor: 'green',
    availableCount: 64,
    description: 'Walk-behind tillers ideal for small land holdings, vegetable gardens, and orchard tilling.',
    specs: { power: '15 HP Diesel', gear: '6 Forward + 2 Reverse', start: 'Key Electric Start' }
  },
  {
    id: 'eq-5',
    name: 'Seed Drill',
    category: 'Sowing',
    price: 800,
    unit: 'day',
    badge: 'Precision Sowing',
    tagColor: 'green',
    availableCount: 95,
    description: 'Precision tractor-mounted seed sowing machinery for zero-tillage wheat and paddy seeding.',
    specs: { rows: '9-11 Rows', hopper: '150 Kg', depth: 'Adjustable 2-6 cm' }
  },
  {
    id: 'eq-6',
    name: 'Cultivator',
    category: 'Tillage',
    price: 800,
    unit: 'day',
    badge: 'Soil Aeration',
    tagColor: 'green',
    availableCount: 110,
    description: 'Tractor drawn soil aeration implements designed to break soil crust and remove weeds between crops.',
    specs: { tines: '9 Heavy Duty Spring Tines', frame: 'Tubular Steel', hitch: 'Category II' }
  },
  {
    id: 'eq-7',
    name: 'Sprayer',
    category: 'Protection',
    price: 800,
    unit: 'day',
    badge: 'High Pressure',
    tagColor: 'green',
    availableCount: 78,
    description: 'High pressure tractor mounted crop protection sprayers with variable rate liquid distribution nozzles.',
    specs: { tank: '600 Liters', boomWidth: '12 Meters', pressure: '40 Bar' }
  },
  {
    id: 'eq-8',
    name: 'Thresher',
    category: 'Harvesting',
    price: 800,
    unit: 'day',
    badge: 'Grain Separation',
    tagColor: 'green',
    availableCount: 55,
    description: 'High throughput multi-crop threshing machinery for clean grain separation with minimal seed damage.',
    specs: { throughput: '2.5 Tons/Hr', blower: 'Dual Centrifugal', drive: 'PTO / Motor 15HP' }
  }
];

export const initialAuditLogs = [
  {
    id: 'LOG-1001',
    timestamp: '2026-08-05T08:15:00Z',
    action: 'FARMER_RENTAL_BOOKED',
    userRole: 'Farmer',
    details: 'Aadhaar verified booking for Tractor (2 days) in Ludhiana District Hub.',
    auditHash: 'GOV-AUDIT-982104'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-08-05T08:30:00Z',
    action: 'HUB_DISPATCH_APPROVED',
    userRole: 'Cooperative Staff',
    details: 'Staff COOP-HUB-4092 approved machinery dispatch for Hub #4.',
    auditHash: 'GOV-AUDIT-441209'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-08-05T08:45:00Z',
    action: 'TELEMETRY_LOGGED',
    userRole: 'Equipment Operator',
    details: 'Operator OP-LIC-8821 logged 4.5 operating hours and GPS track.',
    auditHash: 'GOV-AUDIT-773190'
  }
];
