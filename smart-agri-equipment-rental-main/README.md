# 🌾 AgriRentGov - Smart Agriculture Equipment Rental Platform

AgriRentGov is a premium, state-of-the-art web application designed to help farmers lease advanced agricultural machinery directly from cooperative hubs. The platform features role-based access, automated booking systems, upfront payment integrations, and comprehensive administrative metrics.

---

## 🚀 Key Features

### 🚜 Farmer Cooperative Portal
*   **Upfront Booking & Auto-Approval:** Instantly reserve machinery (e.g. Mahindra Tractors, Harvesters). If stock is available (limit of **15 units** of each equipment type), the system automatically approves the booking, generates invoice statements, dispatches job allocations to field operators, and sends real-time dashboard notifications.
*   **Smart Profiles:** Eliminates redundant data input. Farmer ID, Mobile Number, District, and Address are automatically populated from the user session.
*   **District Filters:** Tailored for the state of **Tamil Nadu** (supporting Chennai, Coimbatore, Madurai, Salem, Vellore, Thanjavur, and more).

### ✨ Recent Updates
*   **Fully Responsive UI:** Seamless experience across desktop, tablet, and mobile devices.
*   **Enhanced Stability:** Integrated App-level error boundaries to gracefully handle rendering issues.
*   **Improved Booking & Payments:** Refined logic for edge cases in equipment bookings and upfront payments.
*   **API Proxy Integration:** Zero-CORS overhead with local proxying to the Express backend.

### 👥 Role-Based Access Portals
*   **Farmer Portal:** Manage active rentals, view order dispatches, and check upfront invoices.
*   **Equipment Operator Portal:** Log daily engine working hours, view route maps, and accept auto-dispatched job tasks.
*   **Maintenance Specialist Portal:** Maintain service schedules, record cost of parts, and complete machinery inspections.
*   **Cooperative Staff & Admin Portal:** 
    *   Dynamic inventory management.
    *   Dynamic **User Account Suspensions** ledger search filter (by name, email, role, or hub).
    *   Upfront Billing Ledger (automatic billing updates with no manual status toggles).
    *   **Downloadable Analytics PDF Reports:** Generates print-ready files containing total revenue widgets, per-machinery rent share Pie Charts, and District comparison Bar Graphs.

---

## 🛠️ Technology Stack

*   **Frontend:** React, Vite, Lucide icons, Tailwind/CSS variables.
*   **Backend:** Node.js, Express, JWT Authentication, Mongoose.
*   **Database:** MongoDB Atlas (Cloud Database).

---

## ⚙️ Project Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account (with network IP access whitelisted).

### 2. Environment Configuration
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI="your-mongodb-atlas-connection-string"
```

### 3. Startup Guide

#### Run the Backend Server
```bash
cd backend
npm install
npm run dev
```

#### Run the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) in your browser. (Note: The frontend server now runs on port 5174 and automatically proxies `/api` requests to the backend).

---

## 📂 Repository Structure
```
├── backend/
│   ├── routes/          # Auth, Equipment, and Rental API endpoints
│   ├── db.js            # MongoDB Schemas & Seeding logic
│   └── server.js        # Server Entrypoint
└── frontend/
    ├── src/
    │   ├── api.js       # Client API call helpers
    │   ├── App.jsx      # Navigation Router
    │   └── components/  # User roles portals, login, and registration modules
```
