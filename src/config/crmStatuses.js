/**
 * Equipments Dekho Premium Brand CRM — Statuses & Lifecycles
 *
 * Distinct lifecycle workflows for:
 * 1. Customer Enquiry
 * 2. Equipment Quotes
 * 3. Quotations Workflow
 * 4. Lead Priority
 */

export const LEAD_SOURCE_TYPES = {
  CUSTOMER_ENQUIRY: "customer_enquiry",
  EQUIPMENT_QUOTE: "equipment_quote",
  DIRECT_LEAD: "direct_lead",
};

// Customer Enquiry Lifecycle
export const ENQUIRY_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  CONTACTED: "contacted",
  REQUIREMENT_GATHERED: "requirement_gathered",
  QUOTE_REQUESTED: "quote_requested",
  CLOSED_WON: "closed_won",
  CLOSED_LOST: "closed_lost",
};

export const ENQUIRY_STATUS_CONFIG = {
  [ENQUIRY_STATUS.NEW]: {
    label: "New",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500",
  },
  [ENQUIRY_STATUS.ASSIGNED]: {
    label: "Assigned",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    dotClass: "bg-purple-500",
  },
  [ENQUIRY_STATUS.CONTACTED]: {
    label: "Contacted",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500",
  },
  [ENQUIRY_STATUS.REQUIREMENT_GATHERED]: {
    label: "Req Gathered",
    color: "indigo",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    dotClass: "bg-indigo-500",
  },
  [ENQUIRY_STATUS.QUOTE_REQUESTED]: {
    label: "Quote Requested",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    dotClass: "bg-orange-500",
  },
  [ENQUIRY_STATUS.CLOSED_WON]: {
    label: "Closed Won",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    dotClass: "bg-emerald-500",
  },
  [ENQUIRY_STATUS.CLOSED_LOST]: {
    label: "Closed Lost",
    color: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    dotClass: "bg-red-500",
  },
};

// Feature Equipment Quotes Lifecycle
export const QUOTE_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  VERIFIED: "verified",
  QUOTATION_PREPARED: "quotation_prepared",
  QUOTATION_SENT: "quotation_sent",
  UNDER_NEGOTIATION: "under_negotiation",
  DEAL_CLOSED: "deal_closed",
  DEAL_LOST: "deal_lost",
};

export const QUOTE_STATUS_CONFIG = {
  [QUOTE_STATUS.NEW]: {
    label: "New",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500",
  },
  [QUOTE_STATUS.ASSIGNED]: {
    label: "Assigned",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    dotClass: "bg-purple-500",
  },
  [QUOTE_STATUS.VERIFIED]: {
    label: "Verified",
    color: "cyan",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50",
    dotClass: "bg-cyan-500",
  },
  [QUOTE_STATUS.QUOTATION_PREPARED]: {
    label: "Quote Prepared",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500",
  },
  [QUOTE_STATUS.QUOTATION_SENT]: {
    label: "Quote Sent",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    dotClass: "bg-orange-500",
  },
  [QUOTE_STATUS.UNDER_NEGOTIATION]: {
    label: "Negotiation",
    color: "yellow",
    badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
    dotClass: "bg-yellow-500",
  },
  [QUOTE_STATUS.DEAL_CLOSED]: {
    label: "Deal Won",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    dotClass: "bg-emerald-500",
  },
  [QUOTE_STATUS.DEAL_LOST]: {
    label: "Deal Lost",
    color: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    dotClass: "bg-red-500",
  },
};

