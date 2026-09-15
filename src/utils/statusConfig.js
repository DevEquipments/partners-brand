/**
 * Status and priority configurations with semantic tokens for light and dark modes.
 * Strictly no emojis.
 */

export const STATUS_CONFIG = {
  new: {
    label: "New",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    borderLeft: "border-l-blue-500",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    borderLeft: "border-l-amber-500",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    borderLeft: "border-l-emerald-500",
  },
  pending: {
    label: "Pending",
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    borderLeft: "border-l-orange-500",
  },
  default: {
    label: "Default",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    borderLeft: "border-l-slate-400",
  },
};

export const getStatusConfig = (statusKey = "") => {
  const key = String(statusKey || "new").toLowerCase().trim();
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};

export const PRIORITY_CONFIG = {
  high: {
    label: "High",
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
  medium: {
    label: "Medium",
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
  },
};

export const getPriorityConfig = (priorityKey = "") => {
  const key = String(priorityKey || "medium").toLowerCase().trim();
  return PRIORITY_CONFIG[key] || PRIORITY_CONFIG.medium;
};
