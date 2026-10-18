// src/data/equipmentData.js

export const EQUIPMENT_DATA = [
  {
    id: 'eq-1',
    name: 'AeroScout Pro AI Drone',
    category: 'Drones',
    badge: 'Autonomous AI',
    tagColor: 'cyan',
    pricePerDay: 120,
    pricePerWeek: 700,
    rating: 4.9,
    reviewsCount: 42,
    specs: {
      range: '15 km Range',
      battery: '45 mins Flight',
      sensors: 'Multispectral 4K'
    },
    description: 'High-altitude autonomous scouting drone equipped with multispectral imagery, plant vigor index (NDVI) mapping, and AI pest detection.',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    availableCount: 5,
    features: ['Real-time NDVI mapping', 'Obstacle avoidance', 'Automated flight paths', 'Direct cloud sync']
  },
  {
    id: 'eq-2',
    name: 'AgriRover X7 Autonomous Tractor',
    category: 'Tractors',
    badge: 'GPS + AI Steering',
    tagColor: 'emerald',
    pricePerDay: 450,
    pricePerWeek: 2700,
    rating: 4.95,
    reviewsCount: 68,
    specs: {
      power: '320 HP Electric',
      precision: 'Sub-inch RTK GPS',
      autonomy: 'Level 4 Unmanned'
    },
    description: 'Next-generation electric autonomous heavy tractor. Features RTK sub-centimeter GPS accuracy, variable rate seeding, and zero emissions.',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    availableCount: 3,
    features: ['Zero emission electric drive', 'Sub-inch RTK guidance', 'Automated tillage & seeding', 'Remote tele-operation']
  },
  {
    id: 'eq-3',
    name: 'HydroSense IoT Irrigation Hub',
    category: 'Sensors',
    badge: 'IoT Precision',
    tagColor: 'cyan',
    pricePerDay: 65,
    pricePerWeek: 380,
    rating: 4.8,
    reviewsCount: 31,
    specs: {
      coverage: '250 Acres',
      connectivity: 'LoRaWAN + 5G',
      saving: 'Up to 40% Water'
    },
    description: 'Wireless soil moisture and weather sensor network paired with automated valve controllers to maximize crop yield while conserving water.',
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
    availableCount: 12,
    features: ['Dynamic soil moisture tracking', 'Solar powered nodes', 'Automated drip valve trigger', 'Mobile app control']
  },
  {
    id: 'eq-4',
    name: 'TerraHarvest 9000 Combine',
    category: 'Harvesters',
    badge: 'Smart Yield Monitoring',
    tagColor: 'emerald',
    pricePerDay: 680,
    pricePerWeek: 4100,
    rating: 4.92,
    reviewsCount: 54,
    specs: {
      capacity: '14 Tons/Hour',
      grainLoss: '< 0.5% Loss',
      power: '540 HP Diesel Hybrid'
    },
    description: 'High-throughput combine harvester featuring AI grain quality sensors, active field loss reduction, and automated header height adjust.',
    imageUrl: 'https://images.unsplash.com/photo-1595838788640-5e3e3b1c68e0?auto=format&fit=crop&w=800&q=80',
    availableCount: 2,
    features: ['Live yield mapping', 'Auto-adjust cleaning shoe', 'Residue management', 'Climate-controlled cab']
  },
  {
    id: 'eq-5',
    name: 'PrecisionCrop Laser Weeder',
    category: 'Sensors',
    badge: 'Zero Chemical',
    tagColor: 'cyan',
    pricePerDay: 290,
    pricePerWeek: 1750,
    rating: 4.88,
    reviewsCount: 29,
    specs: {
      speed: '200k Weeds/Hr',
      accuracy: '99.2% Target',
      type: 'CO2 Laser Array'
    },
    description: 'AI-driven optical laser weeding implement that eradicates weeds targeting growth centers without disturbing soil or using chemicals.',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    availableCount: 4,
    features: ['Deep learning crop recognition', 'Sub-millimeter laser strike', 'Day/night operation', 'Organic certified compatible']
  },
  {
    id: 'eq-6',
    name: 'SkySpray Heavy Payload Drone',
    category: 'Drones',
    badge: 'Variable Rate Spraying',
    tagColor: 'emerald',
    pricePerDay: 195,
    pricePerWeek: 1150,
    rating: 4.85,
    reviewsCount: 37,
    specs: {
      payload: '50 Liter Capacity',
      rate: '40 Acres/Hour',
      nozzles: 'Centrifugal Atomizer'
    },
    description: 'Heavy duty agricultural spraying drone for targeted micro-application of fertilizers, biopesticides, and crop protection treatments.',
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    availableCount: 6,
    features: ['Radar terrain following', 'Targeted spot spraying', 'Fast battery swap', 'Zero spray drift tech']
  }
];

export const CATEGORIES = ['All', 'Drones', 'Tractors', 'Sensors', 'Harvesters'];
