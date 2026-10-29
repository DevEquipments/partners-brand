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

  // Sub Admin dynamic sidebar state from POST /sub-admin-sidebar
  const [subAdminSidebarItems, setSubAdminSidebarItems] = useState([]);
  const [isSubAdminSidebarLoading, setIsSubAdminSidebarLoading] = useState(() => Boolean(isSubAdmin && token));
  const [subAdminSidebarError, setSubAdminSidebarError] = useState(null);

  // Main Admin: Fetch permission definitions
  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !isAdmin || !token) {
      return;
    }

    const loadAdmin = async () => {
      try {
        const defs = await permissionManagementService.fetchPermissionDefinitions();
        if (isMounted) {
          setAdminPermissionDefinitions(Array.isArray(defs) ? defs : []);
          setDefinitionsError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Failed to fetch admin permission definitions:", err.message);
          setDefinitionsError(err.message || "Failed to load permissions");
          setAdminPermissionDefinitions([]);
        }
      } finally {
        if (isMounted) {
          setIsDefinitionsLoading(false);
        }
      }
    };

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, token]);

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
      setSubAdminSidebarItems([]);
      setIsSubAdminSidebarLoading(false);
      setSubAdminSidebarError(null);
    }
  }

  // Refresh Admin definitions
  const refreshAdminPermissions = useCallback(async () => {
    if (!isAdmin || !token) {
      setAdminPermissionDefinitions([]);
      setIsDefinitionsLoading(false);
      return [];
    }

    setIsDefinitionsLoading(true);
    setDefinitionsError(null);

    try {
      const defs = await permissionManagementService.fetchPermissionDefinitions();
      setAdminPermissionDefinitions(Array.isArray(defs) ? defs : []);
      return defs;
    } catch (err) {
      console.warn("Failed to refresh admin permission definitions:", err.message);
      setDefinitionsError(err.message || "Failed to load permissions");
      setAdminPermissionDefinitions([]);
      return [];
    } finally {
      setIsDefinitionsLoading(false);
    }
  }, [isAdmin, token]);

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
