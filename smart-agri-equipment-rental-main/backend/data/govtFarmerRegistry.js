// backend/data/govtFarmerRegistry.js

export const GOVT_FARMER_REGISTRY = [
  {
    govtFarmerId: '334188128812',
    officialName: 'Ravi Kumar',
    mobile: '9876543210',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Anaimalai',
    landHoldingAcres: 4.5,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '334188129914',
    officialName: 'Suresh Patel',
    mobile: '9876543211',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Perur',
    landHoldingAcres: 6.2,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '334188123341',
    officialName: 'Muthu Swamy',
    mobile: '9876543212',
    district: 'Erode',
    taluk: 'Perundurai',
    village: 'Perundurai West',
    landHoldingAcres: 3.8,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '334188127721',
    officialName: 'Kannan V',
    mobile: '9876543213',
    district: 'Madurai',
    taluk: 'Melur',
    village: 'Melur East',
    landHoldingAcres: 5.0,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '334188125510',
    officialName: 'Velu Nachiyar',
    mobile: '9876543214',
    district: 'Salem',
    taluk: 'Attur',
    village: 'Attur Central',
    landHoldingAcres: 2.5,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '334188121190',
    officialName: 'Palanisamy K',
    mobile: '9876543215',
    district: 'Tiruchirappalli',
    taluk: 'Lalgudi',
    village: 'Lalgudi Town',
    landHoldingAcres: 8.1,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  },
  {
    govtFarmerId: '123456789012',
    officialName: 'Siva Farmer',
    mobile: '9876543210',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Central Village',
    landHoldingAcres: 5.5,
    aadhaarStatus: 'VERIFIED',
    registryStatus: 'ACTIVE_GOVT_RECORD'
  }
];

export function findGovtRecord(farmerId, mobile) {
  if (!farmerId && !mobile) return null;
  return GOVT_FARMER_REGISTRY.find(r =>
    (farmerId && r.govtFarmerId.trim() === farmerId.trim()) ||
    (mobile && r.mobile === mobile.trim())
  ) || null;
}
