import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  RefreshCw,
  Phone,
  Mail,
  Eye,
  CheckSquare,
  Info,
} from "lucide-react";
import { getPremiumBrandInquiries } from "../services/inquiryApi";
import { useBrand } from "../hooks/useBrand";
import { useDataTable } from "../hooks/useDataTable";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import FilterBar from "../components/common/FilterBar";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Drawer from "../components/common/Drawer";
import StatusBadge from "../components/common/StatusBadge";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { formatDate, formatDateTime } from "../utils/formatters";
import { getPhoneLink, getEmailLink } from "../utils/contactLinks";
import { exportToCsv } from "../utils/exportCsv";
import toast from "react-hot-toast";

export const CustomerEnquiry = () => {
  const { brandId, brandName } = useBrand();
  const { hasPermission } = usePermissions();

  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected inquiry for detail drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Local UI status state (since backend status persistence endpoint is pending)
  const [localStatuses, setLocalStatuses] = useState({});

  const canExport = hasPermission(PERMISSIONS.ENQUIRIES_EXPORT);
  const canUpdate = hasPermission(PERMISSIONS.ENQUIRIES_UPDATE);

  const fetchEnquiries = useCallback(
    async (targetPage = 1, isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const response = await getPremiumBrandInquiries({
          brand_id: brandId,
          page: targetPage,
        });

        const records = Array.isArray(response?.data) ? response.data : [];
        setInquiries(records);
        setLastPage(Number(response?.last_page || 1));
        setTotalRecords(Number(response?.total_records || records.length));
        setPage(targetPage);
      } catch (err) {
        const msg =
          err?.message ||
          err?.response?.data?.message ||
          "Failed to load customer enquiries.";
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
        await fetchEnquiries(1);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [fetchEnquiries]);

  // Enrich raw inquiries with local status state
  const enrichedInquiries = useMemo(() => {
    return inquiries.map((item) => ({
      ...item,
      status: localStatuses[item.id] || item.status || "new",
    }));
  }, [inquiries, localStatuses]);

  // Reusable data table management
  const {
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
  } = useDataTable({
    data: enrichedInquiries,
    searchFields: ["name", "email", "mobile", "message"],
    initialSortBy: "newest",
    statusField: "status",
  });

  // Export filtered or selected rows
  const handleExport = () => {
    if (!canExport) {
      toast.error("You do not have permission to export customer enquiries.");
      return;
    }

    const rowsToExport =
      selectedIds.size > 0
        ? filteredData.filter((item) => selectedIds.has(item.id))
        : filteredData;

    if (rowsToExport.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    const columns = [
      { key: "id", label: "Enquiry ID" },
      { key: "name", label: "Customer Name" },
      { key: "email", label: "Customer Email" },
      { key: "mobile", label: "Customer Phone" },
      { key: "message", label: "Customer Requirement" },
      { key: "brand_id", label: "Brand Code" },
      { key: "created_at", label: "Received Date", transform: (val) => formatDate(val) },
      { key: "status", label: "Current Status" },
    ];

    exportToCsv(`customer_enquiries_${brandId || "brand"}`, columns, rowsToExport);
    toast.success(`Exported ${rowsToExport.length} enquiries to CSV.`);
  };

  // Status toggle handler
  const handleStatusChange = (id, newStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [id]: newStatus }));
    setSelectedEnquiry((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev));
    toast.success(`Status updated to ${newStatus} (Local session state)`);
  };

  // Bulk status update
  const handleBulkStatus = (newStatus) => {
    const nextStatuses = {};
    selectedIds.forEach((id) => {
      nextStatuses[id] = newStatus;
    });
    setLocalStatuses((prev) => ({ ...prev, ...nextStatuses }));
    clearSelection();
    toast.success(`Updated ${selectedIds.size} records to ${newStatus}.`);
  };

  // Data table column definitions
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Customer",
        render: (_, row) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={row.name} size="sm" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                {row.name || "Customer"}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                #{row.id}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        label: "Contact",
        render: (_, row) => (
          <div className="space-y-0.5 min-w-0">
            {row.mobile && (
              <a
                href={getPhoneLink(row.mobile)}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{row.mobile}</span>
              </a>
            )}
            {row.email && (
              <span className="text-[11px] text-slate-400 block truncate">
                {row.email}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "message",
        label: "Requirement Message",
        render: (val) => (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xs">
            {val || "-"}
          </p>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (val) => <StatusBadge status={val || "new"} size="sm" />,
      },
      {
        key: "created_at",
        label: "Received",
        render: (val) => (
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {formatDate(val)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        align: "right",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => setSelectedEnquiry(row)}
            className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Customer Enquiry"
        subtitle={`Direct buyer product enquiries received for ${brandName}`}
        breadcrumbs={[{ label: "Operations" }, { label: "Customer Enquiry" }]}
        actions={
          <div className="flex items-center gap-2">
            {canExport && (
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
                disabled={isLoading || filteredData.length === 0}
              >
                Export CSV
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              isLoading={isRefreshing}
              onClick={() => fetchEnquiries(page, true)}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search customer, phone, email, message..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        statusOptions={[
          { value: "all", label: "All Enquiries" },
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "resolved", label: "Resolved" },
        ]}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Bulk Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl text-xs text-orange-900 dark:text-orange-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-orange-600" />
            <span className="font-bold">{selectedIds.size} enquiries selected</span>
          </div>

          <div className="flex items-center gap-2">
            {canUpdate && (
              <>
                <span className="text-[11px] text-slate-500">Mark as:</span>
                <button
                  type="button"
                  onClick={() => handleBulkStatus("contacted")}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 transition-colors cursor-pointer"
                >
                  Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkStatus("resolved")}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer"
                >
                  Resolved
                </button>
              </>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchEnquiries(page)}
        selectable
        selectedIds={selectedIds}
        onSelectRow={toggleSelect}
        onSelectAll={toggleSelectAll}
        onRowClick={(row) => setSelectedEnquiry(row)}
        emptyTitle="No customer enquiries found"
        emptyDescription="No enquiries matched your search or filter settings."
      />

      {/* Pagination */}
      {!isLoading && !error && totalRecords > 0 && (
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          totalRecords={totalRecords}
          onPageChange={(targetPage) => fetchEnquiries(targetPage)}
        />
      )}

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        title={selectedEnquiry?.name || "Customer Enquiry Details"}
        subtitle={`Enquiry #${selectedEnquiry?.id || ""}`}
        footer={
          <div className="flex items-center gap-3">
            {selectedEnquiry?.mobile && (
              <a
                href={getPhoneLink(selectedEnquiry.mobile)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </a>
            )}
            {selectedEnquiry?.email && (
              <a
                href={getEmailLink(
                  selectedEnquiry.email,
                  `Equipments Dekho Requirement #${selectedEnquiry.id}`
                )}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            )}
          </div>
        }
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              <Avatar name={selectedEnquiry.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selectedEnquiry.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedEnquiry.status || "new"} size="xs" />
                  <span className="text-[11px] text-slate-400">
                    ID: #{selectedEnquiry.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Contact Information
              </h5>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedEnquiry.mobile || "Not provided"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {selectedEnquiry.email || "Not provided"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Brand Code</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                    {selectedEnquiry.brand_id || brandId}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDateTime(selectedEnquiry.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirement Message */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Requirement Details
              </h5>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message || "No specific requirement message specified by customer."}
              </div>
            </div>

            {/* Status Selector */}
            {canUpdate && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Update Local Status
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {["new", "contacted", "resolved"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedEnquiry.id, st)}
                      className={`h-9 text-xs font-semibold rounded-lg border transition-all cursor-pointer capitalize ${
                        selectedEnquiry.status === st
                          ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Status changes reflect within your current session. Backend persistence endpoint is currently in development.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerEnquiry;
