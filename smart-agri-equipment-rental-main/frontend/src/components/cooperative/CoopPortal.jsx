// src/components/cooperative/CoopPortal.jsx
import React, { useState, useEffect } from 'react';
import CoopStaffLayout from './CoopStaffLayout';
import CoopEquipmentView from './CoopEquipmentView';
import AddEquipmentModal from './AddEquipmentModal';
import EditEquipmentModal from './EditEquipmentModal';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import UploadImageModal from './UploadImageModal';
import { 
  fetchCoopEquipment, 
  fetchCoopStats, 
  addCoopEquipment, 
  editCoopEquipment, 
  deleteCoopEquipment, 
  updateCoopEquipmentStatus, 
  updateCoopEquipmentCondition, 
  uploadCoopEquipmentImage,
  fetchFarmerBookings,
  approveRentalBooking,
  rejectRentalBooking,
  fetchCoopOperators,
  fetchCoopFarmers,
  approveFarmerApi,
  scheduleMaintenance,
  completeMaintenance,
  fetchCoopInvoices,
  payInvoice
} from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, UserCheck, Wrench, FileSpreadsheet, DollarSign } from 'lucide-react';

export default function CoopPortal({ onLogout }) {
  const [activeTab, setActiveTab] = useState('inventory');
  const [equipmentList, setEquipmentList] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [uploadItem, setUploadItem] = useState(null);
  const [maintItem, setMaintItem] = useState(null);

  // Maintenance form state
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState('');

  useEffect(() => {
    loadCoopData();
  }, [activeTab]);

  const loadCoopData = async () => {
    const list = await fetchCoopEquipment();
    setEquipmentList(list || []);

    const st = await fetchCoopStats();
    if (st) setStats(st);

    if (activeTab === 'requests') {
      const bks = await fetchFarmerBookings();
      setBookings(bks || []);
      const ops = await fetchCoopOperators();
      setOperators(ops || []);
    } else if (activeTab === 'farmers') {
      const frms = await fetchCoopFarmers();
      setFarmers(frms || []);
    } else if (activeTab === 'invoices') {
      const invs = await fetchCoopInvoices();
      setInvoices(invs || []);
    }
  };

  // Add Equipment Handler
  const handleAddEquipment = async (payload) => {
    const res = await addCoopEquipment(payload);
    if (res.success) {
      toast.success('Equipment added successfully!');
      setIsAddOpen(false);
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to add equipment.');
    }
  };

  // Edit Equipment Handler
  const handleSaveEdit = async (id, payload) => {
    const res = await editCoopEquipment(id, payload);
    if (res.success) {
      toast.success('Equipment updated successfully!');
      setEditingItem(null);
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to update equipment.');
    }
  };

  // Delete Equipment Handler
  const handleDeleteEquipment = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from Hub Inventory?`)) {
      await deleteCoopEquipment(id);
      toast.success('Equipment deleted.');
      loadCoopData();
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await updateCoopEquipmentStatus(id, status);
    loadCoopData();
  };

  const handleUpdateCondition = async (id, condition) => {
    await updateCoopEquipmentCondition(id, condition);
    loadCoopData();
  };

  const handleUploadImage = async (id, imageUrl) => {
    await uploadCoopEquipmentImage(id, imageUrl);
    loadCoopData();
  };

  // Booking Approve / Reject
  const handleApproveBooking = async (id) => {
    const res = await approveRentalBooking(id);
    if (res.success) {
      toast.success('Booking approved! Operator assigned automatically.');
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = async (id) => {
    const res = await rejectRentalBooking(id);
    if (res.success) {
      toast.success('Booking rejected.');
      loadCoopData();
    } else {
      toast.error(res.message || 'Failed to reject booking.');
    }
  };

  // Farmer Approve
  const handleApproveFarmer = async (id) => {
    const res = await approveFarmerApi(id);
    if (res.success) {
      toast.success('Farmer account approved successfully!');
      loadCoopData();
    } else {
      toast.error('Failed to approve farmer.');
    }
  };

  // Maintenance Submit
  const handleScheduleMaintSubmit = async (e) => {
    e.preventDefault();
    const res = await scheduleMaintenance(maintItem._id || maintItem.id, {
      description: maintDesc,
      cost: parseFloat(maintCost) || 0
    });
    if (res.success) {
      toast.success('Equipment sent to Under Maintenance.');
      setMaintItem(null);
      setMaintDesc('');
      setMaintCost('');
      loadCoopData();
    }
  };

  const handleCompleteMaint = async (id) => {
    const res = await completeMaintenance(id);
    if (res.success) {
      toast.success('Equipment maintenance completed. Available for rent.');
      loadCoopData();
    }
  };

  // Pay Invoice
  const handlePayInvoice = async (id) => {
    const res = await payInvoice(id);
    if (res.success) {
      toast.success('Invoice marked as paid!');
      loadCoopData();
    }
  };

  return (
    <CoopStaffLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      onOpenAddModal={() => setIsAddOpen(true)}
    >
      <Toaster position="top-right" />
      {activeTab === 'inventory' && (
        <CoopEquipmentView
          equipmentList={equipmentList}
          stats={stats}
          onOpenAddModal={() => setIsAddOpen(true)}
          onViewDetails={(item) => setDetailsItem(item)}
          onEditEquipment={(item) => setEditingItem(item)}
          onDeleteEquipment={handleDeleteEquipment}
          onUploadImage={(item) => setUploadItem(item)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateCondition={handleUpdateCondition}
          onScheduleMaint={(item) => setMaintItem(item)}
          onCompleteMaint={handleCompleteMaint}
        />
      )}

      {activeTab === 'requests' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">COOPERATIVE DISPATCH</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Farmer Rental Applications
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Equipment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Start Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Cost</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((bk) => (
                  <tr key={bk._id || bk.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontWeight: 700, display: 'block' }}>{bk.farmer?.name || 'Farmer'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bk.farmer?.mobile}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{bk.equipment?.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{new Date(bk.startDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{bk.durationDays} Days</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 700 }}>₹{bk.totalAmount}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: bk.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: bk.status === 'Pending' ? '#f59e0b' : '#10b981',
                        fontWeight: 700
                      }}>
                        {bk.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {bk.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBooking(bk._id || bk.id)}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 700 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectBooking(bk._id || bk.id)}
                            style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'farmers' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">COOPERATIVE MEMBERS</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Registered Farmers
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mobile</th>
                  <th style={{ padding: '0.75rem 1rem' }}>District</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f) => (
                  <tr key={f._id || f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{f.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{f.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{f.mobile}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{f.district}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: f.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: f.isApproved ? '#10b981' : '#ef4444',
                        fontWeight: 700
                      }}>
                        {f.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {!f.isApproved && (
                        <button
                          onClick={() => handleApproveFarmer(f._id || f.id)}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Approve Farmer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#cbd5e1' }}>
          <span className="section-tag">FINANCES</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
            Billing & Invoices
          </h1>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Invoice Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Farmer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Tax (18% GST)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Late Penalty</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id || inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{inv.booking?.farmer?.name || 'Farmer'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.booking?.equipment?.name}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>₹{inv.tax}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>₹{inv.penalty}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 800 }}>₹{inv.totalAmount}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: inv.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: inv.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b',
                        fontWeight: 700
                      }}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      {inv.paymentStatus === 'Pending' && (
                        <button
                          onClick={() => handlePayInvoice(inv._id || inv.id)}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Collect Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddEquipment={handleAddEquipment}
      />

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        equipment={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSaveEdit={handleSaveEdit}
      />

      {/* Equipment Details Modal */}
      <EquipmentDetailsModal
        equipment={detailsItem}
        isOpen={!!detailsItem}
        onClose={() => setDetailsItem(null)}
      />

      {/* Upload Image Modal */}
      <UploadImageModal
        equipment={uploadItem}
        isOpen={!!uploadItem}
        onClose={() => setUploadItem(null)}
        onUploadImage={handleUploadImage}
      />

      {/* Maintenance modal */}
      {maintItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#131d35', padding: '2rem', borderRadius: '16px', maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Send {maintItem.name} to Maintenance</h3>
            <form onSubmit={handleScheduleMaintSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Reason / Service Details</label>
                <textarea required value={maintDesc} onChange={(e) => setMaintDesc(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Estimated Cost (₹)</label>
                <input type="number" required value={maintCost} onChange={(e) => setMaintCost(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Confirm Maintenance</button>
                <button type="button" onClick={() => setMaintItem(null)} style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CoopStaffLayout>
  );
}
