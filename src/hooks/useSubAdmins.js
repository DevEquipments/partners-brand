import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { subAdminService } from "../services/subAdminService";
import { useBrand } from "./useBrand";
import { getApiErrorMessage } from "../utils/errorHandler";
import { isSubAdminActive } from "../utils/subAdminStatus";

/**
 * Hook for managing Sub Admin accounts and live account limits from real API
 */
export const useSubAdmins = () => {
  const { brandId } = useBrand();

  const [subAdmins, setSubAdmins] = useState([]);
  const [limits, setLimits] = useState({
    allowed_sub_admins: null,
    current_sub_admins: null,
    remaining_sub_admins: null,
    brand_id: null,
    brand_name: "",
  });
  const [isLimitsLoaded, setIsLimitsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(null);
  const [updatingSubAdminIds, setUpdatingSubAdminIds] = useState(new Set());

  // Track latest brand and request to prevent race conditions and stale cross-brand states
  const latestBrandIdRef = useRef(brandId);
  useEffect(() => {
    latestBrandIdRef.current = brandId;
  }, [brandId]);
  const requestIdRef = useRef(0);

  const fetchSubAdmins = useCallback(
    async (isManual = false) => {
      if (!brandId) {
        setIsLoading(false);
        setError("Brand information is unavailable. Please re-authenticate.");
        setSubAdmins([]);
        setLimits({
          allowed_sub_admins: null,
          current_sub_admins: null,
          remaining_sub_admins: null,
          brand_id: null,
          brand_name: "",
        });
        setIsLimitsLoaded(false);
        return;
      }

      const currentReqId = ++requestIdRef.current;

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        // Clear previous brand limit values so stale data is never shown
        setLimits({
          allowed_sub_admins: null,
          current_sub_admins: null,
          remaining_sub_admins: null,
          brand_id: null,
          brand_name: "",
        });
        setIsLimitsLoaded(false);
      }
      setError(null);

      try {
        const result = await subAdminService.fetchSubAdmins(brandId);

        // Ignore response if brand changed or newer request started
        if (latestBrandIdRef.current !== brandId || currentReqId !== requestIdRef.current) {
          return;
        }

        const list = Array.isArray(result) ? result : (result?.sub_admins || []);
        const allowed = result?.allowed_sub_admins ?? null;
        const currentCount = list.length;
        const remaining = allowed !== null ? Math.max(0, allowed - currentCount) : (result?.remaining_sub_admins ?? null);

        setSubAdmins(list);
        setLimits({
          allowed_sub_admins: allowed,
          current_sub_admins: currentCount,
          remaining_sub_admins: remaining,
          brand_id: result?.brand_id ?? null,
          brand_name: result?.brand_name ?? "",
        });
        setIsLimitsLoaded(
          allowed !== null &&
          allowed !== undefined
        );
      } catch (err) {
        if (latestBrandIdRef.current !== brandId || currentReqId !== requestIdRef.current) {
          return;
        }
        const msg = getApiErrorMessage(err, "Failed to load Sub Admin accounts from server.");
        setError(msg);
        setIsLimitsLoaded(false);
      } finally {
        if (currentReqId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [brandId]
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await fetchSubAdmins(false);
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [fetchSubAdmins]);

  // Selected sub admin object
  const selectedSubAdmin = useMemo(() => {
    if (!selectedSubAdminId) return null;
    return subAdmins.find((m) => String(m.id) === String(selectedSubAdminId)) || null;
  }, [subAdmins, selectedSubAdminId]);

  const selectSubAdmin = useCallback((id) => {
    setSelectedSubAdminId(id);
  }, []);

  const clearSelectedSubAdmin = useCallback(() => {
    setSelectedSubAdminId(null);
  }, []);

  const createSubAdmin = useCallback(
    async (formData) => {
      // Pre-check capacity limit before sending request
      const allowed = limits.allowed_sub_admins;
      const currentCount = subAdmins.length;
      const remaining = allowed !== null ? Math.max(0, allowed - currentCount) : limits.remaining_sub_admins;

      if (isLimitsLoaded && remaining !== null && remaining <= 0) {
        const msg = `Brand has reached its Sub Admin account limit (${allowed ?? "—"} allowed). 0 slots remaining.`;
        throw new Error(msg);
      }

      const activeBrandId = limits.brand_id || brandId;
      const activeBrandName = limits.brand_name || "";

      const payload = {
        brand_id: activeBrandId,
        brand_name: activeBrandName,
        ...formData,
      };

      try {
        const response = await subAdminService.createSubAdmin(payload);

        // Optimistically construct the newly created operator record
        const newRecord = {
          id: response?.data?.id || response?.sub_admin_id || `temp-${Date.now()}`,
          username: formData.username,
          email: formData.email,
          phone_no: formData.phone_no,
          company_name: formData.company_name,
          office_address: formData.office_address,
          gst: formData.gst,
          brand_id: activeBrandId,
          brand_name: activeBrandName,
          status: "Active",
          status_text: "Active",
          ...(response?.data || {}),
        };

        // Instantly prepend new operator to local list (0ms latency UI update)
        setSubAdmins((prev) => {
          const exists = prev.some((item) => String(item.id) === String(newRecord.id));
          if (exists) return prev;
          const nextList = [newRecord, ...prev];

          // Instantly update capacity limit counters in sync with the new list
          setLimits((prevLimits) => {
            const limAllowed = prevLimits.allowed_sub_admins;
            const limCurrent = nextList.length;
            const limRemaining =
              limAllowed !== null ? Math.max(0, limAllowed - limCurrent) : (prevLimits.remaining_sub_admins !== null ? Math.max(0, prevLimits.remaining_sub_admins - 1) : null);
            return {
              ...prevLimits,
              current_sub_admins: limCurrent,
              remaining_sub_admins: limRemaining,
            };
          });

          return nextList;
        });

        // Background reconcile from server to guarantee sync
        fetchSubAdmins(true).catch(() => {});

        return response;
      } catch (err) {
        // If server rejects, refresh to reconcile with server state
        await fetchSubAdmins(true).catch(() => {});
        throw err;
      }
    },
    [brandId, limits, subAdmins.length, isLimitsLoaded, fetchSubAdmins]
  );

  const updateSubAdminStatus = useCallback(
    async (id, newStatus) => {
      if (id === undefined || id === null || String(id).trim() === "") {
        throw new Error("Sub Admin ID is required.");
      }

      const numericId = Number(id);
      const targetId = Number.isNaN(numericId) ? String(id).trim() : numericId;

      // Prevent duplicate in-flight requests for this sub-admin
      if (updatingSubAdminIds.has(targetId)) {
        return;
      }

      const cleanStatus =
        newStatus === 1 ||
        newStatus === "1" ||
        (typeof newStatus === "string" && newStatus.trim().toLowerCase() === "active") ||
        newStatus === true
          ? 1
          : 0;

      setUpdatingSubAdminIds((prev) => new Set(prev).add(targetId));

      try {
        const response = await subAdminService.updateSubAdminStatus({
          id: targetId,
          status: cleanStatus,
        });

        const serverMsg =
          response?.message ||
          (cleanStatus === 1
            ? "Sub-admin activated successfully."
            : "Sub-admin deactivated successfully.");
        toast.success(serverMsg, { id: `status-update-${targetId}` });

        // Extract returned status fields from backend response if available
        const resData = response?.data;
        const confirmedActive =
          resData?.status !== undefined
            ? isSubAdminActive(resData.status, resData.status_text)
            : cleanStatus === 1;
        const normalizedStatusString = confirmedActive ? "Active" : "Inactive";

        // Optimistically update local list with server-confirmed status
        setSubAdmins((prevList) =>
          prevList.map((item) => {
            if (String(item.id) === String(targetId)) {
              return {
                ...item,
                status: normalizedStatusString,
                status_text: normalizedStatusString,
              };
            }
            return item;
          })
        );

        return response;
      } catch (err) {
        const errorMsg = getApiErrorMessage(err, "Failed to update Sub Admin status.");
        if (!err?.toastShown) {
          toast.error(errorMsg, { id: `status-update-err-${targetId}` });
        }
        throw err;
      } finally {
        setUpdatingSubAdminIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      }
    },
    [updatingSubAdminIds]
  );

  return {
    subAdmins,
    isLoading,
    isRefreshing,
    error,
    selectedSubAdminId,
    selectedSubAdmin,
    selectSubAdmin,
    clearSelectedSubAdmin,
    refreshSubAdmins: () => fetchSubAdmins(true),
    retry: () => fetchSubAdmins(false),
    createSubAdmin,
    updateSubAdminStatus,
    updatingSubAdminIds,
    isUpdatingSubAdmin: (id) =>
      updatingSubAdminIds.has(id) || updatingSubAdminIds.has(Number(id)),
    editSubAdminLocal: (id, updatedData) => {
      setSubAdmins((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? { ...item, ...updatedData } : item
        )
      );
    },
    deleteSubAdminLocal: (id) => {
      setSubAdmins((prev) => {
        const nextList = prev.filter((item) => String(item.id) !== String(id));
        setLimits((prevLimits) => {
          const allowed = prevLimits.allowed_sub_admins;
          const newCurrent = nextList.length;
          const newRemaining =
            allowed !== null
              ? Math.max(0, allowed - newCurrent)
              : prevLimits.remaining_sub_admins !== null
              ? prevLimits.remaining_sub_admins + 1
              : null;
          return {
            ...prevLimits,
            current_sub_admins: newCurrent,
            remaining_sub_admins: newRemaining,
          };
        });
        return nextList;
      });
    },
    // Dynamic capacity limits
    limits,
    allowedSubAdmins: limits.allowed_sub_admins,
    currentSubAdmins: subAdmins.length,
    remainingSubAdmins:
      limits.allowed_sub_admins !== null
        ? Math.max(0, limits.allowed_sub_admins - subAdmins.length)
        : limits.remaining_sub_admins,
    isLimitsLoaded,
    brandId: limits.brand_id || brandId,
    brandName: limits.brand_name,
  };
};

export default useSubAdmins;
