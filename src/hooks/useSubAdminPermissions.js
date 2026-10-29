import { useState, useEffect, useCallback, useMemo } from "react";
import {
  subAdminPermissionService,
  resolveRoleId,
  buildAssignedPermissionsMap,
} from "../services/subAdminPermissionService";
import { subAdminService } from "../services/subAdminService";
import { useBrand } from "./useBrand";
import { getApiErrorMessage } from "../utils/errorHandler";
import toast from "react-hot-toast";

/**
 * Hook for managing Sub Admin permission assignments.
 * Single source of truth driven directly by real backend APIs:
 * - POST /get-subadmins
 * - POST /get-premium-brand-permissions
 * - POST /sub-admin-sidebar
 * - POST /add-premium-brand-role-permission
 */
export const useSubAdminPermissions = (initialSubAdminId = null) => {
  const { brandId } = useBrand();

  const [definitions, setDefinitions] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(
    initialSubAdminId ? String(initialSubAdminId) : null
  );

  // Toggle state
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [assignedError, setAssignedError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Synchronize selectedSubAdminId when initialSubAdminId changes
  const [prevInitialId, setPrevInitialId] = useState(initialSubAdminId);
  if (prevInitialId !== initialSubAdminId) {
    setPrevInitialId(initialSubAdminId);
    if (initialSubAdminId && String(initialSubAdminId) !== String(selectedSubAdminId)) {
      setSelectedSubAdminId(String(initialSubAdminId));
    }
  }

  // Load initial catalog definitions and Sub Admins list
  const loadData = useCallback(async () => {
    if (!brandId) {
      setIsLoading(false);
      setError("Brand information is unavailable. Please re-authenticate.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [defs, data] = await Promise.all([
        subAdminPermissionService.fetchPermissionDefinitions(),
        subAdminService.fetchSubAdmins(brandId),
      ]);

      const subAdminsList = Array.isArray(data) ? data : data?.sub_admins || [];

      setDefinitions(defs);
      setSubAdmins(subAdminsList);

      // Prioritize explicit initialSubAdminId, then current selectedSubAdminId, then first available
      let targetAdmin = null;
      if (initialSubAdminId) {
        targetAdmin = subAdminsList.find((m) => String(m.id) === String(initialSubAdminId));
      }
      if (!targetAdmin && selectedSubAdminId) {
        targetAdmin = subAdminsList.find((m) => String(m.id) === String(selectedSubAdminId));
      }
      if (!targetAdmin && subAdminsList.length > 0) {
        targetAdmin = subAdminsList[0];
      }

      const targetId = targetAdmin ? String(targetAdmin.id) : null;
      setSelectedSubAdminId(targetId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load permissions. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [brandId, initialSubAdminId, selectedSubAdminId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Selected sub admin record
  const selectedSubAdmin = useMemo(() => {
    return subAdmins.find((m) => String(m.id) === String(selectedSubAdminId)) || null;
  }, [subAdmins, selectedSubAdminId]);

  // Dynamically resolved role ID
  const roleId = useMemo(() => {
    return resolveRoleId(selectedSubAdmin);
  }, [selectedSubAdmin]);

  // Asynchronously fetch assigned permissions whenever selected Sub Admin changes
  useEffect(() => {
    if (!selectedSubAdminId || definitions.length === 0) return;

    let isActive = true;

    const fetchPermissionsForSelection = async () => {
      const match = subAdmins.find((m) => String(m.id) === String(selectedSubAdminId));
      if (!match) return;

      const dynamicRoleId = resolveRoleId(match);

      // If Sub Admin has an assigned role, query /sub-admin-sidebar
      if (dynamicRoleId) {
        setIsLoadingAssigned(true);
        setAssignedError(null);

        try {
          const assignedList = await subAdminPermissionService.fetchAssignedPermissions(dynamicRoleId);
          if (isActive) {
            const map = buildAssignedPermissionsMap(definitions, assignedList);
            setPermissions({ ...map });
            setOriginalPermissions({ ...map });
            setAssignedError(null);
          }
        } catch (err) {
          if (isActive) {
            console.error("Failed to fetch assigned permissions:", err);
            setAssignedError(getApiErrorMessage(err, "Failed to load assigned permissions from server."));
            // Do NOT silently set all to false; keep in error state so user is aware
            setPermissions({});
            setOriginalPermissions({});
          }
        } finally {
          if (isActive) {
            setIsLoadingAssigned(false);
          }
        }
      } else {
        // No role_id returned by backend for this Sub Admin
        if (isActive) {
          setIsLoadingAssigned(false);
          setAssignedError(null);
          const emptyMap = buildAssignedPermissionsMap(definitions, []);
          setPermissions(emptyMap);
          setOriginalPermissions(emptyMap);
        }
      }
    };

    fetchPermissionsForSelection();

    return () => {
      isActive = false;
    };
  }, [selectedSubAdminId, definitions, subAdmins]);

  // Handle manual selection from dropdown
  const handleSelectSubAdmin = useCallback((id) => {
    const nextId = id ? String(id) : null;
    setSelectedSubAdminId(nextId);
    // Immediately clear previous toggles to prevent stale displays
    setPermissions({});
    setOriginalPermissions({});
    setAssignedError(null);
  }, []);

  // Toggle single permission
  const handlePermissionChange = useCallback((slug, nextVal) => {
    setPermissions((prev) => ({
      ...prev,
      [slug]: typeof nextVal === "boolean" ? nextVal : !prev[slug],
    }));
  }, []);

  // Compute if state was modified
  const isDirty = useMemo(() => {
    if (!originalPermissions || !permissions || Object.keys(originalPermissions).length === 0) return false;
    return definitions.some(
      (def) => Boolean(originalPermissions[def.slug]) !== Boolean(permissions[def.slug])
    );
  }, [definitions, originalPermissions, permissions]);

  // Cancel/Reset changes back to original loaded state
  const handleCancel = useCallback(() => {
    setPermissions({ ...originalPermissions });
    toast("Changes discarded", {
      id: "subadmin-permissions-toast",
    });
  }, [originalPermissions]);

  // Retry fetching assigned permissions
  const retryAssigned = useCallback(async () => {
    if (!roleId || definitions.length === 0) return;
    setIsLoadingAssigned(true);
    setAssignedError(null);

    try {
      const assignedList = await subAdminPermissionService.fetchAssignedPermissions(roleId);
      const map = buildAssignedPermissionsMap(definitions, assignedList);
      setPermissions({ ...map });
      setOriginalPermissions({ ...map });
      setAssignedError(null);
    } catch (err) {
      setAssignedError(getApiErrorMessage(err, "Failed to load assigned permissions from server."));
    } finally {
      setIsLoadingAssigned(false);
    }
  }, [roleId, definitions]);

  // Update permissions for the selected Sub Admin
  const handleSave = useCallback(async () => {
    if (!selectedSubAdminId || !selectedSubAdmin) {
      toast.error("Please select a Sub Admin first.", { id: "subadmin-permissions-toast" });
      return;
    }

    if (!roleId) {
      toast.error(
        `Cannot save: Sub Admin @${selectedSubAdmin.username || selectedSubAdminId} has no assigned role ID on the server.`,
        { id: "subadmin-permissions-toast" }
      );
      return;
    }

    if (!isDirty || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await subAdminPermissionService.savePermissions({
        subAdmin: selectedSubAdmin,
        permissions,
        definitions,
        originalPermissions,
      });

      if (res?.success) {
        // Refresh assigned permissions directly from the server to verify persistence and revocation
        try {
          const freshAssigned = await subAdminPermissionService.fetchAssignedPermissions(roleId);
          const freshMap = buildAssignedPermissionsMap(definitions, freshAssigned);

          // Check if any permission was intended to be disabled (OFF) but is still returned by server
          const unrevoked = definitions.filter(
            (def) => !permissions[def.slug] && freshMap[def.slug]
          );

          if (unrevoked.length > 0) {
            const unrevokedNames = unrevoked.map((d) => d.name).join(", ");
            toast.error(
              `The server saved enabled permissions, but failed to revoke (${unrevokedNames}).`,
              { id: "subadmin-permissions-toast", duration: 6000 }
            );
          } else {
            toast.success(res?.message || "Permissions updated successfully.", {
              id: "subadmin-permissions-toast",
            });
          }

          setPermissions({ ...freshMap });
          setOriginalPermissions({ ...freshMap });
        } catch {
          setOriginalPermissions({ ...permissions });
          toast.success(res?.message || "Permissions updated successfully.", {
            id: "subadmin-permissions-toast",
          });
        }
      } else {
        toast.error(res?.message || "Unable to update permissions.", {
          id: "subadmin-permissions-toast",
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to update permissions. Please try again."), {
        id: "subadmin-permissions-toast",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedSubAdminId, selectedSubAdmin, roleId, isDirty, isSaving, definitions, permissions, originalPermissions]);

  return {
    definitions,
    subAdmins,
    selectedSubAdminId,
    selectedSubAdmin,
    roleId,
    permissions,
    isDirty,
    isLoading,
    isLoadingAssigned,
    assignedError,
    isSaving,
    error,
    handleSelectSubAdmin,
    handlePermissionChange,
    handleCancel,
    handleSave,
    retry: loadData,
    retryAssigned,
  };
};

export default useSubAdminPermissions;
