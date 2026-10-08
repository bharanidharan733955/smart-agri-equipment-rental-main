// frontend/src/api.js
import axios from 'axios';

// Use a relative base so requests go through the Vite proxy (no CORS preflight in dev)
// In production, point this to your deployed backend URL via an env variable.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to Inject JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrirent_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Auth API ---
export async function loginRoleApi(email, password, mobile, farmerId) {
  try {
    const payload = mobile && farmerId ? { mobile, farmerId } : { email, password };
    const res = await api.post('/auth/login', payload);
    if (res.data.success && res.data.token) {
      localStorage.setItem('agrirent_token', res.data.token);
      localStorage.setItem('agrirent_user', JSON.stringify(res.data.user));
    }
    return res.data;
  } catch (err) {
    console.error('Login error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export async function registerApi(payload) {
  try {
    const res = await api.post('/auth/register', payload);
    return res.data;
  } catch (err) {
    console.error('Registration error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export function logoutUser() {
  localStorage.removeItem('agrirent_token');
  localStorage.removeItem('agrirent_user');
}

// --- Equipment API ---
export async function fetchEquipment(category = 'All', search = '') {
  try {
    const res = await api.get('/equipment', { params: { category, search } });
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch equipment error:', err);
    return [];
  }
}

export async function fetchEquipmentDetails(id) {
  try {
    const res = await api.get(`/equipment/${id}`);
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Fetch equipment details error:', err);
    return null;
  }
}

// --- Farmer API ---
export async function fetchFarmerOverview() {
  try {
    const res = await api.get('/farmer/overview');
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Farmer overview error:', err);
    return null;
  }
}

export async function fetchFarmerBookings() {
  try {
    const res = await api.get('/rentals');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch farmer bookings error:', err);
    return [];
  }
}

export async function submitFarmerBooking(payload) {
  try {
    const res = await api.post('/rentals', payload);
    return res.data;
  } catch (err) {
    console.error('Submit booking error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export const submitRentalApi = submitFarmerBooking;
export const fetchFarmerEquipment = fetchEquipment;

export async function cancelFarmerBooking(id) {
  try {
    const res = await api.post(`/rentals/${id}/reject`); // Reject works as cancel
    return res.data;
  } catch (err) {
    console.error('Cancel booking error:', err);
    return { success: false };
  }
}

export async function submitFarmerFeedback(bookingId, rating, comments, equipmentRating, serviceRating, operatorFeedback) {
  try {
    const res = await api.post('/farmer/feedback', { bookingId, rating, comments, equipmentRating, serviceRating, operatorFeedback });
    return res.data;
  } catch (err) {
    console.error('Submit feedback error:', err);
    return { success: false };
  }
}

export async function fetchFarmerNotifications() {
  try {
    const res = await api.get('/farmer/notifications');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    const res = await api.post(`/farmer/notifications/${id}/read`);
    return res.data.success;
  } catch (err) {
    console.error('Mark notification read error:', err);
    return false;
  }
}

// Mock support for farmer complaints to prevent client side errors
export async function fetchFarmerComplaints() {
  return [];
}

export async function submitFarmerComplaint(payload) {
  return { success: true, message: 'Complaint submitted' };
}

// --- Cooperative Manager API ---
export async function fetchCoopEquipment() {
  try {
    const res = await api.get('/equipment');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch coop equipment error:', err);
    return [];
  }
}

export async function fetchCoopOperators() {
  try {
    const res = await api.get('/cooperative/operators');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch operators error:', err);
    return [];
  }
}

export async function fetchCoopFarmers() {
  try {
    const res = await api.get('/cooperative/farmers');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch farmers error:', err);
    return [];
  }
}

export async function approveFarmerApi(id) {
  try {
    const res = await api.post(`/cooperative/farmers/${id}/approve`);
    return res.data;
  } catch (err) {
    console.error('Approve farmer error:', err);
    return { success: false };
  }
}

export async function rejectFarmerApi(id, reason) {
  try {
    const res = await api.post(`/cooperative/farmers/${id}/reject`, { reason });
    return res.data;
  } catch (err) {
    console.error('Reject farmer error:', err);
    return { success: false, message: err.response?.data?.message || 'Server error' };
  }
}

export async function fetchFarmerVerifications(status = 'ALL') {
  try {
    const res = await api.get(`/cooperative/farmer-verifications?status=${status}`);
    return res.data;
  } catch (err) {
    console.error('Fetch farmer verifications error:', err);
    return { success: false, data: [], govtRegistry: [] };
  }
}

export async function addCoopEquipment(payload) {
  try {
    const res = await api.post('/equipment', payload);
    return res.data;
  } catch (err) {
    console.error('Add equipment error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function editCoopEquipment(id, payload) {
  try {
    const res = await api.put(`/equipment/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error('Edit equipment error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function assignUnitOperatorApi(equipmentId, unitNum, operatorId) {
  try {
    const res = await api.put(`/cooperative/equipment/${equipmentId}/units/${unitNum}/operator`, { operatorId });
    return res.data;
  } catch (err) {
    console.error('Assign unit operator error:', err);
    return { success: false, message: err.response?.data?.message || 'Server error' };
  }
}

export async function deleteCoopEquipment(id) {
  try {
    const res = await api.delete(`/equipment/${id}`);
    return res.data;
  } catch (err) {
    console.error('Delete equipment error:', err);
    return { success: false };
  }
}

export async function scheduleMaintenance(id, payload) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance`, payload);
    return res.data;
  } catch (err) {
    console.error('Schedule maintenance error:', err);
    return { success: false };
  }
}

export async function completeMaintenance(id) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance/complete`);
    return res.data;
  } catch (err) {
    console.error('Complete maintenance error:', err);
    return { success: false };
  }
}

export async function fetchCoopInvoices() {
  try {
    const res = await api.get('/cooperative/invoices');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch invoices error:', err);
    return [];
  }
}

export async function payInvoice(id, payload = {}) {
  try {
    const res = await api.post(`/cooperative/invoices/${id}/pay`, payload);
    return res.data;
  } catch (err) {
    console.error('Pay invoice error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function approveRentalBooking(id) {
  try {
    const res = await api.post(`/rentals/${id}/approve`);
    return res.data;
  } catch (err) {
    console.error('Approve booking error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function rejectRentalBooking(id) {
  try {
    const res = await api.post(`/rentals/${id}/reject`);
    return res.data;
  } catch (err) {
    console.error('Reject booking error:', err);
    return { success: false };
  }
}

export async function fetchCoopStats() {
  try {
    const res = await api.get('/stats'); // Repurposing general stats for coop dashboard indicators
    if (res.data.success) {
      return {
        totalEquipment: res.data.data.equipmentUtilization.total,
        availableEquipment: res.data.data.equipmentUtilization.available,
        underMaintenance: res.data.data.equipmentUtilization.maintenance,
        activeRentals: res.data.data.equipmentUtilization.inUse + res.data.data.equipmentUtilization.reserved,
        hubName: 'Ludhiana Central Hub #1'
      };
    }
    return null;
  } catch (err) {
    console.error('Fetch stats error:', err);
    return null;
  }
}

export async function updateCoopEquipmentStatus(id, status) {
  try {
    const res = await api.put(`/equipment/${id}`, { status });
    return res.data;
  } catch (err) {
    console.error('Update status error:', err);
    return { success: false };
  }
}

export async function updateCoopEquipmentCondition(id, condition) {
  try {
    const res = await api.put(`/equipment/${id}`, { condition });
    return res.data;
  } catch (err) {
    console.error('Update condition error:', err);
    return { success: false };
  }
}

export async function uploadCoopEquipmentImage(id, imageUrl) {
  try {
    const res = await api.put(`/equipment/${id}`, { imageUrl });
    return res.data;
  } catch (err) {
    console.error('Upload image error:', err);
    return { success: false };
  }
}

// --- Operator API ---
export async function fetchOperatorsWithEquipment() {
  try {
    const res = await api.get('/cooperative/operators-with-equipment');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch operators with equipment error:', err);
    return [];
  }
}

export async function fetchOperatorJobs() {
  try {
    const res = await api.get('/jobs');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch jobs error:', err);
    return [];
  }
}

export async function startJobApi(id, beforeImage) {
  try {
    const res = await api.post(`/jobs/${id}/start`, { beforeImage });
    return res.data;
  } catch (err) {
    console.error('Start job error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function completeJobApi(id, payload) {
  try {
    const res = await api.post(`/jobs/${id}/complete`, payload);
    return res.data;
  } catch (err) {
    console.error('Complete job error:', err);
    return err.response?.data || { success: false, message: 'Server error' };
  }
}

export async function requestJobCancellationApi(id, payload) {
  try {
    const res = await api.post(`/jobs/${id}/request-cancellation`, payload);
    return res.data;
  } catch (err) {
    console.error('Request job cancellation error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export async function reportJobIssueApi(id, payload) {
  try {
    const res = await api.post(`/jobs/${id}/report-issue`, payload);
    return res.data;
  } catch (err) {
    console.error('Report job issue error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export async function fetchCancellationRequestsApi() {
  try {
    const res = await api.get('/jobs/cancellation-requests');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch cancellation requests error:', err);
    return [];
  }
}

export async function fetchOperatorStatsApi() {
  try {
    const res = await api.get('/jobs/operator-stats');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch operator stats error:', err);
    return [];
  }
}

export async function approveJobCancellationApi(id) {
  try {
    const res = await api.post(`/jobs/${id}/approve-cancellation`);
    return res.data;
  } catch (err) {
    console.error('Approve job cancellation error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export async function rejectJobCancellationApi(id, reason) {
  try {
    const res = await api.post(`/jobs/${id}/reject-cancellation`, { reason });
    return res.data;
  } catch (err) {
    console.error('Reject job cancellation error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}

export async function reassignJobOperatorApi(id, operatorId) {
  try {
    const res = await api.post(`/jobs/${id}/reassign`, { operatorId });
    return res.data;
  } catch (err) {
    console.error('Reassign job operator error:', err);
    return err.response?.data || { success: false, message: 'Server connection failed.' };
  }
}


// --- Government Officer & Admin APIs ---
export async function fetchDistrictStats() {
  try {
    const res = await api.get('/stats');
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Fetch stats error:', err);
    return null;
  }
}

export async function fetchAuditLogs() {
  try {
    const res = await api.get('/audit-logs');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    return [];
  }
}

// --- Admin APIs ---
export async function fetchAdminUsers() {
  try {
    const res = await api.get('/admin/users');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch admin users error:', err);
    return [];
  }
}

export async function updateAdminUser(id, payload) {
  try {
    const res = await api.put(`/admin/users/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error('Update user error:', err);
    return { success: false };
  }
}

export async function deleteAdminUser(id) {
  try {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  } catch (err) {
    console.error('Delete user error:', err);
    return { success: false };
  }
}

export async function fetchMaintenanceLogs() {
  try {
    const res = await api.get('/cooperative/maintenance');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch maintenance logs error:', err);
    return [];
  }
}

export async function startEquipmentMaintenance(id) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance/start`);
    return res.data;
  } catch (err) {
    console.error('Start maintenance API error:', err);
    return { success: false };
  }
}

export async function reportEquipmentMaintenance(id, payload) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance/report`, payload);
    return res.data;
  } catch (err) {
    console.error('Report maintenance API error:', err);
    return { success: false, message: err.response?.data?.message || 'Server error' };
  }
}

export async function approveEquipmentMaintenance(id) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance/approve`);
    return res.data;
  } catch (err) {
    console.error('Approve maintenance API error:', err);
    return { success: false, message: err.response?.data?.message || 'Server error' };
  }
}

export async function rejectEquipmentMaintenance(id) {
  try {
    const res = await api.post(`/cooperative/equipment/${id}/maintenance/reject`);
    return res.data;
  } catch (err) {
    console.error('Reject maintenance API error:', err);
    return { success: false };
  }
}

export async function fetchFarmerFeedbackCoop() {
  try {
    const res = await api.get('/cooperative/feedback');
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Fetch farmer feedback API error:', err);
    return [];
  }
}

export async function fetchBillingReport(from, to, district = '', taluk = '') {
  try {
    const res = await api.get('/cooperative/billing-report', { params: { from, to, district, taluk } });
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Fetch billing report API error:', err);
    return null;
  }
}

export default api;
