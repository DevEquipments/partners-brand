/**
 * Equipments Dekho Premium Brand CRM — Centralized Permissions Registry
 *
 * Enforces role-based permissions for:
 * - Leads
 * - Customer Enquiries
 * - Equipment Quotes
 * - Quotations
 * - Follow-ups
 * - Activities
 * - Customer History
 * - Reports
 * - Team & Territories
 * - Profile / Brand Settings
 */

export const PERMISSIONS = {
  // CRM Leads
  LEADS_VIEW: "leads:view",
  LEADS_CREATE: "leads:create",
  LEADS_UPDATE: "leads:update",
  LEADS_EDIT: "leads:edit",
  LEADS_DELETE: "leads:delete",
  LEADS_EXPORT: "leads:export",
  LEADS_ASSIGN: "leads:assign",

  // Customer Enquiries
  ENQUIRIES_VIEW: "enquiries:view",
  ENQUIRIES_CREATE: "enquiries:create",
  ENQUIRIES_UPDATE: "enquiries:update",
  ENQUIRIES_EDIT: "enquiries:edit",
  ENQUIRIES_DELETE: "enquiries:delete",
  ENQUIRIES_EXPORT: "enquiries:export",
  ENQUIRIES_ASSIGN: "enquiries:assign",

  // Equipment Quotes
  QUOTES_VIEW: "quotes:view",
  QUOTES_CREATE: "quotes:create",
  QUOTES_UPDATE: "quotes:update",
  QUOTES_EDIT: "quotes:edit",
  QUOTES_DELETE: "quotes:delete",
  QUOTES_EXPORT: "quotes:export",
  QUOTES_ASSIGN: "quotes:assign",

  // Quotations Workflow
  QUOTATIONS_VIEW: "quotations:view",
  QUOTATIONS_CREATE: "quotations:create",
  QUOTATIONS_UPDATE: "quotations:update",
  QUOTATIONS_EDIT: "quotations:edit",
  QUOTATIONS_DELETE: "quotations:delete",
  QUOTATIONS_EXPORT: "quotations:export",

  // Follow-ups
  FOLLOWUPS_VIEW: "followups:view",
  FOLLOWUPS_CREATE: "followups:create",
  FOLLOWUPS_UPDATE: "followups:update",
  FOLLOWUPS_EDIT: "followups:edit",
  FOLLOWUPS_DELETE: "followups:delete",
  FOLLOWUPS_EXPORT: "followups:export",

  // Activities
  ACTIVITIES_VIEW: "activities:view",
  ACTIVITIES_CREATE: "activities:create",
  ACTIVITIES_UPDATE: "activities:update",
  ACTIVITIES_EDIT: "activities:edit",
  ACTIVITIES_DELETE: "activities:delete",
  ACTIVITIES_EXPORT: "activities:export",

  // Customer History
  CUSTOMER_HISTORY_VIEW: "customer_history:view",
  CUSTOMER_HISTORY_CREATE: "customer_history:create",
  CUSTOMER_HISTORY_EDIT: "customer_history:edit",
  CUSTOMER_HISTORY_DELETE: "customer_history:delete",
  CUSTOMER_HISTORY_EXPORT: "customer_history:export",

  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_CREATE: "reports:create",
  REPORTS_EDIT: "reports:edit",
  REPORTS_DELETE: "reports:delete",
  REPORTS_EXPORT: "reports:export",

  // Team & Sub Admins Management
  SUBADMINS_MANAGE: "subadmins:manage",
  TERRITORIES_MANAGE: "territories:manage",
  ASSIGNMENT_MANAGE: "assignment:manage",

  // Profile & Settings
  PROFILE_VIEW: "profile:view",
  PROFILE_EDIT: "profile:edit",
  DASHBOARD_VIEW: "dashboard:view",
};

export const MODULES = {
  DASHBOARD: "dashboard",
  CRM_LEADS: "crm_leads",
  CRM_ENQUIRIES: "crm_enquiries",
  CRM_QUOTES: "crm_quotes",
  CRM_UNASSIGNED: "crm_unassigned",
  CRM_FOLLOWUPS: "crm_followups",
  CRM_PIPELINE: "crm_pipeline",
  QUOTATIONS: "quotations",
  TEAM: "team",
  REPORTS: "reports",
  PROFILE: "profile",
};

// Module access map linking modules to their requisite view permission
export const MODULE_PERMISSION_MAP = {
  [MODULES.DASHBOARD]: PERMISSIONS.DASHBOARD_VIEW,
  [MODULES.CRM_LEADS]: PERMISSIONS.LEADS_VIEW,
  [MODULES.CRM_ENQUIRIES]: PERMISSIONS.ENQUIRIES_VIEW,
  [MODULES.CRM_QUOTES]: PERMISSIONS.QUOTES_VIEW,
  [MODULES.CRM_UNASSIGNED]: PERMISSIONS.LEADS_ASSIGN,
  [MODULES.CRM_FOLLOWUPS]: PERMISSIONS.FOLLOWUPS_VIEW,
  [MODULES.CRM_PIPELINE]: PERMISSIONS.LEADS_VIEW,
  [MODULES.QUOTATIONS]: PERMISSIONS.QUOTATIONS_VIEW,
  [MODULES.TEAM]: PERMISSIONS.SUBADMINS_MANAGE,
  [MODULES.REPORTS]: PERMISSIONS.REPORTS_VIEW,
  [MODULES.PROFILE]: PERMISSIONS.PROFILE_VIEW,
};

export default PERMISSIONS;
