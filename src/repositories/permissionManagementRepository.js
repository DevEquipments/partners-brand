import { apiRequest } from "../api/apiRequest";
import API_ENDPOINTS from "../endPoints/APIEndpoints";

/**
 * Permission Management Repository
 *
 * Handles API calls for fetching, creating, and editing Premium Brand permission definitions.
 * Endpoints:
 * - POST /get-premium-brand-permissions
 * - POST /premium-brand-add-permission
 * - POST /premium-brand-edit-permission
 */
export const permissionManagementRepository = {
  /**
   * Fetch all dynamic permission definitions from the real backend API.
   * @param {Object} options - Optional request config
   * @returns {Promise<Array<Object>>} Normalized list: [{ id, name, slug, description }]
   */
  async fetchPermissionDefinitions(options = {}) {
    const res = await apiRequest({
      ...API_ENDPOINTS.getPremiumBrandPermissions,
      ...options,
    });

    if (res?.status === false) {
      const err = new Error(res?.message || "Failed to fetch permission definitions.");
      err.errors = res?.errors || {};
      throw err;
    }

    const rawList = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : Array.isArray(res?.permissions)
      ? res.permissions
      : [];

    return rawList.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description || "",
    }));
  },

  /**
   * Add a new permission definition via backend API.
   * @param {Object} payload - { name: string, slug: string }
   * @param {Object} options - Optional request config
   */
  async addPermission(payload, options = {}) {
    return apiRequest({
      ...API_ENDPOINTS.addPremiumBrandPermission,
      data: {
        name: payload.name,
        slug: payload.slug,
      },
      ...options,
    });
  },

  /**
   * Edit an existing permission definition via backend API.
   * @param {Object} payload - { id: number|string, name: string, slug: string }
   * @param {Object} options - Optional request config
   */
  async editPermission(payload, options = {}) {
    return apiRequest({
      ...API_ENDPOINTS.editPremiumBrandPermission,
      data: {
        id: payload.id,
        name: payload.name,
        slug: payload.slug,
      },
      ...options,
    });
  },
};

export default permissionManagementRepository;
