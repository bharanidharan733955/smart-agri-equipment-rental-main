# 🚀 Deployment Guide: AgriRentGov Platform

This guide outlines how to deploy the **AgriRentGov Smart Agriculture Equipment Rental Platform** to the cloud.

---

## 📋 Pre-Deployment Checklist

1. **MongoDB Atlas Database:**
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Go to **Network Access** → Click **Add IP Address** → Choose **Allow Access from Anywhere (`0.0.0.0/0`)** and confirm.
   - Go to **Database Access** → Ensure your database user has read/write privileges.
   - Copy your connection string (`mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agrirent`).

2. **Push Code to GitHub:**
   Make sure all your latest changes are pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare production deployment configurations"
   git push origin main
   ```

---

## 🌟 Option 1: Render (Backend) + Vercel (Frontend) — *Recommended & 100% Free*

This is the most scalable setup with dedicated hosting for the API and a global CDN edge network for the frontend.

### Step 1: Deploy Backend on [Render](https://render.com)
1. Sign up / Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `smart-agri-equipment-rental-main`.
4. Configure the service settings:
   - **Name:** `agrirent-backend` (or your choice)
   - **Region:** Closest to your users (e.g., *Singapore / Frankfurt / Oregon*)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`
5. Expand **Advanced** → **Environment Variables** and add:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string (e.g. `agrirent-super-secret-key-2026`)*
   - `PORT`: `5000` (Render will automatically assign its port, but 5000 is safe as fallback)
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL:  
   👉 `https://agrirent-backend.onrender.com`

---

### Step 2: Deploy Frontend on [Vercel](https://vercel.com)
1. Log in to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
2. Select your GitHub repository: `smart-agri-equipment-rental-main`.
3. In the project configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL from Step 1:
     ```
     https://agrirent-backend.onrender.com
     ```
     *(Note: The frontend automatically normalizes the URL to append `/api` if omitted).*
5. Click **Deploy**.
6. Your platform is now LIVE with custom SSL and fast global CDN! 🎉

---

## ⚡ Option 2: Single Full-Stack Web Service on Render / Railway *(1 Service, 1 URL)*

In this mode, the Express backend serves the production React build and API endpoints together on the same domain and port.

### Setup on Render:
1. Click **New +** → **Web Service** on Render.
2. Select your GitHub repository.
3. Configure:
   - **Root Directory:** Leave empty (root)
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   - `MONGODB_URI`: *Your MongoDB connection string*
   - `JWT_SECRET`: *A secure random secret*
5. Click **Deploy Web Service**.
6. When the build finishes, both the frontend web app and the backend API run on your single Render domain (no CORS or proxy configuration required).

---

## 🛠️ Verification & Testing

Once deployed:
1. **API Health Check:** Visit `https://<your-backend-url>/api/health`. You should see:
   ```json
   {
     "status": "ONLINE",
     "platform": "AgriRentGov State Cooperative Backend API"
   }
   ```
2. **Frontend Routing:** Open your frontend URL, navigate through:
   - `/role-login`
   - Farmer booking portal
   - Cooperative equipment management
   - Refresh the page on any subpath (e.g., `/farmer`) to confirm client-side routing works smoothly.
3. **Database Test:** Log in with any demo role account or register a new farmer account to ensure write operations succeed on MongoDB Atlas.

---

## 🔑 Default Demo Accounts

| Role | Email / ID | Password |
|---|---|---|
| **Farmer** | *Use Quick-Fill Demo button or Register with District/Taluk* | Dynamic |
| **Cooperative Staff** | `staff@agrirent.gov` | `AgriRentGov#Secure2026!Staff` |
| **Equipment Operator** | `pollachi.op1@agrirent.gov` | `AgriRentGov#Secure2026!Operator` |
| **Maintenance Tech** | `maint@agrirent.gov` | `AgriRentGov#Secure2026!Maint` |
| **Government Auditor** | `officer@agrirent.gov` | `AgriRentGov#Secure2026!Officer` |
