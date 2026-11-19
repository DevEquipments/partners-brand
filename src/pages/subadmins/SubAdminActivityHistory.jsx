import { useState, useMemo } from "react";
import {
  History,
  Search,
  RefreshCw,
  Info,
} from "lucide-react";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/formatters";
import {
  subAdminActivityService,
  SUB_ADMIN_ACTIVITY_TYPES,
} from "../../services/subAdminActivityService";

const ACTION_CONFIG = {
  [SUB_ADMIN_ACTIVITY_TYPES.ADD]: {
    label: "Added",
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  [SUB_ADMIN_ACTIVITY_TYPES.EDIT]: {
    label: "Edited",
    badgeClass:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  [SUB_ADMIN_ACTIVITY_TYPES.DELETE]: {
    label: "Deleted",
    badgeClass:
      "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  [SUB_ADMIN_ACTIVITY_TYPES.ACTIVATE]: {
    label: "Activated",
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  [SUB_ADMIN_ACTIVITY_TYPES.DEACTIVATE]: {
    label: "Deactivated",
    badgeClass:
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-400",
  },
  [SUB_ADMIN_ACTIVITY_TYPES.PERMISSION_CHANGE]: {
    label: "Permission Change",
    badgeClass:
      "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dotClass: "bg-purple-500",
  },
};

export const SubAdminActivityHistory = ({
  activities: propActivities,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionType, setSelectedActionType] = useState("ALL");

  // Fallback to demo service if activities are not passed directly as props
  const activities = useMemo(() => {
    return Array.isArray(propActivities)
      ? propActivities
      : subAdminActivityService.getActivities();
  }, [propActivities]);

  // Dynamic summary counters calculated from available activity records
  const summary = useMemo(() => {
    return subAdminActivityService.getActivitySummary(activities);
  }, [activities]);

  // Filtered activities list
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const itemAction = item.action || item.action_type;
      const itemName = item.subAdminUsername || item.sub_admin_name || "";

      // Filter by Action Type
      if (selectedActionType !== "ALL" && itemAction !== selectedActionType) {
        return false;
      }

      // Filter by Sub-Admin username search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!itemName.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, selectedActionType, searchQuery]);

  const hasFilters = searchQuery.trim() !== "" || selectedActionType !== "ALL";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedActionType("ALL");
  };

  return (
    <div className="space-y-4">
      {/* Subtle Demo Data Notice Banner */}
      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-3.5 py-2 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-[10px] tracking-wide uppercase">
            Demo Data
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-300/90">
            Frontend preview using fictional activity records. Real server audit logging will integrate once backend endpoints are available.
          </span>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Activities
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.total}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Sub-Admins Added
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.added}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Profile Updates
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.edited}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
            Status Changes
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.statusChanges}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
          <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Permission Changes
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {summary.permissionChanges}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search by Sub-Admin username */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Sub-Admin username..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
          />
        </div>

        {/* Action Type Filter & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={selectedActionType}
            onChange={(e) => setSelectedActionType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
          >
            <option value="ALL">All Action Types</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.ADD}>ADD (Created)</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.EDIT}>EDIT (Profile Updated)</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.DELETE}>DELETE (Deleted)</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.ACTIVATE}>ACTIVATE (Activated)</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.DEACTIVATE}>DEACTIVATE (Deactivated)</option>
            <option value={SUB_ADMIN_ACTIVITY_TYPES.PERMISSION_CHANGE}>
              PERMISSION_CHANGE (Permissions Updated)
            </option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium px-2 py-1 cursor-pointer whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={onRefresh}
              title="Refresh activity history"
            >
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Activity Table */}
      <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Sub-Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {hasFilters
                        ? "No matching activities found"
                        : "No activity records found"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      {hasFilters
                        ? "Try clearing search or action filters to view all activity entries."
                        : "Sub-Admin activities will appear here when administrative operations (create, edit, delete, status, or permission changes) are performed."}
                    </p>
                    {hasFilters && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const actionType = act.action || act.action_type;
                  const username = act.subAdminUsername || act.sub_admin_name || "Unknown";
                  const dateVal = act.createdAt || act.timestamp;
                  const performer = act.performedBy || act.performed_by || "Brand Admin";

                  const cfg =
                    ACTION_CONFIG[actionType] || {
                      label: actionType,
                      badgeClass:
                        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                      dotClass: "bg-slate-400",
                    };

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDate(dateVal, "MMM dd, yyyy HH:mm")}
                      </td>

                      {/* Sub-Admin */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-orange-500/20">
                            {username[0]?.toUpperCase() || "S"}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            @{username}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cfg.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {act.description}
                      </td>

                      {/* Performed By */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                        {performer}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubAdminActivityHistory;