// Quotations Document Lifecycle
export const QUOTATION_DOC_STATUS = {
  DRAFT: "draft",
  PREPARING: "preparing",
  SENT: "sent",
  VIEWED: "viewed",
  FOLLOW_UP: "follow_up",
  NEGOTIATION: "negotiation",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

export const QUOTATION_DOC_STATUS_CONFIG = {
  [QUOTATION_DOC_STATUS.DRAFT]: {
    label: "Draft",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    dotClass: "bg-slate-500",
  },
  [QUOTATION_DOC_STATUS.PREPARING]: {
    label: "Preparing",
    badgeClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
    dotClass: "bg-sky-500",
  },
  [QUOTATION_DOC_STATUS.SENT]: {
    label: "Sent",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500",
  },
  [QUOTATION_DOC_STATUS.VIEWED]: {
    label: "Viewed",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    dotClass: "bg-purple-500",
  },
  [QUOTATION_DOC_STATUS.FOLLOW_UP]: {
    label: "Follow-up",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500",
  },
  [QUOTATION_DOC_STATUS.NEGOTIATION]: {
    label: "Negotiating",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    dotClass: "bg-orange-500",
  },
  [QUOTATION_DOC_STATUS.ACCEPTED]: {
    label: "Accepted",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    dotClass: "bg-emerald-500",
  },
  [QUOTATION_DOC_STATUS.REJECTED]: {
    label: "Rejected",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    dotClass: "bg-red-500",
  },
  [QUOTATION_DOC_STATUS.EXPIRED]: {
    label: "Expired",
    badgeClass: "bg-slate-400/10 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700",
    dotClass: "bg-slate-400",
  },
};

// Priority Configurations
export const LEAD_PRIORITY = {
  HOT: "hot",
  WARM: "warm",
  COLD: "cold",
};

export const LEAD_PRIORITY_CONFIG = {
  [LEAD_PRIORITY.HOT]: {
    label: "Hot",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    dotClass: "bg-red-500",
  },
  [LEAD_PRIORITY.WARM]: {
    label: "Warm",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500",
  },
  [LEAD_PRIORITY.COLD]: {
    label: "Cold",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500",
  },
};

// Lead Statuses (Standardized 6 stages)
export const LEAD_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  CONTACTED: "contacted",
  FOLLOW_UP: "followup",
  WON: "won",
  LOST: "lost",
};

export const LEAD_STATUS_CONFIG = {
  [LEAD_STATUS.NEW]: {
    label: "New",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500",
  },
  [LEAD_STATUS.ASSIGNED]: {
    label: "Assigned",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    dotClass: "bg-purple-500",
  },
  [LEAD_STATUS.CONTACTED]: {
    label: "Contacted",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500",
  },
  [LEAD_STATUS.FOLLOW_UP]: {
    label: "Follow-up",
    color: "orange",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    dotClass: "bg-orange-500",
  },
  [LEAD_STATUS.WON]: {
    label: "Won",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    dotClass: "bg-emerald-500",
  },
  [LEAD_STATUS.LOST]: {
    label: "Lost",
    color: "red",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    dotClass: "bg-red-500",
  },
};

export const LEAD_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: LEAD_STATUS.NEW, label: "New" },
  { value: LEAD_STATUS.ASSIGNED, label: "Assigned" },
  { value: LEAD_STATUS.CONTACTED, label: "Contacted" },
  { value: LEAD_STATUS.FOLLOW_UP, label: "Follow-up" },
  { value: LEAD_STATUS.WON, label: "Won" },
  { value: LEAD_STATUS.LOST, label: "Lost" },
];

export const getLeadStatusBadge = (status) => {
  const normalized = (status || "new").toLowerCase().replace(/[-_]/g, "");
  if (normalized.includes("won") || normalized.includes("close")) {
    return LEAD_STATUS_CONFIG[LEAD_STATUS.WON];
  }
  if (normalized.includes("lost")) {
    return LEAD_STATUS_CONFIG[LEAD_STATUS.LOST];
  }
  if (normalized.includes("follow")) {
    return LEAD_STATUS_CONFIG[LEAD_STATUS.FOLLOW_UP];
  }
  if (normalized.includes("contact")) {
    return LEAD_STATUS_CONFIG[LEAD_STATUS.CONTACTED];
  }
  if (normalized.includes("assign")) {
    return LEAD_STATUS_CONFIG[LEAD_STATUS.ASSIGNED];
  }
  return LEAD_STATUS_CONFIG[LEAD_STATUS.NEW] || {
    label: status || "New",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dotClass: "bg-slate-400",
  };
};
