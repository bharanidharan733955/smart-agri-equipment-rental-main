// src/components/farmer/FarmerPortal.jsx
import React, { useState, useEffect } from 'react';
import FarmerLayout from './FarmerLayout';
import FarmerDashboardView from './FarmerDashboardView';
import FarmerEquipmentView from './FarmerEquipmentView';
import FarmerBookingsView from './FarmerBookingsView';
import FarmerComplaintsView from './FarmerComplaintsView';
import FarmerNotificationsView from './FarmerNotificationsView';
import RentalModal from '../RentalModal';
import { 
  fetchFarmerOverview, 
  fetchFarmerEquipment, 
  fetchFarmerBookings, 
  cancelFarmerBooking, 
  fetchFarmerComplaints, 
  submitFarmerComplaint, 
  fetchFarmerNotifications 
} from '../../api';

export default function FarmerPortal({ onLogout, user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [overviewData, setOverviewData] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // Initial Data Fetching from Express Backend
  useEffect(() => {
    loadAllFarmerData();
  }, []);

  const loadAllFarmerData = async () => {
    // Fire all 5 requests in parallel — reduces load time from sum of all calls to the slowest one
    const [overview, eq, bk, cmp, notif] = await Promise.all([
      fetchFarmerOverview(),
      fetchFarmerEquipment(),
      fetchFarmerBookings(),
      fetchFarmerComplaints(),
      fetchFarmerNotifications(),
    ]);

    if (overview) setOverviewData(overview);
    if (eq && eq.length > 0) setEquipmentList(eq);
    if (bk) setBookingsList(bk);
    if (cmp) setComplaintsList(cmp);
    if (notif) setNotificationsList(notif);
  };

  const handleBookEquipment = (item) => {
    setSelectedEquipment(item);
    setIsRentalModalOpen(true);
  };

  const handleCloseRentalModal = () => {
    setIsRentalModalOpen(false);
    setSelectedEquipment(null);
    loadAllFarmerData(); // refresh bookings & overview stats
  };

  const handleCancelBooking = async (id) => {
    await cancelFarmerBooking(id);
    loadAllFarmerData();
  };

  const handleFileComplaint = async (complaintPayload) => {
    await submitFarmerComplaint(complaintPayload);
    loadAllFarmerData();
  };

  return (
    <FarmerLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      farmerUser={user}
    >
      {activeTab === 'dashboard' && (
        <FarmerDashboardView
          overviewData={overviewData}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'equipment' && (
        <FarmerEquipmentView
          equipmentList={equipmentList}
          onBookEquipment={handleBookEquipment}
        />
      )}

      {activeTab === 'bookings' && (
        <FarmerBookingsView
          bookingsList={bookingsList}
          onCancelBooking={handleCancelBooking}
        />
      )}

      {activeTab === 'complaints' && (
        <FarmerComplaintsView
          complaintsList={complaintsList}
          onFileComplaint={handleFileComplaint}
        />
      )}

      {activeTab === 'notifications' && (
        <FarmerNotificationsView
          notificationsList={notificationsList}
        />
      )}

      {/* Equipment Booking Modal */}
      <RentalModal
        equipment={selectedEquipment}
        isOpen={isRentalModalOpen}
        onClose={handleCloseRentalModal}
      />
    </FarmerLayout>
  );
}
