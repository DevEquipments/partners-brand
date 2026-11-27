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
    adminAssignedPermissions = [],
    isAdminAssignedLoading = false,
    adminAssignedError = null,
    refreshAdminPermissions,
    subAdminSidebarItems = [],
    isSubAdminSidebarLoading = false,
    subAdminSidebarError = null,
    refreshSubAdminSidebar,
  } = usePermissionContext();

  const isAdmin = role === "ADMIN";
  const isSubAdmin = role === "SUB_ADMIN";

  // Dynamic user permissions list derived strictly from role and backend assignments
  const userPermissions = useMemo(() => {
    const resolved = new Set();
    // Basic dashboard & profile always available
    resolved.add(PERMISSIONS.DASHBOARD_VIEW);
    resolved.add(PERMISSIONS.PROFILE_VIEW);

    if (isAdmin) {
      // Core Admin capabilities
      resolved.add(PERMISSIONS.PROFILE_EDIT);
      resolved.add(PERMISSIONS.SUBADMINS_MANAGE);
      resolved.add(PERMISSIONS.TERRITORIES_MANAGE);
      resolved.add(PERMISSIONS.ASSIGNMENT_MANAGE);
      resolved.add(PERMISSIONS.PERMISSIONS_MANAGE);
      resolved.add(PERMISSIONS.REPORTS_VIEW);
      resolved.add(PERMISSIONS.REPORTS_CREATE);
      resolved.add(PERMISSIONS.REPORTS_EDIT);
      resolved.add(PERMISSIONS.REPORTS_DELETE);
      resolved.add(PERMISSIONS.REPORTS_EXPORT);

      // If backend provides assigned permissions for Admin, resolve them
      if (Array.isArray(adminAssignedPermissions) && adminAssignedPermissions.length > 0) {
        adminAssignedPermissions.forEach((item) => {
          const actions = resolveSlugToActions(item);
          actions.forEach((act) => resolved.add(act));
        });
      } else {
        // Fallback: If no custom restriction assigned to Admin, grant CRM permissions
        Object.values(PERMISSIONS).forEach((perm) => resolved.add(perm));
      }

      return Array.from(resolved);
    }

    if (!isSubAdmin) {
      return Array.from(resolved);
    }

    // Strictly resolve from dynamically permitted items from POST /sub-admin-sidebar
    if (Array.isArray(subAdminSidebarItems) && subAdminSidebarItems.length > 0) {
      subAdminSidebarItems.forEach((item) => {
        const actions = resolveSlugToActions(item);
        actions.forEach((act) => resolved.add(act));
      });
    }

    return Array.from(resolved);
  }, [isAdmin, isSubAdmin, adminAssignedPermissions, subAdminSidebarItems]);

  const hasPermission = (permissionKey) => {
    if (!permissionKey) return true;
    return userPermissions.includes(permissionKey);
  };

  const canAccessModule = (moduleKey) => {
    // Basic account modules always accessible
    if (moduleKey === MODULES.DASHBOARD || moduleKey === MODULES.PROFILE) {
      return true;
    }

    if (isAdmin) {
      // Primary administrative modules always accessible to Admin
      if (
        moduleKey === MODULES.TEAM ||
        moduleKey === MODULES.PERMISSIONS ||
        moduleKey === MODULES.CRM_UNASSIGNED ||
        moduleKey === MODULES.REPORTS
      ) {
        return true;
      }

      // If backend has assigned specific CRM modules for this Admin, respect them
      if (Array.isArray(adminAssignedPermissions) && adminAssignedPermissions.length > 0) {
        return hasModulePermission(adminAssignedPermissions, moduleKey);
      }

      return true;
    }

    if (isSubAdmin) {
      if (
        moduleKey === MODULES.TEAM ||
        moduleKey === MODULES.PERMISSIONS ||
        moduleKey === MODULES.CRM_UNASSIGNED ||
        moduleKey === MODULES.REPORTS
      ) {
        return false; // Strictly Admin only
      }

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
    adminAssignedPermissions,
    isAdminAssignedLoading,
    adminAssignedError,
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
