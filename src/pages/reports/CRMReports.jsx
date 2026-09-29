import { useMemo } from "react";
import {
  BarChart3,
  MapPin,
  Users,
  Download,
  ShieldAlert,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useBrand } from "../../hooks/useBrand";
import { usePermissions } from "../../hooks/usePermissions";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { exportToCsv } from "../../utils/exportCsv";

export const CRMReports = () => {
  const { isAdmin } = usePermissions();
  const { leads, quotations, teamMembers } = useCRM();
  const { brandName } = useBrand();

  // Metrics by Territory State
  const stateCounts = useMemo(() => {
    const counts = {};
    leads.forEach((l) => {
      const st = l.state || "Unspecified";
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  // Performance by Sub Admin
  const subAdminPerformance = useMemo(() => {
    return teamMembers.map((member) => {
      const memberLeads = leads.filter((l) => String(l.assigned_to) === String(member.id));
      const closedWon = memberLeads.filter(
        (l) => l.pipeline_stage === "won" || l.status === "closed_won" || l.status === "deal_closed"
      ).length;
      const conversionRate = memberLeads.length > 0 ? ((closedWon / memberLeads.length) * 100).toFixed(1) : "0.0";

      return {
        ...member,
        totalLeads: memberLeads.length,
        closedWon,
        conversionRate,
      };
    });
  }, [teamMembers, leads]);

  const handleExportPerformance = () => {
    const data = subAdminPerformance.map((m) => ({
      Operator: m.name,
      Username: m.username,
      "Locations Managed": (m.locations || m.territories)?.map((t) => t.state).join(", ") || "None",
      "Total Assigned Leads": m.totalLeads,
      "Deals Won": m.closedWon,
      "Conversion Rate (%)": `${m.conversionRate}%`,
    }));
    exportToCsv(data, `operator_performance_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const performanceColumns = [
    {
      key: "name",
      label: "Sub Admin",
      render: (name, op) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="text-[11px] text-slate-400">
            {(op.locations || op.territories)?.map((t) => t.state).join(", ") || "All Locations"}
          </p>
        </div>
      ),
    },
    {
      key: "totalLeads",
      label: "Assigned",
      align: "center",
      render: (val) => <span className="font-semibold text-slate-700 dark:text-slate-300">{val}</span>,
    },
    {
      key: "closedWon",
      label: "Deals Won",
      align: "center",
      render: (val) => <span className="font-semibold text-emerald-600 dark:text-emerald-400">{val}</span>,
    },
    {
      key: "conversionRate",
      label: "Conversion",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
          {val}%
        </span>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <EmptyState
          icon={ShieldAlert}
          title="Admin Access Required"
          description="Operational reports and analytics are strictly reserved for Brand Administrators."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span>Brand CRM Analytics & Regional Reports</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Performance analytics, lead volume conversion, and regional sales distribution for {brandName}.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPerformance}
          icon={Download}
        >
          Export Report
        </Button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Leads</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leads.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Unified CRM volume</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commercial Quotations</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{quotations.length}</p>
          <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-1">Official proposals generated</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Locations Active</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stateCounts.length}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">State territory markets</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sub Admin Operators</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{teamMembers.length}</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Regional CRM operators</p>
        </div>
      </div>

      {/* Grid: Location Distribution & Operator Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Lead Volume by State Location</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {stateCounts.map(([st, cnt]) => {
              const pct = ((cnt / (leads.length || 1)) * 100).toFixed(0);
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{st}</span>
                    <span className="text-slate-500">{cnt} leads ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operator Performance Table using DataTable */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-600" />
              <span>Regional Operator Performance</span>
            </h2>
          </div>

          <DataTable
            columns={performanceColumns}
            data={subAdminPerformance}
            emptyTitle="No operators found"
            emptyDescription="No sub admin performance data available."
            rowKey="id"
          />
        </div>
      </div>
    </div>
  );
};

export default CRMReports;
