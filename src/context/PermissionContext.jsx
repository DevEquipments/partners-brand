import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { permissionManagementService } from "../services/permissionManagementService";
import { subAdminSidebarService } from "../services/subAdminSidebarService";
import { extractRoleIdFromRecord } from "../services/subAdminService";

const PermissionContext = createContext(null);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { token, user, isAdmin, isSubAdmin, isAuthenticated } = useAuth();

  // Admin dynamic definitions state
  const [adminPermissionDefinitions, setAdminPermissionDefinitions] = useState([]);
  const [isDefinitionsLoading, setIsDefinitionsLoading] = useState(() => Boolean(isAdmin && token));
  const [definitionsError, setDefinitionsError] = useState(null);

  // Admin assigned permissions state from POST /sub-admin-sidebar
  const [adminAssignedPermissions, setAdminAssignedPermissions] = useState([]);
  const [isAdminAssignedLoading, setIsAdminAssignedLoading] = useState(() => Boolean(isAdmin && token));
  const [adminAssignedError, setAdminAssignedError] = useState(null);

  // Sub Admin dynamic sidebar state from POST /sub-admin-sidebar
  const [subAdminSidebarItems, setSubAdminSidebarItems] = useState([]);
  const [isSubAdminSidebarLoading, setIsSubAdminSidebarLoading] = useState(() => Boolean(isSubAdmin && token));
  const [subAdminSidebarError, setSubAdminSidebarError] = useState(null);

  // Main Admin: Fetch permission definitions and Admin's assigned permissions
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !isAdmin || !token) {
      return;
    }

    const loadAdmin = async () => {
      try {
        setIsDefinitionsLoading(true);
        setIsAdminAssignedLoading(true);

        const activeRoleId = extractRoleIdFromRecord(user);

        const [defs, assigned] = await Promise.all([
          permissionManagementService.fetchPermissionDefinitions().catch((err) => {
            console.warn("Failed to fetch admin permission definitions:", err.message);
            return [];
          }),
          activeRoleId
            ? subAdminSidebarService.fetchSubAdminSidebar({ role_id: activeRoleId }).catch((err) => {
                console.warn("Failed to fetch admin assigned sidebar permissions:", err.message);
                return [];
              })
            : Promise.resolve([]),
        ]);

        if (isMounted) {
          setAdminPermissionDefinitions(Array.isArray(defs) ? defs : []);
          setDefinitionsError(null);
          setAdminAssignedPermissions(Array.isArray(assigned) ? assigned : []);
          setAdminAssignedError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to load admin permission data:", err.message);
          setDefinitionsError(err.message || "Failed to load permissions");
        }
      } finally {
        if (isMounted) {
          setIsDefinitionsLoading(false);
          setIsAdminAssignedLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, token, user]);

  // Sub Admin: Dynamically resolve role ID from authenticated user
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !isSubAdmin || !token) {
      return;
    }

    const loadSubAdmin = async () => {
      const activeRoleId = extractRoleIdFromRecord(user);

      if (!activeRoleId) {
        if (isMounted) {
          setSubAdminSidebarItems([]);
          setSubAdminSidebarError("Sub Admin account has no assigned role ID on the server.");
          setIsSubAdminSidebarLoading(false);
        }
        return;
      }

      try {
        const items = await subAdminSidebarService.fetchSubAdminSidebar({ role_id: activeRoleId });
        if (isMounted) {
          setSubAdminSidebarItems(Array.isArray(items) ? items : []);
          setSubAdminSidebarError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to fetch Sub Admin sidebar:", err.message);
          setSubAdminSidebarError(err.message || "Failed to load sidebar navigation");
          setSubAdminSidebarItems([]);
        }
      } finally {
        if (isMounted) {
          setIsSubAdminSidebarLoading(false);
        }
      }
    };

    loadSubAdmin();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isSubAdmin, token, user]);

  // Reset states on session termination / logout
  const [prevToken, setPrevToken] = useState(token);
  if (prevToken !== token) {
    setPrevToken(token);
    if (!token) {
      setAdminPermissionDefinitions([]);
      setIsDefinitionsLoading(false);
      setDefinitionsError(null);
      setAdminAssignedPermissions([]);
      setIsAdminAssignedLoading(false);
      setAdminAssignedError(null);
      setSubAdminSidebarItems([]);
      setIsSubAdminSidebarLoading(false);
      setSubAdminSidebarError(null);
    }
  }

  // Refresh Admin definitions and assigned permissions
  const refreshAdminPermissions = useCallback(async () => {
    if (!isAdmin || !token) {
      setAdminPermissionDefinitions([]);
      setIsDefinitionsLoading(false);
      setAdminAssignedPermissions([]);
      setIsAdminAssignedLoading(false);
      return { definitions: [], assigned: [] };
    }

    setIsDefinitionsLoading(true);
    setIsAdminAssignedLoading(true);
    setDefinitionsError(null);
    setAdminAssignedError(null);

    const activeRoleId = extractRoleIdFromRecord(user);

    try {
      const [defs, assigned] = await Promise.all([
        permissionManagementService.fetchPermissionDefinitions().catch((err) => {
          console.warn("Failed to refresh admin permission definitions:", err.message);
          setDefinitionsError(err.message || "Failed to load permissions");
          return [];
        }),
        activeRoleId
          ? subAdminSidebarService.fetchSubAdminSidebar({ role_id: activeRoleId }).catch((err) => {
              console.warn("Failed to refresh admin assigned sidebar permissions:", err.message);
              setAdminAssignedError(err.message || "Failed to load assigned permissions");
              return [];
            })
          : Promise.resolve([]),
      ]);

      const normalizedDefs = Array.isArray(defs) ? defs : [];
      const normalizedAssigned = Array.isArray(assigned) ? assigned : [];

      setAdminPermissionDefinitions(normalizedDefs);
      setAdminAssignedPermissions(normalizedAssigned);

      return { definitions: normalizedDefs, assigned: normalizedAssigned };
    } finally {
      setIsDefinitionsLoading(false);
      setIsAdminAssignedLoading(false);
    }
  }, [isAdmin, token, user]);

  // Refresh Sub Admin sidebar items
  const refreshSubAdminSidebar = useCallback(async () => {
    if (!isSubAdmin || !token) {
      setSubAdminSidebarItems([]);
      setIsSubAdminSidebarLoading(false);
      return [];
    }

    const activeRoleId = extractRoleIdFromRecord(user);
    if (!activeRoleId) {
      setSubAdminSidebarItems([]);
      setSubAdminSidebarError("Sub Admin account has no assigned role ID on the server.");
      setIsSubAdminSidebarLoading(false);
      return [];
    }

    setIsSubAdminSidebarLoading(true);
    setSubAdminSidebarError(null);

    try {
      const items = await subAdminSidebarService.fetchSubAdminSidebar({ role_id: activeRoleId });
      setSubAdminSidebarItems(Array.isArray(items) ? items : []);
      return items;
    } catch (err) {
      console.warn("Failed to refresh Sub Admin sidebar:", err.message);
      setSubAdminSidebarError(err.message || "Failed to load sidebar navigation");
      setSubAdminSidebarItems([]);
      return [];
    } finally {
      setIsSubAdminSidebarLoading(false);
    }
  }, [isSubAdmin, token, user]);

  const value = {
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
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
