/**
 * Equipments Dekho Premium Brand CRM — Activity Types & Log Definitions
 *
 * Types of interactions recorded in the customer & lead timeline:
 * - Call
 * - WhatsApp
 * - Email
 * - Meeting
 * - Site Visit
 * - Note
 * - Follow-up
 * - Status Change
 * - Assignment Change
 * - Quotation Generated / Sent
 */

export const ACTIVITY_TYPES = {
  CALL: "call",
  WHATSAPP: "whatsapp",
  EMAIL: "email",
  MEETING: "meeting",
  SITE_VISIT: "site_visit",
  NOTE: "note",
  FOLLOW_UP: "follow_up",
  STATUS_CHANGE: "status_change",
  ASSIGNMENT: "assignment",
  QUOTATION: "quotation",
};

export const ACTIVITY_TYPE_CONFIG = {
  [ACTIVITY_TYPES.CALL]: {
    label: "Phone Call",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    iconName: "Phone",
  },
  [ACTIVITY_TYPES.WHATSAPP]: {
    label: "WhatsApp Message",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    iconName: "MessageCircle",
  },
  [ACTIVITY_TYPES.EMAIL]: {
    label: "Email Communication",
    badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/50",
    iconName: "Mail",
  },
  [ACTIVITY_TYPES.MEETING]: {
    label: "Customer Meeting",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    iconName: "Calendar",
  },
  [ACTIVITY_TYPES.SITE_VISIT]: {
    label: "Project Site Visit",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    iconName: "MapPin",
  },
  [ACTIVITY_TYPES.NOTE]: {
    label: "Internal Note",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    iconName: "FileText",
  },
  [ACTIVITY_TYPES.FOLLOW_UP]: {
    label: "Follow-up Scheduled",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
    iconName: "Clock",
  },
  [ACTIVITY_TYPES.STATUS_CHANGE]: {
    label: "Status Updated",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50",
    iconName: "ArrowRightCircle",
  },
  [ACTIVITY_TYPES.ASSIGNMENT]: {
    label: "Lead Assigned",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
    iconName: "UserCheck",
  },
  [ACTIVITY_TYPES.QUOTATION]: {
    label: "Quotation Activity",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50",
    iconName: "FileCheck",
  },
};

export const CALL_OUTCOMES = [
  { id: "connected", label: "Connected / Discussed" },
  { id: "busy", label: "Line Busy" },
  { id: "no_answer", label: "No Answer / Ringing" },
  { id: "switched_off", label: "Switched Off" },
  { id: "call_back_later", label: "Call Back Later Requested" },
  { id: "wrong_number", label: "Wrong Number" },
];
