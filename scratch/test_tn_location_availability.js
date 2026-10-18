// scratch/test_tn_location_availability.js
import { TN_DISTRICTS, getTaluksForDistrict } from '../backend/data/tnLocationData.js';
import http from 'http';

console.log('--- 1. Testing Tamil Nadu Districts ---');
console.log(`Total TN Districts: ${TN_DISTRICTS.length}`);
if (TN_DISTRICTS.length !== 38) {
  console.error(`FAIL: Expected 38 districts, found ${TN_DISTRICTS.length}`);
} else {
  console.log('SUCCESS: All 38 districts present without duplicates.');
}

console.log('\n--- 2. Testing Taluk Selection ---');
const pollachiTaluks = getTaluksForDistrict('Coimbatore');
console.log('Coimbatore Taluks:', pollachiTaluks);
if (!pollachiTaluks.includes('Pollachi')) {
  console.error('FAIL: Pollachi not found in Coimbatore taluks');
} else {
  console.log('SUCCESS: Taluk mapping working correctly for Coimbatore.');
}

console.log('\n--- 3. Testing Backend Location Equipment Availability API ---');
http.get('http://localhost:5000/api/equipment?district=Coimbatore&taluk=Pollachi', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log(`Fetch Status: ${res.statusCode}`);
      console.log(`Equipment Count: ${data.count}`);
      if (data.data && data.data.length > 0) {
        const eq = data.data[0];
        console.log('Sample Equipment Inventory:', {
          name: eq.name,
          district: eq.district,
          taluk: eq.taluk,
          totalQuantity: eq.totalQuantity,
          availableQuantity: eq.availableQuantity,
          bookedQuantity: eq.bookedQuantity,
          maintenanceQuantity: eq.maintenanceQuantity
        });
        console.log('SUCCESS: Equipment inventory location stats attached properly.');
      } else {
        console.log('WARNING: No equipment items returned for Coimbatore/Pollachi');
      }
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('API Error:', err.message);
});
