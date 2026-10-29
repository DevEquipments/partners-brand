import { apiRequest } from "../api/apiRequest";
import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { permissionManagementRepository } from "./permissionManagementRepository";

/**
 * Sub Admin & Role Permission Repository
 *
 * Real API client layer for Premium Brand Role Permissions.
 * Endpoints:
 * - POST /get-premium-brand-permissions
 * - POST /add-premium-brand-role-permission
 */

/**
 * Fetch dynamic permission definitions list from the backend API.
 * Calls: POST /get-premium-brand-permissions
 * @param {Object} options - Optional request options
 * @returns {Promise<Array<{ id: number|string, name: string, slug: string }>>}
 */
export const getPremiumBrandPermissions = async (options = {}) => {
  return permissionManagementRepository.fetchPermissionDefinitions(options);
};

/**
 * Assign permissions to a role via the real backend API.
 * Calls: POST /add-premium-brand-role-permission
 *
 * Contract:
 * - role_id: <actual dynamic role ID>
 * - permission_name[]: <selected permission name 1>
 * - permission_name[]: <selected permission name 2>
 *
 * @param {Object|FormData} payload
 * @param {string|number} [payload.role_id] - Dynamic role identifier
 * @param {string|number} [payload.roleId] - Dynamic role identifier alias
 * @param {Array<string>} [payload.permission_name] - Array of permission names from /get-premium-brand-permissions
 * @param {Array<string>} [payload.permissionNames] - Array of permission names alias
 * @param {Object} [options] - Optional apiRequest config
 * @returns {Promise<Object>} Backend API response
 */
export const addPremiumBrandRolePermission = async (payload, options = {}) => {
  let formData;

  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    formData = payload;
  } else {
    const rawRoleId = payload?.role_id ?? payload?.roleId;

    if (rawRoleId === undefined || rawRoleId === null || String(rawRoleId).trim() === "") {
      throw new Error("Role ID is required to assign role permissions.");
    }

    formData = new FormData();
    formData.append("role_id", String(rawRoleId).trim());

    const names = payload?.permission_name ?? payload?.permissionNames ?? [];
    const list = Array.isArray(names) ? names : [names].filter(Boolean);

    list.forEach((name) => {
      if (name && typeof name === "string") {
        formData.append("permission_name[]", name.trim());
      }
    });
  }

  const response = await apiRequest({
    ...API_ENDPOINTS.addPremiumBrandRolePermission,
    data: formData,
    ...options,
  });

  if (response?.status === false) {
    const err = new Error(response?.message || "Failed to assign permissions to role.");
    err.errors = response?.errors || {};
    throw err;
  }

  return response;
};

/**
 * Delete a permission from a role via the real backend API.
 * Calls: POST /delete-role-permission
 *
 * Contract:
 * - role_id: <actual dynamic role ID>
 * - permission_name: <canonical permission name>
 *
 * @param {Object|FormData} payload
 * @param {string|number} [payload.role_id] - Dynamic role identifier
 * @param {string|number} [payload.roleId] - Dynamic role identifier alias
 * @param {string} [payload.permission_name] - Permission name
 * @param {string} [payload.permissionName] - Permission name alias
 * @param {string} [payload.name] - Permission name alias
 * @param {Object} [options] - Optional apiRequest config
 * @returns {Promise<Object>} Backend API response
 */
export const deleteRolePermission = async (payload, options = {}) => {
  let formData;

  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    formData = payload;
  } else {
    const rawRoleId = payload?.role_id ?? payload?.roleId;
    const rawName =
      payload?.permission_name ??
      payload?.permissionName ??
      payload?.name;

    if (rawRoleId === undefined || rawRoleId === null || String(rawRoleId).trim() === "") {
      throw new Error("Role ID is required to delete role permission.");
    }

    if (!rawName || String(rawName).trim() === "") {
      throw new Error("Permission name is required to delete role permission.");
    }

    formData = new FormData();
    formData.append("role_id", String(rawRoleId).trim());
    formData.append("permission_name", String(rawName).trim());
  }

  const response = await apiRequest({
    ...API_ENDPOINTS.deleteRolePermission,
    data: formData,
    ...options,
  });

  if (response?.status === false) {
    const err = new Error(response?.message || "Failed to delete permission from role.");
    err.errors = response?.errors || {};
    throw err;
  }

  return response;
};

export const subAdminPermissionRepository = {
  getPremiumBrandPermissions,
  addPremiumBrandRolePermission,
  deleteRolePermission,
};

export default subAdminPermissionRepository;
