import { MODULES, PERMISSIONS } from "../config/permissions";

/**
 * Centralized Permission Resolver
 *
 * Resolves dynamic backend permission slugs to corresponding system modules and permissions.
 * Serves as the single source of truth for:
 * - Sub Admin sidebar item visibility
 * - Route-level guards (PermissionRoute)
 * - Component-level guards (PermissionGate)
 */

/**
 * Maps a permission slug to the corresponding system CRM module.
 * @param {string} slug - The permission slug (e.g., "CustomerEnquiry", "quotes_enquiry", "leads")
 * @returns {string|null} The resolved MODULES constant or the raw slug
 */
export const resolveSlugToModule = (slug = "") => {
  if (!slug) return null;
  const clean = String(slug).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (clean.includes("enquir") || clean.includes("inquir")) {
    return MODULES.CRM_ENQUIRIES;
  }
  if (clean.includes("quote") || clean.includes("quotation")) {
    return MODULES.CRM_QUOTES;
  }
  if (clean.includes("lead")) {
    return MODULES.CRM_LEADS;
  }
  if (clean.includes("followup") || clean.includes("follow")) {
    return MODULES.CRM_FOLLOWUPS;
  }
  if (clean.includes("report")) {
    return MODULES.REPORTS;
  }
  if (clean.includes("profile")) {
    return MODULES.PROFILE;
  }
  if (clean.includes("dashboard")) {
    return MODULES.DASHBOARD;
  }

  return slug;
};

/**
 * Maps a permission slug to relevant PERMISSIONS constants for fine-grained action checks.
 * @param {string} slug
 * @returns {Array<string>} List of matching PERMISSIONS action strings
 */
export const resolveSlugToActions = (slug = "") => {
  const mod = resolveSlugToModule(slug);
  switch (mod) {
    case MODULES.CRM_ENQUIRIES:
      return [
        PERMISSIONS.ENQUIRIES_VIEW,
        PERMISSIONS.ENQUIRIES_CREATE,
        PERMISSIONS.ENQUIRIES_UPDATE,
        PERMISSIONS.ENQUIRIES_EDIT,
        PERMISSIONS.ENQUIRIES_EXPORT,
      ];
    case MODULES.CRM_QUOTES:
      return [
        PERMISSIONS.QUOTES_VIEW,
        PERMISSIONS.QUOTES_CREATE,
        PERMISSIONS.QUOTES_UPDATE,
        PERMISSIONS.QUOTES_EDIT,
        PERMISSIONS.QUOTES_EXPORT,
        PERMISSIONS.QUOTATIONS_VIEW,
      ];
    case MODULES.CRM_LEADS:
      return [
        PERMISSIONS.LEADS_VIEW,
        PERMISSIONS.LEADS_CREATE,
        PERMISSIONS.LEADS_UPDATE,
        PERMISSIONS.LEADS_EDIT,
        PERMISSIONS.LEADS_EXPORT,
      ];
    case MODULES.CRM_FOLLOWUPS:
      return [
        PERMISSIONS.FOLLOWUPS_VIEW,
        PERMISSIONS.FOLLOWUPS_CREATE,
        PERMISSIONS.FOLLOWUPS_UPDATE,
        PERMISSIONS.FOLLOWUPS_EDIT,
        PERMISSIONS.FOLLOWUPS_EXPORT,
      ];
    default:
      return [];
  }
};

/**
 * Checks whether an assigned permissions state grants access to a specific module.
 * @param {Object|Array} userPermissions - Map of { [slug]: boolean } or array of slugs
 * @param {string} moduleKey - Target module key
 * @returns {boolean}
 */
export const hasModulePermission = (userPermissions, moduleKey) => {
  if (!userPermissions || !moduleKey) return false;

  // Always accessible basic account modules
  if (moduleKey === MODULES.DASHBOARD || moduleKey === MODULES.PROFILE) {
    return true;
  }

  // Strictly Main Admin only operations
  if (
    moduleKey === MODULES.TEAM ||
    moduleKey === MODULES.CRM_UNASSIGNED ||
    moduleKey === MODULES.REPORTS
  ) {
    return false;
  }

  // If userPermissions is an object { [slug]: boolean }
  if (typeof userPermissions === "object" && !Array.isArray(userPermissions)) {
    for (const [slug, isEnabled] of Object.entries(userPermissions)) {
      if (isEnabled && resolveSlugToModule(slug) === moduleKey) {
        return true;
      }
    }
    return false;
  }

  // If userPermissions is an array of slugs
  if (Array.isArray(userPermissions)) {
    return userPermissions.some((item) => {
      const slug = typeof item === "string" ? item : item?.slug || item?.name;
      return resolveSlugToModule(slug) === moduleKey;
    });
  }

  return false;
};

export default {
  resolveSlugToModule,
  resolveSlugToActions,
  hasModulePermission,
};
