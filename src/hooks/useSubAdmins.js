import { useState, useEffect, useCallback, useMemo } from "react";
import { subAdminService } from "../services/subAdminService";
import { useBrand } from "./useBrand";
import { getApiErrorMessage } from "../utils/errorHandler";

/**
 * Hook for managing Sub Admin accounts from real API
 */
export const useSubAdmins = () => {
  const { brandId } = useBrand();

  const [subAdmins, setSubAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubAdminId, setSelectedSubAdminId] = useState(null);

  const fetchSubAdmins = useCallback(
    async (isManual = false) => {
      if (!brandId) {
        setIsLoading(false);
        setError("Brand information is unavailable. Please re-authenticate.");
        return;
      }

      if (isManual) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await subAdminService.fetchSubAdmins(brandId);
        setSubAdmins(data);
      } catch (err) {
        const msg = getApiErrorMessage(err, "Failed to load Sub Admin accounts from server.");
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
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
  };
};

export default useSubAdmins;
