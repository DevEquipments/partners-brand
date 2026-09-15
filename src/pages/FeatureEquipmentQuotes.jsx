import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  MapPin,
  Info,
} from "lucide-react";
import { getProductQuotations } from "../services/productQuotation";
import { useAuth } from "../context/AuthContext";
import { useBrand } from "../hooks/useBrand";
import { useDataTable } from "../hooks/useDataTable";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import FilterBar from "../components/common/FilterBar";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Drawer from "../components/common/Drawer";
import StatusBadge from "../components/common/StatusBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { formatDate, formatDateTime, formatRole } from "../utils/formatters";
import { getPhoneLink, getEmailLink, getWhatsAppLink } from "../utils/contactLinks";
import { exportToCsv } from "../utils/exportCsv";
import toast from "react-hot-toast";

export const FeatureEquipmentQuotes = () => {
  const { token } = useAuth();
  const { brandId, brandName } = useBrand();
  const { hasPermission } = usePermissions();

  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected quote for drawer
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Local priority & status state
  const [localData, setLocalData] = useState({});

  const canExport = hasPermission(PERMISSIONS.QUOTES_EXPORT);
  const canUpdate = hasPermission(PERMISSIONS.QUOTES_UPDATE);

  const fetchQuotes = useCallback(
    async (targetPage = 1, isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const response = await getProductQuotations({
          brand_id: brandId,
          page: targetPage,
          token,
        });

        const records = Array.isArray(response?.data) ? response.data : [];
        setQuotes(records);
        setLastPage(Number(response?.last_page || 1));
        setTotalRecords(Number(response?.total_records || records.length));
        setPage(targetPage);
      } catch (err) {
        const msg =
          err?.message ||
          err?.response?.data?.message ||
          "Failed to load equipment quotation requests.";
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [brandId, token]
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await fetchQuotes(1);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [fetchQuotes]);

  // Enrich raw quotes with local status & priority
  const enrichedQuotes = useMemo(() => {
    return quotes.map((item) => {
      const overrides = localData[item.id] || {};
      return {
        ...item,
        status: overrides.status || item.status || "new",
        priority: overrides.priority || item.priority || "medium",
      };
    });
  }, [quotes, localData]);

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
  } = useDataTable({
    data: enrichedQuotes,
    searchFields: ["full_name", "email", "phone_no", "model_name", "location", "brand_name"],
    initialSortBy: "newest",
    statusField: "status",
  });

  // Export filtered or selected records
  const handleExport = () => {
    if (!canExport) {
      toast.error("You do not have permission to export quotation records.");
      return;
    }

    const rowsToExport =
      selectedIds.size > 0
        ? filteredData.filter((item) => selectedIds.has(item.id))
        : filteredData;

    if (rowsToExport.length === 0) {
      toast.error("No quotation records to export.");
      return;
    }

    const columns = [
      { key: "id", label: "Quote ID" },
      { key: "full_name", label: "Customer Name" },
      { key: "email", label: "Email" },
      { key: "phone_no", label: "Phone" },
      { key: "product_id", label: "Product ID" },
      { key: "brand_name", label: "Brand" },
      { key: "model_name", label: "Equipment Model" },
      { key: "location", label: "Location" },
      { key: "role", label: "Customer Role", transform: (val) => formatRole(val) },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "created_at", label: "Requested Date", transform: (val) => formatDate(val) },
    ];

    exportToCsv(`equipment_quotes_${brandId || "brand"}`, columns, rowsToExport);
    toast.success(`Exported ${rowsToExport.length} quotes to CSV.`);
  };

  // Local state update
  const handleUpdateRecord = (id, changes) => {
    setLocalData((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...changes },
    }));
    setSelectedQuote((prev) => (prev?.id === id ? { ...prev, ...changes } : prev));
    toast.success("Updated record details (Session state).");
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        key: "full_name",
        label: "Customer",
        render: (_, row) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={row.full_name} size="sm" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                {row.full_name || "Buyer"}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {formatRole(row.role)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "model_name",
        label: "Requested Equipment",
        render: (_, row) => (
          <div className="space-y-0.5 min-w-0">
            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
              {row.model_name || row.brand_name || "Featured Product"}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {row.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {row.location}
                </span>
              )}
              {row.product_id && <span>ID: {row.product_id}</span>}
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        label: "Contact",
        render: (_, row) => (
          <div className="space-y-0.5 min-w-0">
            {row.phone_no && (
              <a
                href={getPhoneLink(row.phone_no)}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{row.phone_no}</span>
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
        key: "priority",
        label: "Priority",
        render: (val) => <PriorityBadge priority={val || "medium"} size="sm" />,
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
            onClick={() => setSelectedQuote(row)}
            className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="View quote details"
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
        title="Feature Equipment Quotes"
        subtitle={`Product quotation requests for ${brandName} featured inventory`}
        breadcrumbs={[{ label: "Operations" }, { label: "Feature Equipment Quotes" }]}
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
              onClick={() => fetchQuotes(page, true)}
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
        searchPlaceholder="Search buyer, model, phone, email, location..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        statusOptions={[
          { value: "all", label: "All Quotes" },
          { value: "new", label: "New" },
          { value: "contacted", label: "Contacted" },
          { value: "resolved", label: "Resolved" },
        ]}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchQuotes(page)}
        selectable
        selectedIds={selectedIds}
        onSelectRow={toggleSelect}
        onSelectAll={toggleSelectAll}
        onRowClick={(row) => setSelectedQuote(row)}
        emptyTitle="No equipment quotes found"
        emptyDescription="No quotation requests match your current search and filter settings."
      />

      {/* Pagination */}
      {!isLoading && !error && totalRecords > 0 && (
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          totalRecords={totalRecords}
          onPageChange={(targetPage) => fetchQuotes(targetPage)}
        />
      )}

      {/* Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        title={selectedQuote?.full_name || "Quotation Request"}
        subtitle={`Quote #${selectedQuote?.id || ""}`}
        footer={
          <div className="flex items-center gap-2">
            {selectedQuote?.phone_no && (
              <>
                <a
                  href={getWhatsAppLink(
                    selectedQuote.phone_no,
                    `Hello ${selectedQuote.full_name}, regarding your quotation request for ${selectedQuote.model_name} on Equipments Dekho...`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={getPhoneLink(selectedQuote.phone_no)}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
              </>
            )}
            {selectedQuote?.email && (
              <a
                href={getEmailLink(
                  selectedQuote.email,
                  `Equipments Dekho Quote Request - ${selectedQuote.model_name}`
                )}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg border border-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            )}
          </div>
        }
      >
        {selectedQuote && (
          <div className="space-y-6">
            {/* Equipment Image & Name */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40">
              {selectedQuote.image ? (
                <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={selectedQuote.image}
                    alt={selectedQuote.model_name || "Equipment"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ) : null}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    {selectedQuote.brand_name || brandName}
                  </span>
                  <PriorityBadge priority={selectedQuote.priority || "medium"} size="xs" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedQuote.model_name || "Featured Product Model"}
                </h4>
                {selectedQuote.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedQuote.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Details */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Customer Information
              </h5>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-xs">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedQuote.full_name || "Not provided"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Buyer Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatRole(selectedQuote.role)}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedQuote.phone_no || "Not provided"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {selectedQuote.email || "Not provided"}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Request Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDateTime(selectedQuote.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Priority and Status Toggles */}
            {canUpdate && (
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Lead Qualification
                </h5>

                {/* Status Toggles */}
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                    Status (Session state)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["new", "contacted", "resolved"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateRecord(selectedQuote.id, { status: st })}
                        className={`h-8 text-xs font-semibold rounded-lg border transition-all cursor-pointer capitalize ${
                          selectedQuote.status === st
                            ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Toggles */}
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                    Priority Rating
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["high", "medium", "low"].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => handleUpdateRecord(selectedQuote.id, { priority: pr })}
                        className={`h-8 text-xs font-semibold rounded-lg border transition-all cursor-pointer capitalize ${
                          selectedQuote.priority === pr
                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Status updates reflect within your current active session. Server-side persistence API will synchronize when released.
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

export default FeatureEquipmentQuotes;
