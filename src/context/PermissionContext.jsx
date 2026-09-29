import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { permissionManagementService } from "../services/permissionManagementService";

const PermissionContext = createContext(null);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used within a PermissionProvider");
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { token, isAdmin, isAuthenticated } = useAuth();

  const [adminPermissionDefinitions, setAdminPermissionDefinitions] = useState([]);
  const [isDefinitionsLoading, setIsDefinitionsLoading] = useState(() => Boolean(isAdmin && token));
  const [definitionsError, setDefinitionsError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated || !isAdmin || !token) {
      return;
    }

    const load = async () => {
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

    load();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, token]);

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

  const value = {
    adminPermissionDefinitions,
    isDefinitionsLoading,
    definitionsError,
    refreshAdminPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;
