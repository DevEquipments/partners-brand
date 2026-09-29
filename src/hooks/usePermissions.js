import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { usePermissionContext } from "../context/PermissionContext";
import { PERMISSIONS, MODULES, MODULE_PERMISSION_MAP } from "../config/permissions";
import { subAdminPermissionService } from "../services/subAdminPermissionService";
import { resolveSlugToActions, hasModulePermission } from "../utils/permissionResolver";

export { PERMISSIONS, MODULES };

export const usePermissions = () => {
  const { user, role } = useAuth();

  const {
    adminPermissionDefinitions = [],
    isDefinitionsLoading = false,
    definitionsError = null,
    refreshAdminPermissions,
  } = usePermissionContext();

  const isAdmin = role === "ADMIN";
  const isSubAdmin = role === "SUB_ADMIN";

  // Sub Admin permissions list provided by stored assignments, user profile, or backend
  const userPermissions = useMemo(() => {
    if (isAdmin) {
      return Object.values(PERMISSIONS);
    }

    if (!isSubAdmin) {
      return [];
    }

    // 1. Check if module permissions were configured and saved for this specific Sub Admin
    const storedPerms = user?.id ? subAdminPermissionService.getStoredPermissions(user.id) : null;
    if (storedPerms && typeof storedPerms === "object") {
      const resolved = new Set();
      // Always allow basic personal dashboard and profile
      resolved.add(PERMISSIONS.DASHBOARD_VIEW);
      resolved.add(PERMISSIONS.PROFILE_VIEW);

      for (const [slug, isEnabled] of Object.entries(storedPerms)) {
        if (isEnabled) {
          const actions = resolveSlugToActions(slug);
          actions.forEach((act) => resolved.add(act));
        }
      }

      return Array.from(resolved);
    }

    // 2. Fall back to raw permissions array if returned by backend login/profile
    const rawPerms = user?.permissions;
    if (Array.isArray(rawPerms) && rawPerms.length > 0) {
      const resolved = new Set();
      // Always allow dashboard and profile for authenticated Sub Admin
      resolved.add(PERMISSIONS.DASHBOARD_VIEW);
      resolved.add(PERMISSIONS.PROFILE_VIEW);

      rawPerms.forEach((item) => {
        const str = typeof item === "string" ? item : item?.slug || item?.name || "";
        const clean = str.trim().toLowerCase();

        // Exact match against known permission keys
        if (Object.values(PERMISSIONS).includes(str)) {
          resolved.add(str);
        }

        // Slug / module-level mapping
        if (clean.includes("enquir") || clean.includes("inquir")) {
          resolved.add(PERMISSIONS.ENQUIRIES_VIEW);
          resolved.add(PERMISSIONS.ENQUIRIES_UPDATE);
        }
        if (clean.includes("quote") && !clean.includes("quotation")) {
          resolved.add(PERMISSIONS.QUOTES_VIEW);
          resolved.add(PERMISSIONS.QUOTES_UPDATE);
        }
        if (clean.includes("lead")) {
          resolved.add(PERMISSIONS.LEADS_VIEW);
          resolved.add(PERMISSIONS.LEADS_UPDATE);
        }
        if (clean.includes("followup") || clean.includes("follow_up") || clean.includes("follow-up")) {
          resolved.add(PERMISSIONS.FOLLOWUPS_VIEW);
          resolved.add(PERMISSIONS.FOLLOWUPS_CREATE);
          resolved.add(PERMISSIONS.FOLLOWUPS_UPDATE);
        }
        if (clean.includes("quotation")) {
          resolved.add(PERMISSIONS.QUOTATIONS_VIEW);
        }
      });

      return Array.from(resolved);
    }

    // 3. When no permissions are found for Sub Admin, provide only basic account views.
    return [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.PROFILE_VIEW,
    ];
  }, [isAdmin, isSubAdmin, user]);

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

    const storedPerms = user?.id ? subAdminPermissionService.getStoredPermissions(user.id) : null;
    const activePerms = storedPerms || user?.permissions;
    if (activePerms) {
      return hasModulePermission(activePerms, moduleKey);
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
    assignedTerritories,
    hasTerritoryAccess,
    hasPermission,
    canAccessModule,
    canPerformAction,
  };
};

export default usePermissions;
