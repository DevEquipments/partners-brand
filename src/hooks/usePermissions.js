import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Standard permission definitions for Equipments Dekho Partner Admin.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  ENQUIRIES_VIEW: "enquiries:view",
  ENQUIRIES_EXPORT: "enquiries:export",
  ENQUIRIES_UPDATE: "enquiries:update",
  QUOTES_VIEW: "quotes:view",
  QUOTES_EXPORT: "quotes:export",
  QUOTES_UPDATE: "quotes:update",
  PROFILE_VIEW: "profile:view",
  PROFILE_EDIT: "profile:edit",
  SUBADMINS_MANAGE: "subadmins:manage",
};

export const MODULES = {
  DASHBOARD: "dashboard",
  ENQUIRIES: "enquiries",
  QUOTES: "quotes",
  PROFILE: "profile",
  SUBADMINS: "subadmins",
};

export const usePermissions = () => {
  const { user, role } = useAuth();

  const isAdmin = role === "ADMIN";
  const isSubAdmin = role === "SUB_ADMIN";

  // Sub Admin permissions list provided by backend user profile or defaults
  const userPermissions = useMemo(() => {
    if (isAdmin) {
      return Object.values(PERMISSIONS);
    }
    if (Array.isArray(user?.permissions)) {
      return user.permissions;
    }
    // Default fallback permissions for sub-admin if backend has not yet persisted custom array
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.ENQUIRIES_VIEW,
      PERMISSIONS.ENQUIRIES_EXPORT,
      PERMISSIONS.QUOTES_VIEW,
      PERMISSIONS.PROFILE_VIEW,
    ];
  }, [isAdmin, user?.permissions]);

  const hasPermission = (permissionKey) => {
    if (isAdmin) return true;
    return userPermissions.includes(permissionKey);
  };

  const canAccessModule = (moduleKey) => {
    if (isAdmin) return true;
    switch (moduleKey) {
      case MODULES.DASHBOARD:
        return hasPermission(PERMISSIONS.DASHBOARD_VIEW);
      case MODULES.ENQUIRIES:
        return hasPermission(PERMISSIONS.ENQUIRIES_VIEW);
      case MODULES.QUOTES:
        return hasPermission(PERMISSIONS.QUOTES_VIEW);
      case MODULES.PROFILE:
        return hasPermission(PERMISSIONS.PROFILE_VIEW);
      case MODULES.SUBADMINS:
        return isAdmin; // Sub Admin can never access Sub Admin management
      default:
        return false;
    }
  };

  const canPerformAction = (actionKey) => hasPermission(actionKey);

  return {
    role,
    isAdmin,
    isSubAdmin,
    permissions: userPermissions,
    hasPermission,
    canAccessModule,
    canPerformAction,
  };
};

export default usePermissions;
