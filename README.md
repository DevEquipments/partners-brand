# EquipmentsDekho Partners Brand CRM

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7.18-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-v1.18-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)

> **EquipmentsDekho Partners Brand Portal** is an enterprise-grade B2B Customer Relationship Management (CRM) and operations platform designed for heavy equipment manufacturers, brand partners (such as JCB, Caterpillar, Tata Hitachi, etc.), and authorized equipment distributors.

---

## 🚀 Key Highlights & Capabilities

- **Unified Lead & Demand Management:** Centralized dashboard aggregating inbound customer inquiries and equipment quotation requests from the EquipmentsDekho marketplace.
- **Dynamic Role-Based Access Control (RBAC):** Distinct functional scopes for **Brand Admins** and **Sub-Admins** (Regional Executives) with dynamically constructed sidebar menus from backend contracts.
- **Sub-Admin Live Capacity Quotas:** Real-time query and visual tracking of account capacity limits (`allowed_sub_admins`, `current_sub_admins`, `remaining_sub_admins`) directly synced with the backend API.
- **Sub-Admin Active/Inactive Status Control:** Production-grade status management via `POST /update-sub-admin-status` featuring animated switch controls, independent per-row update isolation, and server-confirmed state synchronization.
- **Real Sub-Admin Creation API:** Direct integration with `POST /create-premium-brand-sub-admins` submitting all 9 canonical parameters with full validation and state refresh.
- **Slide-Over Drawer & Form System:** Standardized slide-over drawer (`Drawer.jsx`) matching the Master Admin panel pattern, equipped with brand identity badge, quota indicator, contextual field icons, and the custom `useAppForm` validation engine.
- **Granular Permission Toggle Architecture:** Clean **Enable / Disable toggle switches** for Sub-Admin permissions via `POST /add-role-permission` and `POST /delete-role-permission`. Master Admin retains exclusive control over global permission definitions (disabling redundant brand admin tabs).
- **Geographic Territory Engine:** Strict state and city-level authorization restricting operator visibility to designated sales territories.
- **Intelligent Workload Auto-Routing:** Automated lead assignment algorithm distributing incoming inquiries to the least-burdened qualified operator with admin override capabilities.
- **Complete Lead Lifecycle & Audit Trail:** Interactive 360° lead inspection drawer with chronological activity timeline (calls, notes, meetings, quotes dispatched, and stage transitions).
- **Global Dark Mode & Responsive Tables:** Universal dark theme surface styling for all table headers (`bg-slate-50 dark:bg-slate-800`), sticky headers with backdrop blur, and horizontal overflow protection across all screen viewports.

---

## 📚 Complete Technical Documentation

For the in-depth architectural breakdown, sequence diagrams, API contracts, and permission resolution algorithms, please refer to:

👉 **[Complete System Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19 (Concurrent Mode, Hooks) |
| **Bundler & Dev Server**| Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`) |
| **Styling & Design System**| Tailwind CSS v4 (`@theme` variables, Dark Mode) |
| **Routing** | React Router DOM v7 |
| **State Management** | Context API (`AuthContext`, `PermissionContext`, `CRMContext`, `ThemeContext`) |
| **Form Handling** | Reusable `useAppForm` Hook (Declarative Validation, Auto-focus, Dirty Tracking) |
| **HTTP Client** | Axios (Custom instance with auth interceptors & toast deduplication) |
| **Icons & Notifications**| Lucide React, React Hot Toast |
| **Typeahead & Selects** | React Select |

---

## 📁 Project Structure

```text
src/
├── api/             # Axios instance, interceptors, and request helper
├── endPoints/       # Centralized API endpoint registry (17 endpoints)
├── config/          # Permissions, CRM statuses, locations, and navigation configs
├── context/         # Auth, Permission, CRM, and Theme context providers
├── services/        # Backend API service integration layer (SubAdmins, Permissions, CRM)
├── repositories/    # Data access layer (Remote API & local storage cache)
├── hooks/           # Custom reusable React hooks (useAppForm, useSubAdmins, usePermissions)
├── layouts/         # Frame layouts (Sidebar, TopHeader, Content Outlet)
├── components/      # Common UI library (DataTable, Drawer, Modal, Form, Skeletons)
│   ├── common/      # Reusable design system components (Form, FormField, PasswordInput, Drawer)
│   ├── crm/         # Lead drawer, activity timeline, assignment selectors
│   ├── guards/      # PrivateRoute, PublicRoute, PermissionRoute, PermissionGate
│   └── layout/      # Sidebar, TopHeader, ThemeToggle, UserMenu
├── pages/           # Application views (Dashboard, Leads, Enquiries, Quotes, SubAdmins)
├── utils/           # Territory access rules, permission resolvers, error handlers
└── routes/          # AppRoutes definition with role & permission guards
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm or yarn

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd partners-brand
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```ini
VITE_API_URL=https://partners.equipmentsdekho.com/apis/api
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
# OR network preview on port 4000:
npm run start
```

---

## 🔒 User Roles & Access Overview

- **Admin (Brand Principal):**
  - Nationwide lead visibility and pipeline oversight.
  - Sub-Admin creation via slide-over drawer with real API persistence and dynamic quota limits.
  - Granular Sub-Admin permission management using Enable / Disable switches.
  - Lead assignment override outside designated territories.
  - Comprehensive sales and performance reports.
- **Sub-Admin (Regional Sales Operator):**
  - Territory-restricted lead visibility (assigned State / City).
  - Dynamic navigation menu strictly controlled by assigned permissions via `POST /sub-admin-sidebar`.
  - Lead pipeline tracking, follow-up scheduling, and quotation dispatching.

---

## 📄 License & Attribution

Copyright © EquipmentsDekho. All rights reserved.  
Internal proprietary software for EquipmentsDekho Brand Partners.
