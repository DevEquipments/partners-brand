import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { subAdminService } from "../services/subAdminService";
import { useBrand } from "./useBrand";
import { getApiErrorMessage } from "../utils/errorHandler";

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
        setSubAdmins(list);
        setLimits({
          allowed_sub_admins: result?.allowed_sub_admins ?? null,
          current_sub_admins: result?.current_sub_admins ?? null,
          remaining_sub_admins: result?.remaining_sub_admins ?? null,
          brand_id: result?.brand_id ?? null,
          brand_name: result?.brand_name ?? "",
        });
        setIsLimitsLoaded(
          result?.allowed_sub_admins !== null &&
          result?.allowed_sub_admins !== undefined &&
          result?.remaining_sub_admins !== null &&
          result?.remaining_sub_admins !== undefined
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
      if (isLimitsLoaded && limits.remaining_sub_admins !== null && limits.remaining_sub_admins <= 0) {
        const msg = `Brand has reached its Sub Admin account limit (${limits.allowed_sub_admins ?? "—"} allowed). 0 slots remaining.`;
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

        // Immediate feedback: if server returned updated limits in response.data, apply them
        if (response?.data) {
          const resData = response.data;
          const parseLimit = (val) => {
            if (val === undefined || val === null || val === "") return null;
            const num = Number(val);
            return Number.isFinite(num) ? num : null;
          };
          if (resData.allowed_sub_admins !== undefined || resData.remaining_sub_admins !== undefined) {
            setLimits((prev) => ({
              ...prev,
              allowed_sub_admins: parseLimit(resData.allowed_sub_admins) ?? prev.allowed_sub_admins,
              current_sub_admins: parseLimit(resData.current_sub_admins) ?? prev.current_sub_admins,
              remaining_sub_admins: parseLimit(resData.remaining_sub_admins) ?? prev.remaining_sub_admins,
            }));
          }
        }

        // Authoritative refresh: fetch latest list and limits from backend
        await fetchSubAdmins(true);

        return response;
      } catch (err) {
        // If server rejects because limit reached or other backend error, refresh to stay in sync with server state
        await fetchSubAdmins(true).catch(() => {});
        throw err;
      }
    },
    [brandId, limits, isLimitsLoaded, fetchSubAdmins]
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
    // Dynamic capacity limits from POST /get-subadmins
    limits,
    allowedSubAdmins: limits.allowed_sub_admins,
    currentSubAdmins: limits.current_sub_admins,
    remainingSubAdmins: limits.remaining_sub_admins,
    isLimitsLoaded,
    brandId: limits.brand_id || brandId,
    brandName: limits.brand_name,
  };
};

export default useSubAdmins;
