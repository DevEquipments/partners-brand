import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/guards/PrivateRoute";
import PublicRoute from "../components/guards/PublicRoute";
import PermissionRoute from "../components/guards/PermissionRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import CustomerEnquiry from "../pages/CustomerEnquiry";
import FeatureEquipmentQuotes from "../pages/FeatureEquipmentQuotes";
import SubAdmins from "../pages/SubAdmins";
import Profile from "../pages/Profile";
import { MODULES } from "../hooks/usePermissions";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Guest Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Authenticated Protected Operations Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={
              <PermissionRoute module={MODULES.DASHBOARD}>
                <Dashboard />
              </PermissionRoute>
            }
          />
          <Route
            path="/inquiries"
            element={
              <PermissionRoute module={MODULES.ENQUIRIES}>
                <CustomerEnquiry />
              </PermissionRoute>
            }
          />
          <Route
            path="/product-quotes"
            element={
              <PermissionRoute module={MODULES.QUOTES}>
                <FeatureEquipmentQuotes />
              </PermissionRoute>
            }
          />
          <Route
            path="/sub-admins"
            element={
              <PermissionRoute module={MODULES.SUBADMINS}>
                <SubAdmins />
              </PermissionRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PermissionRoute module={MODULES.PROFILE}>
                <Profile />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>

      {/* Fallback Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
