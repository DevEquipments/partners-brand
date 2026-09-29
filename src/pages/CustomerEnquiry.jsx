import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  RefreshCw,
  Phone,
  Eye,
} from "lucide-react";
import { getPremiumBrandInquiries } from "../services/inquiryApi";
import { useBrand } from "../hooks/useBrand";
import { useDataTable } from "../hooks/useDataTable";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import { useCRM } from "../context/CRMContext";
import PageHeader from "../components/common/PageHeader";
import TableToolbar from "../components/common/TableToolbar";
import DataTable from "../components/common/DataTable";
import LeadDetail from "../components/crm/LeadDetail";
import StatusBadge from "../components/common/StatusBadge";
import Button from "../components/common/Button";
import Avatar from "../components/common/Avatar";
import { formatDate } from "../utils/formatters";
import { getPhoneLink } from "../utils/contactLinks";
import { exportToCsv } from "../utils/exportCsv";
import { getApiErrorMessage } from "../utils/errorHandler";
import toast from "react-hot-toast";

export const CustomerEnquiry = () => {
  const { brandId, brandName } = useBrand();
  const { hasPermission } = usePermissions();
  const { leads } = useCRM();

  const [inquiries, setInquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Selected inquiry mapped to CRM Lead model for detail drawer
  const [selectedLead, setSelectedLead] = useState(null);

  const canExport = hasPermission(PERMISSIONS.ENQUIRIES_EXPORT);

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
        const msg = getApiErrorMessage(err, "Failed to load customer enquiries.");
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

  // Merge real backend API data with local CRM repository assignment/metadata
  const enrichedInquiries = useMemo(() => {
    return inquiries.map((item) => {
      const matchCrmLead = leads.find(
        (l) => String(l.id) === String(item.id) || l.phone === (item.mobile || item.phone)
      );

      return {
        ...item,
        status: item.status || matchCrmLead?.status || "new",
        assigned_name: matchCrmLead?.assigned_name || null,
        assigned_to: matchCrmLead?.assigned_to || null,
        state: matchCrmLead?.state || item.state || "Maharashtra",
        city: matchCrmLead?.city || item.city || "Pune",
        pipeline_stage: matchCrmLead?.pipeline_stage || "new",
        priority: matchCrmLead?.priority || "warm",
      };
    });
  }, [inquiries, leads]);

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
    data: enrichedInquiries,
    searchFields: ["name", "email", "mobile", "message", "city", "state"],
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
      { key: "state", label: "State Territory" },
      { key: "city", label: "City" },
      { key: "assigned_name", label: "Assigned Sub Admin" },
      { key: "message", label: "Customer Requirement" },
      { key: "status", label: "Current Status" },
      { key: "created_at", label: "Received Date", transform: (val) => formatDate(val) },
    ];

    exportToCsv(`customer_enquiries_${brandId || "brand"}`, columns, rowsToExport);
    toast.success(`Exported ${rowsToExport.length} enquiries to CSV.`);
  };

  const handleOpenLeadDetail = (row) => {
    const crmLead = {
      id: row.id,
      lead_code: `ENQ-${row.id}`,
      type: "customer_enquiry",
      customer_name: row.name,
      contact_person: row.name,
      phone: row.mobile || row.phone,
      email: row.email,
      state: row.state,
      city: row.city,
      equipment_interest: row.message?.slice(0, 40) || "General OEM Inquiry",
      message: row.message,
      pipeline_stage: row.pipeline_stage,
      status: row.status,
      priority: row.priority,
      assigned_to: row.assigned_to,
      assigned_name: row.assigned_name,
      created_at: row.created_at,
    };
    setSelectedLead(crmLead);
  };

  // Data table column definitions
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Customer & ID",
        render: (_, row) => (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={row.name} size="sm" />
            <div className="min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">
                {row.name || "Customer"}
              </span>
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-mono block truncate">
                #ENQ-{row.id}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        label: "Contact & Location",
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
            <span className="text-[11px] text-slate-400 block truncate">
              {row.city ? `${row.city}, ` : ""}{row.state}
            </span>
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
    { value: "all", label: "All Enquiries", count: statusCounts.all || enrichedInquiries.length },
    { value: "new", label: "New", count: statusCounts.new || 0 },
    { value: "contacted", label: "Contacted", count: statusCounts.contacted || 0 },
    { value: "resolved", label: "Resolved", count: statusCounts.resolved || 0 },
  ];

  const hasActiveFilters = Boolean(searchTerm.trim() || statusFilter !== "all" || sortBy !== "newest");

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Customer Enquiry"
        subtitle={`Direct buyer product enquiries received for ${brandName} with CRM territory routing`}
        breadcrumbs={[{ label: "Lead Management" }, { label: "Customer Enquiry" }]}
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

      {/* Unified TableToolbar */}
      <TableToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search customer, phone, city, requirement..."
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
        onRetry={() => fetchEnquiries(page)}
        selectable
        selectedIds={selectedIds}
        onSelectRow={toggleSelect}
        onSelectAll={toggleSelectAll}
        onRowClick={(row) => handleOpenLeadDetail(row)}
        emptyTitle="No customer enquiries found"
        emptyDescription="No enquiries matched your search or filter settings."
        pagination={
          !isLoading && !error && totalRecords > 0
            ? {
                currentPage: page,
                totalPages: lastPage,
                totalRecords: totalRecords,
                onPageChange: (targetPage) => fetchEnquiries(targetPage),
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

export default CustomerEnquiry;
