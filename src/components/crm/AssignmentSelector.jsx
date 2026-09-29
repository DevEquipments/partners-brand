import { useState, useMemo } from "react";
import { UserCheck, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { useAuth } from "../../context/AuthContext";
import { getEligibleAssignees, checkTerritoryMatch } from "../../utils/accessRules";
import ConfirmDialog from "../common/ConfirmDialog";
import SearchableSelect from "../common/SearchableSelect";

export const AssignmentSelector = ({
  record,
  currentAssigneeId,
  onAssign,
  isLoading = false,
  compact = false,
}) => {
  const { teamMembers, allLeads, autoAssignLead } = useCRM();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [pendingOverrideMember, setPendingOverrideMember] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Calculate workloads for each team member
  const memberWorkload = useMemo(() => {
    const map = {};
    teamMembers.forEach((m) => {
      const activeCount = (allLeads || []).filter(
        (l) =>
          String(l.assigned_to) === String(m.id) &&
          l.pipeline_stage !== "converted" &&
          l.pipeline_stage !== "lost"
      ).length;
      map[m.id] = activeCount;
    });
    return map;
  }, [teamMembers, allLeads]);

  // Determine eligible assignees based on active status, territory, and operational perms
  const eligibleMembers = useMemo(() => {
    return getEligibleAssignees(record, teamMembers, record?.type);
  }, [record, teamMembers]);

  const eligibleIds = useMemo(
    () => new Set(eligibleMembers.map((m) => String(m.id))),
    [eligibleMembers]
  );

  // Group options for SearchableSelect
  const selectOptions = useMemo(() => {
    return teamMembers.map((member) => {
      const isEligible = eligibleIds.has(String(member.id));
      const hasTerritory = checkTerritoryMatch(
        member.territories,
        record?.state,
        record?.city
      );
      const workload = memberWorkload[member.id] || 0;
      const statusLabel = member.status !== "active" ? " (Inactive)" : "";

      let badge;
      if (isEligible) {
        badge = "Eligible";
      } else if (!hasTerritory) {
        badge = "No Location Coverage";
      } else {
        badge = "Missing Permissions";
      }

      return {
        value: member.id,
        label: `${member.name}${statusLabel} — [${badge}] (${workload} active leads)`,
        member,
        isEligible,
      };
    });
  }, [teamMembers, eligibleIds, memberWorkload, record]);

  const handleSelectChange = (selectedId) => {
    if (!selectedId) return;
    if (String(selectedId) === String(currentAssigneeId)) return;

    const targetMember = teamMembers.find((m) => String(m.id) === String(selectedId));
    if (!targetMember) return;

    const isEligible = eligibleIds.has(String(targetMember.id));

    if (!isEligible) {
      if (!isAdmin) {
        return; // Sub Admins cannot override location
      }
      // Trigger Admin Override Confirmation
      setPendingOverrideMember(targetMember);
      setOverrideReason("");
      return;
    }

    // Standard eligible assignment
    onAssign(targetMember.id, "standard");
  };

  const handleConfirmOverride = () => {
    if (!pendingOverrideMember) return;
    onAssign(
      pendingOverrideMember.id,
      "override",
      overrideReason || "Administrative out-of-location override"
    );
    setPendingOverrideMember(null);
    setOverrideReason("");
  };

  const handleAutoAssign = async () => {
    if (!record?.id) return;
    try {
      setIsAutoAssigning(true);
      await autoAssignLead(record.id);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const currentMember = teamMembers.find(
    (m) => String(m.id) === String(currentAssigneeId)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>Assigned Operator</span>
        </label>

        {isAdmin && !compact && (
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={isLoading || isAutoAssigning}
            className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Auto-assign based on location coverage and lowest workload"
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto-Assign</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1">
          <SearchableSelect
            options={selectOptions}
            value={currentAssigneeId}
            onChange={handleSelectChange}
            placeholder={
              teamMembers.length === 0
                ? "No operators registered"
                : "Select Sub Admin..."
            }
            isDisabled={isLoading || !isAdmin}
            isClearable={false}
          />
        </div>

        {compact && isAdmin && (
          <button
            type="button"
            onClick={handleAutoAssign}
            disabled={isLoading || isAutoAssigning}
            className="px-2.5 py-2 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-semibold hover:bg-orange-100 flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            title="Auto-Assign"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Status indicator note */}
      {currentMember && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {currentMember.name}
          </span>
          <span>•</span>
          <span>{memberWorkload[currentMember.id] || 0} active leads</span>
          {eligibleIds.has(String(currentMember.id)) ? (
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold border border-emerald-500/20">
              Location Match
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[10px] font-semibold border border-amber-500/20 flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" />
              Manual Override
            </span>
          )}
        </div>
      )}

      {/* Admin Location Override Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingOverrideMember}
        onClose={() => setPendingOverrideMember(null)}
        onConfirm={handleConfirmOverride}
        title="Confirm Assignment Outside Location"
        variant="warning"
        confirmLabel="Continue with Assignment"
        description={
          <div className="space-y-3 text-left">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This Sub Admin is not assigned to this location ({record?.city ? `${record.city}, ` : ""}{record?.state || "Unknown"}). Continue with assignment?
            </p>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                As an Admin, manual assignment outside assigned locations is permitted and will be noted in the activity history.
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignment Note (Optional)
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Specific customer request / Workload distribution"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default AssignmentSelector;
