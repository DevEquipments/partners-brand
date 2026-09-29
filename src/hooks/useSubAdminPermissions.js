import { useState, useEffect, useCallback, useMemo } from "react";
import { subAdminPermissionService } from "../services/subAdminPermissionService";
import { useBrand } from "./useBrand";
import { getApiErrorMessage } from "../utils/errorHandler";
import toast from "react-hot-toast";

export const useSubAdminPermissions = (initialSubAdminId = null) => {
  const { brandId } = useBrand();

  const [definitions, setDefinitions] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(
    initialSubAdminId ? String(initialSubAdminId) : null
  );
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Helper to resolve permission map for a specific Sub Admin
  const getSubAdminPermissionMap = useCallback(
    (targetId, adminList, defs) => {
      if (!targetId) return {};

      const stored = subAdminPermissionService.getStoredPermissions(targetId);
      const match = adminList.find((m) => String(m.id) === String(targetId));

      const base = stored || match?.assignedPermissions || {};
      const result = {};

      defs.forEach((def) => {
        result[def.slug] = Boolean(base[def.slug]);
      });

      return result;
    },
    []
  );

  // Handle switching selected sub admin with per-user permission isolation
  const handleSelectSubAdmin = useCallback(
    (id) => {
      const targetId = id ? String(id) : null;
      setSelectedSubAdminId(targetId);

      if (!targetId) {
        setPermissions({});
        setOriginalPermissions({});
        return;
      }

      const map = getSubAdminPermissionMap(targetId, subAdmins, definitions);
      setPermissions({ ...map });
      setOriginalPermissions({ ...map });
    },
    [subAdmins, definitions, getSubAdminPermissionMap]
  );

  // Load dynamic definitions and Sub Admins using real backend APIs
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
        subAdminPermissionService.fetchSubAdmins(brandId),
      ]);

      setDefinitions(defs);
      setSubAdmins(data);

      const targetId =
        (initialSubAdminId && String(initialSubAdminId)) ||
        (selectedSubAdminId && String(selectedSubAdminId)) ||
        (data.length > 0 ? String(data[0].id) : null);

      if (targetId) {
        setSelectedSubAdminId(targetId);
        const map = getSubAdminPermissionMap(targetId, data, defs);
        setPermissions({ ...map });
        setOriginalPermissions({ ...map });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load permissions. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [brandId, initialSubAdminId, selectedSubAdminId, getSubAdminPermissionMap]);

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

  // Toggle single permission
  const handlePermissionChange = useCallback((slug, nextVal) => {
    setPermissions((prev) => ({
      ...prev,
      [slug]: typeof nextVal === "boolean" ? nextVal : !prev[slug],
    }));
  }, []);

  // Compute if state was modified for the currently selected sub admin
  const isDirty = useMemo(() => {
    if (!originalPermissions || !permissions) return false;
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

  // Update permissions for the selected Sub Admin
  const handleSave = useCallback(async () => {
    if (!selectedSubAdminId) {
      toast.error("Please select a Sub Admin first.", { id: "subadmin-permissions-toast" });
      return;
    }

    if (!isDirty || isSaving) {
      return;
    }

    const changedSlugs = definitions
      .map((d) => d.slug)
      .filter((slug) => Boolean(permissions[slug]) !== Boolean(originalPermissions[slug]));

    if (changedSlugs.length === 0) {
      toast("No permission changes to save.", {
        id: "subadmin-permissions-toast",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await subAdminPermissionService.savePermissions(
        selectedSubAdminId,
        permissions,
        originalPermissions
      );

      if (res?.success) {
        setOriginalPermissions({ ...permissions });
        toast.success(res?.message || "Permissions updated successfully.", {
          id: "subadmin-permissions-toast",
        });
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
  }, [selectedSubAdminId, isDirty, isSaving, definitions, permissions, originalPermissions]);

  return {
    definitions,
    subAdmins,
    selectedSubAdminId,
    selectedSubAdmin,
    permissions,
    isDirty,
    isLoading,
    isSaving,
    error,
    handleSelectSubAdmin,
    handlePermissionChange,
    handleCancel,
    handleSave,
    retry: loadData,
  };
};

export default useSubAdminPermissions;
