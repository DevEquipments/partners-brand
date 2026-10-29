import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissionContext } from "../context/PermissionContext";
import { PERMISSIONS, MODULES, MODULE_PERMISSION_MAP } from "../config/permissions";
import { resolveSlugToActions, hasModulePermission } from "../utils/permissionResolver";

export { PERMISSIONS, MODULES };

export const usePermissions = () => {
  const { user, role } = useAuth();

  const {
    adminPermissionDefinitions = [],
    isDefinitionsLoading = false,
    definitionsError = null,
    refreshAdminPermissions,
    subAdminSidebarItems = [],
    isSubAdminSidebarLoading = false,
    subAdminSidebarError = null,
    refreshSubAdminSidebar,
  } = usePermissionContext();

  const isAdmin = role === "ADMIN";
  const isSubAdmin = role === "SUB_ADMIN";

  // Sub Admin permissions list provided by sub-admin-sidebar API, stored assignments, user profile, or backend
  const userPermissions = useMemo(() => {
    if (isAdmin) {
      return Object.values(PERMISSIONS);
    }

    if (!isSubAdmin) {
      return [];
    }

    const resolved = new Set();
    // Always allow basic personal dashboard and profile
    resolved.add(PERMISSIONS.DASHBOARD_VIEW);
    resolved.add(PERMISSIONS.PROFILE_VIEW);

    // Strictly resolve from dynamically permitted items from POST /sub-admin-sidebar
    if (Array.isArray(subAdminSidebarItems) && subAdminSidebarItems.length > 0) {
      subAdminSidebarItems.forEach((item) => {
        const actions = resolveSlugToActions(item);
        actions.forEach((act) => resolved.add(act));
      });
    }

    return Array.from(resolved);
  }, [isAdmin, isSubAdmin, subAdminSidebarItems]);

  const hasPermission = (permissionKey) => {
    if (isAdmin) return true;
    if (!permissionKey) return true;
    return userPermissions.includes(permissionKey);
  };

  const canAccessModule = (moduleKey) => {
    if (isAdmin) return true;
    if (
      moduleKey === MODULES.TEAM ||
      moduleKey === MODULES.CRM_UNASSIGNED ||
      moduleKey === MODULES.REPORTS
    ) {
      return false; // Strictly Admin only
    }

    // Basic account modules always accessible
    if (moduleKey === MODULES.DASHBOARD || moduleKey === MODULES.PROFILE) {
      return true;
    }

    if (isSubAdmin) {
      // While sub-admin sidebar items are loading, prevent unauthorized flash/access
      if (isSubAdminSidebarLoading) {
        return false;
      }

      // If sidebar request errored or returned empty, fail closed for permission-controlled modules
      if (subAdminSidebarError || !Array.isArray(subAdminSidebarItems) || subAdminSidebarItems.length === 0) {
        return false;
      }

      // Strictly check permitted items returned by POST /sub-admin-sidebar
      return hasModulePermission(subAdminSidebarItems, moduleKey);
    }

    const requiredPermission = MODULE_PERMISSION_MAP[moduleKey];
    return requiredPermission ? hasPermission(requiredPermission) : false;
  };

  const canPerformAction = (actionKey) => hasPermission(actionKey);

  // Territory restriction: dynamically from user, zero fake hardcoded defaults
  const assignedTerritories = useMemo(() => {
    if (isAdmin) return [];
    return Array.isArray(user?.territories) ? user.territories : [];
  }, [isAdmin, user]);

  const hasTerritoryAccess = (state, city) => {
    if (isAdmin) return true;
    if (!state) return true;
    const matchState = assignedTerritories.find(
      (t) => t.state.toLowerCase() === state.toLowerCase()
    );
    if (!matchState) return false;
    if (!matchState.cities || matchState.cities.length === 0 || matchState.cities.includes("ALL")) {
      return true;
    }
    if (!city) return true;
    return matchState.cities.some((c) => c.toLowerCase() === city.toLowerCase());
  };

  return {
    role,
    isAdmin,
    isSubAdmin,
    permissions: userPermissions,
    adminPermissionDefinitions,
    isDefinitionsLoading,
    definitionsError,
    refreshAdminPermissions,
    subAdminSidebarItems,
    isSubAdminSidebarLoading,
    subAdminSidebarError,
    refreshSubAdminSidebar,
    assignedTerritories,
    hasTerritoryAccess,
    hasPermission,
    canAccessModule,
    canPerformAction,
  };
};

export default usePermissions;
