# EquipmentsDekho Partners Brand CRM

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7.18-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-v1.18-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)

> **EquipmentsDekho Partners Brand Portal** is an enterprise-grade B2B Customer Relationship Management (CRM) and operations platform designed for heavy equipment manufacturers, brand partners, and authorized equipment distributors.

---

## 🚀 Key Highlights & Capabilities

- **Unified Lead & Demand Management:** Centralized dashboard aggregating inbound customer inquiries and equipment quotation requests from the EquipmentsDekho marketplace.
- **Dynamic Role-Based Access Control (RBAC):** Distinct functional scopes for **Brand Admins** and **Sub-Admins** (Regional Executives) with dynamically constructed sidebar menus from backend contracts.
- **Geographic Territory Engine:** Strict state and city-level authorization restricting operator visibility to designated sales territories.
- **Intelligent Workload Auto-Routing:** Automated lead assignment algorithm distributing incoming inquiries to the least-burdened qualified operator with admin override capabilities.
- **Complete Lead Lifecycle & Audit Trail:** Interactive 360° lead inspection drawer with chronological activity timeline (calls, notes, meetings, quotes dispatched, and stage transitions).
- **Modern UI & Theming:** High-performance responsive design with full Light and Dark theme support.

---

## 📚 Complete Technical Documentation

For the in-depth architectural breakdown, data flow diagrams, API specifications, and permission resolution algorithms, please refer to:

👉 **[Complete System Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19 (Hooks, Concurrent Mode) |
| **Bundler & Dev Server**| Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`) |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **State Management** | Context API (`AuthContext`, `PermissionContext`, `CRMContext`, `ThemeContext`) |
| **Form Handling** | React Hook Form |
| **HTTP Client** | Axios (Custom instance with auth interceptors & toast deduplication) |
| **Icons & Notifications**| Lucide React, React Hot Toast |

---

## 📁 Project Structure

```
src/
├── api/             # Axios instance, interceptors, and request helper
├── endPoints/       # Centralized API endpoint registry
├── config/          # Permissions, CRM statuses, locations, and navigation configs
├── context/         # Auth, Permission, CRM, and Theme context providers
├── services/        # Backend API service integration layer
├── repositories/    # Data access layer (API & local storage cache)
├── hooks/           # Custom reusable React hooks
├── layouts/         # Frame layouts (Sidebar, TopHeader, Content Outlet)
├── components/      # Common UI library (DataTable, Modal, Drawer, Skeletons)
│   ├── common/      # Reusable design system components
│   ├── crm/         # Lead drawer, activity timeline, assignment selectors
│   ├── guards/      # PrivateRoute, PublicRoute, PermissionRoute, PermissionGate
│   └── layout/      # Sidebar, TopHeader, ThemeToggle, UserMenu
├── pages/           # Application views (Dashboard, Leads, Enquiries, Quotes, SubAdmins)
├── utils/           # Territory access rules, permission resolvers, date formatters
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
  - Global nationwide lead visibility.
  - Sub-Admin creation, territory allocation, and dynamic permission matrix configuration.
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
