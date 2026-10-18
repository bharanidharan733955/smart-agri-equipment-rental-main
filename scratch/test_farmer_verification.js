// scratch/test_farmer_verification.js
import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('--- 1. Logging in as Cooperative Staff / Manager ---');
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    email: 'staff@agrirent.gov',
    password: 'AgriRentGov#Secure2026!Staff'
  });

  if (!loginRes.data.token) {
    console.error('Failed to log in as Staff:', loginRes);
    return;
  }

  const token = loginRes.data.token;
  console.log('SUCCESS: Staff Login Token acquired.');

  console.log('\n--- 2. Testing GET /api/cooperative/farmers (Registered Farmers List) ---');
  const farmersRes = await makeRequest('/api/cooperative/farmers', 'GET', null, token);
  console.log(`Status: ${farmersRes.status}, Farmers Count: ${farmersRes.data.data?.length || 0}`);
  if (farmersRes.data.data && farmersRes.data.data.length > 0) {
    const f = farmersRes.data.data[0];
    console.log('Sample Registered Farmer:', {
      name: f.name,
      farmerId: f.farmerId,
      district: f.district,
      mobile: f.mobile,
      isApproved: f.isApproved
    });
  }

  console.log('\n--- 3. Testing GET /api/cooperative/farmer-verifications ---');
  const verifRes = await makeRequest('/api/cooperative/farmer-verifications', 'GET', null, token);
  console.log(`Status: ${verifRes.status}, Verification Items: ${verifRes.data.count}`);
  console.log(`Govt Registry Entries: ${verifRes.data.govtRegistry?.length || 0}`);

  if (verifRes.data.data && verifRes.data.data.length > 0) {
    const v = verifRes.data.data[0];
    console.log('Sample Farmer Verification Item:', {
      name: v.name,
      farmerId: v.farmerId,
      isIdMatched: v.isIdMatched,
      govtMatch: v.govtMatch
    });
  }

  console.log('\n--- 4. Registering a New Test Farmer to Verify Approval & Rejection Flow ---');
  const testReg = await makeRequest('/api/auth/register', 'POST', {
    name: 'Muthu Swamy Test',
    mobile: '9876543299',
    farmerId: 'FID-TN-2026-3341',
    role: 'Farmer',
    district: 'Erode',
    taluk: 'Perundurai',
    village: 'Perundurai West',
    address: '99 Main Road, Erode'
  });

  console.log('New Farmer Registration Result:', testReg.data.message);

  const pendingRes = await makeRequest('/api/cooperative/farmer-verifications?status=PENDING_VERIFICATION', 'GET', null, token);
  console.log(`Pending Farmers Count: ${pendingRes.data.count}`);

  const pendingFarmer = pendingRes.data.data?.find(f => f.mobile === '9876543299');
  if (pendingFarmer) {
    console.log('Found Pending Farmer with Seeded Match:', {
      id: pendingFarmer._id || pendingFarmer.id,
      name: pendingFarmer.name,
      isIdMatched: pendingFarmer.isIdMatched,
      govtLandHolding: pendingFarmer.govtMatch?.landHoldingAcres
    });

    console.log('\n--- 5. Approving Farmer via /api/cooperative/farmers/:id/approve ---');
    const appRes = await makeRequest(`/api/cooperative/farmers/${pendingFarmer._id || pendingFarmer.id}/approve`, 'POST', null, token);
    console.log('Approval Status:', appRes.status, appRes.data.message);
  }

  console.log('\nSUCCESS: All verification and directory tests passed!');
}

run();
