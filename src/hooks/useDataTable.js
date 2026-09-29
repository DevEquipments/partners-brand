import { useState, useMemo, useCallback } from "react";

/**
 * Reusable data table management hook.
 * Handles client-side search, filtering, sorting, and selection.
 */
export const useDataTable = ({
  data = [],
  searchFields = [],
  initialSortBy = "newest",
  statusField = "status",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filter & Search processing
  const filteredData = useMemo(() => {
    let result = [...data];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => {
        const itemStatus = String(item[statusField] || "new").toLowerCase();
        return itemStatus === statusFilter.toLowerCase();
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const val = item[field];
          if (!val) return false;
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }
      if (sortBy === "name") {
        const nameA = a.name || a.full_name || "";
        const nameB = b.name || b.full_name || "";
        return nameA.localeCompare(nameB);
      }
      // default: newest
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [data, searchTerm, statusFilter, sortBy, searchFields, statusField]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts = { all: data.length, new: 0, contacted: 0, resolved: 0 };
    data.forEach((item) => {
      const st = String(item[statusField] || "new").toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts[st] = 1;
      }
    });
    return counts;
  }, [data, statusField]);

  // Selection handlers
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (pageItems) => {
      setSelectedIds((prev) => {
        const idsOnPage = pageItems.map((item) => item.id);
        const allSelected = idsOnPage.length > 0 && idsOnPage.every((id) => prev.has(id));

        const next = new Set(prev);
        if (allSelected) {
          idsOnPage.forEach((id) => next.delete(id));
        } else {
          idsOnPage.forEach((id) => next.add(id));
        }
        return next;
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (pageItems) => {
      if (!pageItems || pageItems.length === 0) return false;
      return pageItems.every((item) => selectedIds.has(item.id));
    },
    [selectedIds]
  );

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredData,
    statusCounts,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
};

export default useDataTable;
