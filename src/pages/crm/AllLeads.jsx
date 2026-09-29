import { useState, useMemo } from "react";
import {
  Download,
  MapPin,
  UserCheck,
  RefreshCw,
  Layers,
  Eye,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../context/AuthContext";
import LeadDetail from "../../components/crm/LeadDetail";
import DataTable from "../../components/common/DataTable";
import TableToolbar from "../../components/common/TableToolbar";
import Button from "../../components/common/Button";
import {
  LEAD_STATUS_OPTIONS,
  LEAD_PRIORITY_CONFIG,
  getLeadStatusBadge,
} from "../../config/crmStatuses";
import { formatDate } from "../../utils/dateUtils";
import { exportToCsv } from "../../utils/exportCsv";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Sources" },
  { value: "customer_enquiry", label: "Customer Enquiries" },
  { value: "equipment_quote", label: "Equipment Quotes" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "hot", label: "Hot Priority" },
  { value: "warm", label: "Warm Priority" },
  { value: "cold", label: "Cold Priority" },
];

export const AllLeads = () => {
  const { leads, loading, refreshCRM } = useCRM();
  const { canPerformAction, isAdmin } = usePermissions();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "unassigned" | "my"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState(null);

  // Tab counts
  const unassignedCount = useMemo(() => {
    return leads.filter((l) => !l.assigned_to).length;
  }, [leads]);

  const myLeadsCount = useMemo(() => {
    return leads.filter((l) => String(l.assigned_to) === String(user?.id)).length;
  }, [leads, user]);

  // Filtered Leads list
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Tab filter
      if (activeTab === "unassigned" && lead.assigned_to) {
        return false;
      }
      if (activeTab === "my" && String(lead.assigned_to) !== String(user?.id)) {
        return false;
      }

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          (lead.customer_name || "").toLowerCase().includes(query) ||
          (lead.contact_person || "").toLowerCase().includes(query) ||
          (lead.phone || "").includes(query) ||
          (lead.lead_code || "").toLowerCase().includes(query) ||
          (lead.equipment_interest || "").toLowerCase().includes(query) ||
          (lead.city || "").toLowerCase().includes(query) ||
          (lead.state || "").toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Status
      if (statusFilter !== "ALL") {
        const leadSt = (lead.status || lead.pipeline_stage || "new").toLowerCase();
        if (leadSt !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Priority
      if (priorityFilter !== "ALL" && lead.priority !== priorityFilter) {
        return false;
      }

      // Type
      if (typeFilter !== "ALL" && lead.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [leads, activeTab, searchTerm, statusFilter, priorityFilter, typeFilter, user]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    activeTab !== "all" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    typeFilter !== "ALL"
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setTypeFilter("ALL");
  };

  const handleExport = () => {
    const exportData = filteredLeads.map((l) => ({
      "Lead Code": l.lead_code,
      Type: l.type === "customer_enquiry" ? "Customer Enquiry" : "Equipment Quote",
      Customer: l.customer_name,
      Contact: l.contact_person,
      Phone: l.phone,
      State: l.state,
      City: l.city,
      Equipment: l.equipment_interest,
      Status: l.status || l.pipeline_stage || "new",
      Priority: l.priority,
      "Assigned To": l.assigned_name || "Unassigned",
      Created: formatDate(l.created_at),
    }));
    exportToCsv(exportData, `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Columns definition for DataTable
  const columns = [
    {
      key: "lead_code",
      label: "Lead Code",
      sortable: true,
      render: (code, lead) => (
        <span className="font-mono font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
          {code || lead.id}
        </span>
      ),
    },
    {
      key: "customer_name",
      label: "Customer & Contact",
      sortable: true,
      render: (customer, lead) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {customer}
          </p>
          <p className="text-[11px] text-slate-400">
            {lead.phone} • {lead.contact_person || "Contact Person"}
          </p>
        </div>
      ),
    },
    {
      key: "equipment_interest",
      label: "Equipment & Location",
      render: (equip, lead) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {equip || lead.model_name || "General Machinery"}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{lead.city ? `${lead.city}, ` : ""}{lead.state}</span>
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (st, lead) => {
        const badge = getLeadStatusBadge(st || lead.pipeline_stage);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      render: (pr, lead) => {
        const priority = LEAD_PRIORITY_CONFIG[pr || lead.priority] || {};
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priority.badgeClass || "bg-slate-100 text-slate-600 border-slate-200"}`}
          >
            {priority.label || pr || "Warm"}
          </span>
        );
      },
    },
    {
      key: "assigned_name",
      label: "Lead Owner",
      render: (owner) => (
        owner ? (
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{owner}</span>
          </div>
        ) : (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 italic">
            Unassigned
          </span>
        )
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (created) => (
        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formatDate(created)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (_, lead) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLead(lead);
          }}
          icon={Eye}
        >
          View
        </Button>
      ),
    },
  ];

  // Quick tabs configuration
  const tabs = [
    { value: "all", label: "All Leads", count: leads.length },
    ...(isAdmin
      ? [{ value: "unassigned", label: "Unassigned", count: unassignedCount }]
      : [{ value: "my", label: "My Leads", count: myLeadsCount }]),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <span>Customer Leads</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized queue of inbound inquiries, equipment quotes, and customer requirements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCRM}
            icon={RefreshCw}
            title="Refresh Leads"
          >
            Refresh
          </Button>

          {canPerformAction("leads:export") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              icon={Download}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Unified TableToolbar */}
      <TableToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Code, customer, phone, city..."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filters={[
          {
            key: "type",
            label: "Lead Source",
            placeholder: "Filter source...",
            value: typeFilter,
            onChange: (val) => setTypeFilter(val || "ALL"),
            options: TYPE_OPTIONS,
            isClearable: false,
            width: "w-44",
          },
          {
            key: "status",
            label: "Status",
            placeholder: "Filter status...",
            value: statusFilter === "ALL" ? "all" : statusFilter,
            onChange: (val) => setStatusFilter(val === "all" ? "ALL" : val || "ALL"),
            options: LEAD_STATUS_OPTIONS,
            isClearable: false,
            width: "w-40",
          },
          {
            key: "priority",
            label: "Priority",
            placeholder: "Filter priority...",
            value: priorityFilter,
            onChange: (val) => setPriorityFilter(val || "ALL"),
            options: PRIORITY_OPTIONS,
            isClearable: false,
            width: "w-40",
          },
        ]}
        hasActiveFilters={hasActiveFilters}
        onClear={handleClearFilters}
      />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        isLoading={loading}
        emptyTitle="No leads found"
        emptyDescription="There are no customer leads matching the selected filter criteria."
        rowKey="id"
        onRowClick={(lead) => setSelectedLead(lead)}
      />

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <LeadDetail
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
        />
      )}
    </div>
  );
};

export default AllLeads;
