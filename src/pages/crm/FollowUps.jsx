import { useState, useMemo } from "react";
import {
  Clock,
  Phone,
  Eye,
  RotateCcw,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import LeadDetail from "../../components/crm/LeadDetail";
import DataTable from "../../components/common/DataTable";
import TableToolbar from "../../components/common/TableToolbar";
import Button from "../../components/common/Button";

export const FollowUps = () => {
  const { leads, loading, refreshCRM } = useCRM();
  const [activeTab, setActiveTab] = useState("today"); // today, overdue, upcoming, all
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  // Group leads with follow-ups into categories
  const categorized = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const overdue = [];
    const today = [];
    const upcoming = [];
    const all = [];

    leads.forEach((l) => {
      if (!l.next_followup_at) return;
      all.push(l);

      const fDate = new Date(l.next_followup_at);
      const fDateStr = l.next_followup_at.slice(0, 10);

      if (fDateStr === todayStr) {
        today.push(l);
      } else if (fDate < now) {
        overdue.push(l);
      } else {
        upcoming.push(l);
      }
    });

    return { overdue, today, upcoming, all };
  }, [leads]);

  const rawList =
    activeTab === "today"
      ? categorized.today
      : activeTab === "overdue"
      ? categorized.overdue
      : activeTab === "upcoming"
      ? categorized.upcoming
      : categorized.all;

  const filteredFollowUps = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.toLowerCase();
    return rawList.filter(
      (l) =>
        (l.customer_name || "").toLowerCase().includes(q) ||
        (l.lead_code || "").toLowerCase().includes(q) ||
        (l.phone || "").includes(q) ||
        (l.city || "").toLowerCase().includes(q) ||
        (l.state || "").toLowerCase().includes(q) ||
        (l.next_followup_notes || "").toLowerCase().includes(q)
    );
  }, [rawList, searchTerm]);

  // Columns for DataTable
  const columns = [
    {
      key: "lead_code",
      label: "Lead & Customer",
      render: (code, row) => (
        <div>
          <span className="font-mono font-bold text-orange-600 dark:text-orange-400 block">
            {code || row.id}
          </span>
          <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
            {row.customer_name}
          </span>
        </div>
      ),
    },
    {
      key: "next_followup_at",
      label: "Scheduled Time",
      render: (time) => (
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {time ? new Date(time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-"}
        </span>
      ),
    },
    {
      key: "next_followup_notes",
      label: "Notes / Action Item",
      render: (notes) => (
        <p className="text-xs text-slate-600 dark:text-slate-400 italic max-w-xs line-clamp-1">
          {notes ? `"${notes}"` : "No specific notes provided"}
        </p>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (_, row) => (
        <div className="space-y-0.5">
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{row.phone}</span>
            </a>
          )}
          <span className="text-[11px] text-slate-400 block">
            {row.contact_person || "Primary Contact"}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_, row) => (
        <span className="text-slate-600 dark:text-slate-400">
          {row.city ? `${row.city}, ` : ""}{row.state || "-"}
        </span>
      ),
    },
    {
      key: "assigned_name",
      label: "Owner",
      render: (name) => (
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {name || "Unassigned"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLead(row);
            }}
            icon={Eye}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const tabs = [
    { value: "today", label: "Due Today", count: categorized.today.length },
    { value: "overdue", label: "Overdue", count: categorized.overdue.length },
    { value: "upcoming", label: "Upcoming", count: categorized.upcoming.length },
    { value: "all", label: "All Follow-ups", count: categorized.all.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Customer Follow-ups</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize customer callbacks, site inspections, and quote check-ins.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshCRM}
          icon={RotateCcw}
        >
          Refresh
        </Button>
      </div>

      {/* Unified TableToolbar */}
      <TableToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search customer, phone, location, notes..."
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasActiveFilters={Boolean(searchTerm.trim())}
        onClear={() => setSearchTerm("")}
      />

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredFollowUps}
        isLoading={loading}
        emptyTitle="No follow-ups found"
        emptyDescription="There are no scheduled follow-ups matching this category."
        rowKey="id"
        onRowClick={(lead) => setSelectedLead(lead)}
      />

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetail
          isOpen={Boolean(selectedLead)}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
        />
      )}
    </div>
  );
};

export default FollowUps;
