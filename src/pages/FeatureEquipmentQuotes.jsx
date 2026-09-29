import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  RefreshCw,
  Phone,
  Eye,
  MapPin,
} from "lucide-react";
import { getProductQuotations } from "../services/productQuotation";
import { useAuth } from "../context/AuthContext";
import { useBrand } from "../hooks/useBrand";
import { useDataTable } from "../hooks/useDataTable";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import { useCRM } from "../context/CRMContext";
import PageHeader from "../components/common/PageHeader";
import TableToolbar from "../components/common/TableToolbar";
import DataTable from "../components/common/DataTable";
import LeadDetail from "../components/crm/LeadDetail";
import StatusBadge from "../components/common/StatusBadge";
import PriorityBadge from "../components/common/PriorityBadge";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { formatDate, formatRole } from "../utils/formatters";
import { getPhoneLink } from "../utils/contactLinks";
import { exportToCsv } from "../utils/exportCsv";
import { getApiErrorMessage } from "../utils/errorHandler";
import toast from "react-hot-toast";

export const FeatureEquipmentQuotes = () => {
  const { token } = useAuth();
  const { brandId, brandName } = useBrand();
  const { hasPermission } = usePermissions();
  const { leads } = useCRM();

  const [quotes, setQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected quote mapped to CRM Lead structure for drawer
  const [selectedLead, setSelectedLead] = useState(null);

  const canExport = hasPermission(PERMISSIONS.QUOTES_EXPORT);

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
        const msg = getApiErrorMessage(err, "Failed to load equipment quotation requests.");
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

  // Enrich raw quotes with CRM Lead repository ownership & metadata
  const enrichedQuotes = useMemo(() => {
    return quotes.map((item) => {
      const matchCrmLead = leads.find(
        (l) => String(l.id) === String(item.id) || l.phone === (item.phone_no || item.phone)
      );

      return {
        ...item,
        status: item.status || matchCrmLead?.status || "new",
        priority: item.priority || matchCrmLead?.priority || "medium",
        assigned_name: matchCrmLead?.assigned_name || null,
        assigned_to: matchCrmLead?.assigned_to || null,
        state: matchCrmLead?.state || item.state || "Maharashtra",
        city: matchCrmLead?.city || item.location || "Mumbai",
        pipeline_stage: matchCrmLead?.pipeline_stage || "new",
      };
    });
  }, [quotes, leads]);

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
    searchFields: ["full_name", "email", "phone_no", "model_name", "location", "brand_name", "city", "state"],
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
      { key: "model_name", label: "Equipment Model" },
      { key: "state", label: "Territory State" },
      { key: "city", label: "City" },
      { key: "assigned_name", label: "Lead Owner" },
      { key: "role", label: "Customer Role", transform: (val) => formatRole(val) },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "created_at", label: "Requested Date", transform: (val) => formatDate(val) },
    ];

    exportToCsv(`equipment_quotes_${brandId || "brand"}`, columns, rowsToExport);
    toast.success(`Exported ${rowsToExport.length} quotes to CSV.`);
  };

  const handleOpenLeadDetail = (row) => {
    const crmLead = {
      id: row.id,
      lead_code: `QTE-${row.id}`,
      type: "equipment_quote",
      customer_name: row.full_name,
      contact_person: row.full_name,
      phone: row.phone_no || row.phone,
      email: row.email,
      state: row.state,
      city: row.city || row.location,
      equipment_interest: row.model_name || "Featured Equipment",
      model_name: row.model_name,
      product_id: row.product_id,
      message: `Buyer inquiry for ${row.model_name}. Role: ${row.role || "Contractor"}`,
      pipeline_stage: row.pipeline_stage,
      status: row.status,
      priority: row.priority === "high" ? "hot" : row.priority === "low" ? "cold" : "warm",
      assigned_to: row.assigned_to,
      assigned_name: row.assigned_name,
      created_at: row.created_at,
    };
    setSelectedLead(crmLead);
  };

  // Columns definition
  const columns = useMemo(
    () => [
      {
        key: "full_name",
        label: "Customer & Role",
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
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {row.city ? `${row.city}, ` : ""}{row.state}
              </span>
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
        key: "assigned_name",
        label: "Lead Owner",
        render: (val) => (
          val ? (
            <span className="font-medium text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {val}
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">
              Unassigned
            </span>
          )
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLeadDetail(row);
            }}
            icon={Eye}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  const tabs = [
    { value: "all", label: "All Quotes", count: statusCounts.all || enrichedQuotes.length },
    { value: "new", label: "New", count: statusCounts.new || 0 },
    { value: "contacted", label: "Contacted", count: statusCounts.contacted || 0 },
    { value: "resolved", label: "Resolved", count: statusCounts.resolved || 0 },
  ];

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all" || sortBy !== "newest");

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Feature Equipment Quotes"
        subtitle={`Product quotation requests for ${brandName} featured inventory with territorial assignment`}
        breadcrumbs={[{ label: "Lead Management" }, { label: "Feature Equipment Quotes" }]}
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

      {/* Unified TableToolbar */}
      <TableToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search buyer, model, phone, email, territory..."
        tabs={tabs}
        activeTab={statusFilter}
        onTabChange={setStatusFilter}
        filters={[
          {
            key: "sort",
            label: "Sort By",
            placeholder: "Sort by...",
            value: sortBy,
            onChange: setSortBy,
            options: [
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "name", label: "Customer Name" },
            ],
            isClearable: false,
            width: "w-40",
          },
        ]}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setSortBy("newest");
        }}
      />

      {/* Main DataTable with integrated Pagination */}
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
        onRowClick={(row) => handleOpenLeadDetail(row)}
        emptyTitle="No equipment quotes found"
        emptyDescription="No quotation requests match your current search and filter settings."
        pagination={
          !isLoading && !error && totalRecords > 0
            ? {
                currentPage: page,
                totalPages: lastPage,
                totalRecords: totalRecords,
                onPageChange: (targetPage) => fetchQuotes(targetPage),
              }
            : null
        }
      />

      {/* Unified CRM Lead 360 Drawer */}
      <LeadDetail
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
      />
    </div>
  );
};

export default FeatureEquipmentQuotes;
