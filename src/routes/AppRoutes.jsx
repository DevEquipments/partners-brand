import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/guards/PrivateRoute";
import PublicRoute from "../components/guards/PublicRoute";
import PermissionRoute from "../components/guards/PermissionRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

// Dashboard
import Dashboard from "../pages/Dashboard";

// CRM Operations Pages
import AllLeads from "../pages/crm/AllLeads";
import CustomerEnquiry from "../pages/CustomerEnquiry";
import FeatureEquipmentQuotes from "../pages/FeatureEquipmentQuotes";
import FollowUps from "../pages/crm/FollowUps";
import SubAdmins from "../pages/subadmins/SubAdmins";
import PermissionManagement from "../pages/permissions/PermissionManagement";
import CRMReports from "../pages/reports/CRMReports";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

import { MODULES } from "../config/permissions";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Authenticated CRM Operations Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Operations Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PermissionRoute module={MODULES.DASHBOARD}>
                <Dashboard />
              </PermissionRoute>
            }
          />

          {/* CRM: Leads */}
          <Route
            path="/crm/leads"
            element={
              <PermissionRoute module={MODULES.CRM_LEADS}>
                <AllLeads />
              </PermissionRoute>
            }
          />

          {/* CRM: Customer Enquiries */}
          <Route
            path="/crm/enquiries"
            element={
              <PermissionRoute module={MODULES.CRM_ENQUIRIES}>
                <CustomerEnquiry />
              </PermissionRoute>
            }
          />

          {/* CRM: Equipment Quotes */}
          <Route
            path="/crm/quotes"
            element={
              <PermissionRoute module={MODULES.CRM_QUOTES}>
                <FeatureEquipmentQuotes />
              </PermissionRoute>
            }
          />

          {/* CRM: Follow-ups */}
          <Route
            path="/crm/follow-ups"
            element={
              <PermissionRoute module={MODULES.CRM_FOLLOWUPS}>
                <FollowUps />
              </PermissionRoute>
            }
          />

          {/* Sub Admins Management & Access Operations (Admin Only) */}
          <Route
            path="/sub-admins"
            element={
              <PermissionRoute module={MODULES.TEAM} adminOnly>
                <SubAdmins />
              </PermissionRoute>
            }
          />

          {/* Global Permission Definitions Management (Admin Only) */}
          <Route
            path="/permissions"
            element={
              <PermissionRoute module={MODULES.TEAM} adminOnly>
                <PermissionManagement />
              </PermissionRoute>
            }
          />
          <Route path="/permission-management" element={<Navigate to="/permissions" replace />} />
          <Route path="/sub-admins/permissions" element={<Navigate to="/sub-admins?view=access" replace />} />

          {/* Reports & Analytics */}
          <Route
            path="/reports"
            element={
              <PermissionRoute module={MODULES.REPORTS} adminOnly>
                <CRMReports />
              </PermissionRoute>
            }
          />

          {/* Brand Partner Profile */}
          <Route
            path="/profile"
            element={
              <PermissionRoute module={MODULES.PROFILE}>
                <Profile />
              </PermissionRoute>
            }
          />

          {/* Backward Compatibility Redirects */}
          <Route path="/inquiries" element={<Navigate to="/crm/enquiries" replace />} />
          <Route path="/product-quotes" element={<Navigate to="/crm/quotes" replace />} />
          <Route path="/quotations" element={<Navigate to="/crm/quotes" replace />} />
          <Route path="/team" element={<Navigate to="/sub-admins" replace />} />
          <Route path="/team/sub-admins" element={<Navigate to="/sub-admins" replace />} />
          <Route path="/team/assignment-rules" element={<Navigate to="/sub-admins" replace />} />
          <Route path="/settings/permissions" element={<Navigate to="/sub-admins" replace />} />
          <Route path="/crm/pipeline" element={<Navigate to="/crm/leads" replace />} />
          <Route path="/pipeline" element={<Navigate to="/crm/leads" replace />} />
          <Route path="/crm/unassigned" element={<Navigate to="/crm/leads" replace />} />

          {/* 404 Inside Layout */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Fallback Root Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
