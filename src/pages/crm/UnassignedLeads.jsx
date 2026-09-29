import { useState } from "react";
import {
  Inbox,
  MapPin,
  ChevronRight,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import LeadDetail from "../../components/crm/LeadDetail";
import { TableSkeleton } from "../../components/common/Skeletons";
import SearchableSelect from "../../components/common/SearchableSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { checkTerritoryMatch } from "../../utils/accessRules";
import { LEAD_PRIORITY_CONFIG } from "../../config/crmStatuses";
import { formatDate } from "../../utils/dateUtils";

export const UnassignedLeads = () => {
  const { unassignedLeads, autoAssignLead, assignLead, teamMembers, loading } = useCRM();
  const [selectedLead, setSelectedLead] = useState(null);
  const [pendingOverride, setPendingOverride] = useState(null); // { lead, member }

  const handleQuickAssign = async (e, lead, memberId) => {
    e.stopPropagation();
    if (!memberId) return;
    const member = teamMembers.find((m) => String(m.id) === String(memberId));
    if (!member) return;

    const hasTerritory = checkTerritoryMatch(member.territories, lead.state, lead.city);
    if (!hasTerritory) {
      setPendingOverride({ lead, member });
      return;
    }

    await assignLead(lead.id, member.id, "standard");
  };

  const handleConfirmOverride = async () => {
    if (!pendingOverride) return;
    await assignLead(
      pendingOverride.lead.id,
      pendingOverride.member.id,
      "override",
      "Administrative override from Unassigned Queue"
    );
    setPendingOverride(null);
  };

  const handleAutoAssign = async (e, leadId) => {
    e.stopPropagation();
    await autoAssignLead(leadId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-orange-600" />
            Unassigned Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Operational triage desk for new Customer Enquiries & Quotes waiting for territory assignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            {unassignedLeads.length} Leads Pending Assignment
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/15 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold">Territory-Based Routing Enabled</p>
          <p className="text-slate-500">
            You can manually allocate leads to any Sub Admin operator, or click "Auto-Assign" to route instantly according to the configured state and city territory boundaries.
          </p>
        </div>
      </div>

      {/* Unassigned Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Lead Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Machine Requirement</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Quick Route</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={6} cols={7} />
                  </td>
                </tr>
              ) : unassignedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Queue is clear! All customer inquiries and equipment quotes are currently assigned.
                  </td>
                </tr>
              ) : (
                unassignedLeads.map((lead) => {
                  const priority = LEAD_PRIORITY_CONFIG[lead.priority] || {};

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {lead.lead_code || lead.id}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {formatDate(lead.created_at)}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {lead.customer_name || lead.contact_person}
                        </p>
                        <p className="text-[11px] text-slate-400">{lead.phone}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lead.city ? `${lead.city}, ` : ""}{lead.state}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {lead.equipment_interest || lead.model_name || "Heavy Equipment"}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priority.badgeClass || ""}`}>
                          {priority.label || lead.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleAutoAssign(e, lead.id)}
                            className="px-2.5 py-1 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold text-[11px] flex items-center gap-1 border border-orange-500/20 transition-colors cursor-pointer"
                            title="Auto Assign by Territory"
                          >
                            <Zap className="w-3 h-3" />
                            Auto
                          </button>

                          <div className="w-40" onClick={(e) => e.stopPropagation()}>
                            <SearchableSelect
                              placeholder="Assign To..."
                              options={teamMembers.map((m) => ({
                                value: m.id,
                                label: m.name,
                              }))}
                              value={null}
                              onChange={(val) => {
                                if (val) handleQuickAssign({ stopPropagation: () => {} }, lead, val);
                              }}
                              isClearable={false}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetail
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
      />

      <ConfirmDialog
        isOpen={!!pendingOverride}
        onClose={() => setPendingOverride(null)}
        onConfirm={handleConfirmOverride}
        title="Confirm Territory Override"
        variant="warning"
        confirmLabel="Assign Anyway (Override)"
        description={`Operator "${pendingOverride?.member?.name}" does not have "${pendingOverride?.lead?.city ? `${pendingOverride?.lead?.city}, ` : ""}${pendingOverride?.lead?.state}" in their designated territories. As Admin, confirming will allocate this lead and mark it as a manual override.`}
      />
    </div>
  );
};

export default UnassignedLeads;
