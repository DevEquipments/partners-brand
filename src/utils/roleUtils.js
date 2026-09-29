/**
 * Equipments Dekho Partners Admin — Centralized Role & User Type Utility
 *
 * Strictly handles normalized roles based ONLY on explicit backend user_type values.
 * NEVER defaults or silently converts unknown or missing user types to ADMIN.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  SUB_ADMIN: "SUB_ADMIN",
};

/**
 * Normalizes backend `user_type` safely.
 *
 * Supported backend values:
 * - "admin" -> ROLES.ADMIN ("ADMIN")
 * - "sub_admin" -> ROLES.SUB_ADMIN ("SUB_ADMIN")
 *
 * Returns null for any undefined, null, or unsupported role.
 */
export const normalizeUserType = (rawUserType) => {
  if (!rawUserType || typeof rawUserType !== "string") {
    return null;
  }

  const clean = rawUserType.trim().toLowerCase();

  if (clean === "admin") {
    return ROLES.ADMIN;
  }

  if (clean === "sub_admin" || clean === "subadmin" || clean === "sub-admin") {
    return ROLES.SUB_ADMIN;
  }

  return null;
};

/**
 * Validates whether a normalized role is an authorized system role.
 */
export const isValidRole = (role) => {
  return role === ROLES.ADMIN || role === ROLES.SUB_ADMIN;
};

/**
 * User-facing display title for role.
 */
export const formatRoleLabel = (role) => {
  if (role === ROLES.ADMIN) return "Admin";
  if (role === ROLES.SUB_ADMIN) return "Sub Admin";
  return "Unauthorized User";
};

export default {
  ROLES,
  normalizeUserType,
  isValidRole,
  formatRoleLabel,
};
