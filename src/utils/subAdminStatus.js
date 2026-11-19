/**
 * Utility functions for normalizing, validating, and formatting Sub Admin account statuses.
 *
 * Supported API Status Values:
 * - "Active", "active", "ACTIVE", 1, "1", true -> Active account
 * - "Inactive", "inactive", "INACTIVE", "Deactive", "deactive", 0, "0", false -> Inactive/Deactive account
 * - null, undefined, empty string, or unrecognized string -> Unknown (never assumed active)
 */

/**
 * Determine whether a Sub Admin status represents an Active account.
 *
 * @param {string|number|boolean|null|undefined} status - Status value from API ("Active", "Inactive", 1, "1", 0, "0", etc.)
 * @param {string|null|undefined} [statusText] - Optional fallback label from API (e.g. "Active", "Deactive")
 * @returns {boolean|null} true for active, false for inactive, null for unknown
 */
export const isSubAdminActive = (status, statusText) => {
  // 1. Evaluate primary status value
  if (status !== undefined && status !== null) {
    if (typeof status === "boolean") {
      return status;
    }

    if (typeof status === "number") {
      if (status === 1) return true;
      if (status === 0) return false;
    }

    if (typeof status === "string") {
      const trimmed = status.trim().toLowerCase();
      if (trimmed === "active" || trimmed === "1" || trimmed === "true") {
        return true;
      }
      if (
        trimmed === "inactive" ||
        trimmed === "deactive" ||
        trimmed === "0" ||
        trimmed === "false" ||
        trimmed === "disabled" ||
        trimmed === "deactivated"
      ) {
        return false;
      }
    }
  }

  // 2. Fallback check against backend-provided statusText if primary status is missing or empty
  if (typeof statusText === "string" && statusText.trim() !== "") {
    const textLower = statusText.trim().toLowerCase();
    if (textLower === "active" || textLower === "1" || textLower === "true") {
      return true;
    }
    if (
      textLower === "inactive" ||
      textLower === "deactive" ||
      textLower === "0" ||
      textLower === "false" ||
      textLower === "disabled" ||
      textLower === "deactivated"
    ) {
      return false;
    }
  }

  return null;
};

/**
 * Convert raw status into a strict numeric status (1 or 0) suitable for API update payloads.
 *
 * @param {string|number|boolean|null|undefined} status
 * @param {string|null|undefined} [statusText]
 * @returns {1|0|null} 1 for active, 0 for inactive, null for unknown
 */
export const getSubAdminNumericStatus = (status, statusText) => {
  const active = isSubAdminActive(status, statusText);
  if (active === true) return 1;
  if (active === false) return 0;
  return null;
};

/**
 * Normalizes raw API status fields into an accessible, presentation-ready object.
 *
 * @param {string|number|boolean|null|undefined} status - Raw status value from API ("Active", "Inactive", "1", 1, "0", 0)
 * @param {string|null|undefined} [statusText] - Raw status_text value from API ("Active", "Deactive", "Inactive")
 * @returns {{
 *   isActive: boolean|null,
 *   numericStatus: 1|0|null,
 *   text: string,
 *   badgeClass: string,
 *   dotClass: string,
 *   color: "emerald"|"slate"|"amber"
 * }}
 */
export const normalizeSubAdminStatus = (status, statusText) => {
  const activeState = isSubAdminActive(status, statusText);

  // Active State ("Active", 1, "1")
  if (activeState === true) {
    return {
      isActive: true,
      numericStatus: 1,
      text: "Active",
      color: "emerald",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
      dotClass: "bg-emerald-500",
    };
  }

  // Inactive State ("Inactive", "Deactive", 0, "0")
  if (activeState === false) {
    // Preserve "Deactive" if specifically passed as such, otherwise use production default "Inactive"
    const rawLower =
      typeof status === "string"
        ? status.trim().toLowerCase()
        : typeof statusText === "string"
        ? statusText.trim().toLowerCase()
        : "";

    const displayLabel = rawLower === "deactive" ? "Deactive" : "Inactive";

    return {
      isActive: false,
      numericStatus: 0,
      text: displayLabel,
      color: "slate",
      badgeClass:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
      dotClass: "bg-slate-400",
    };
  }

  // Unknown / Missing / Unrecognized State
  const rawString =
    typeof status === "string" && status.trim() !== ""
      ? status.trim()
      : typeof statusText === "string" && statusText.trim() !== ""
      ? statusText.trim()
      : "Unknown";

  return {
    isActive: null,
    numericStatus: null,
    text: rawString.length > 20 ? "Unknown" : rawString,
    color: "amber",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dotClass: "bg-amber-500",
  };
};

export default {
  isSubAdminActive,
  getSubAdminNumericStatus,
  normalizeSubAdminStatus,
};
