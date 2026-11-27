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
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (res?.status === false) {
      const err = new Error(res?.message || "Failed to fetch permission definitions.");
      err.errors = res?.errors || {};
      throw err;
    }

    let rawList = [];
    if (Array.isArray(res?.data)) {
      rawList = res.data;
    } else if (Array.isArray(res?.data?.permissions)) {
      rawList = res.data.permissions;
    } else if (Array.isArray(res?.data?.data)) {
      rawList = res.data.data;
    } else if (Array.isArray(res?.permissions)) {
      rawList = res.permissions;
    } else if (Array.isArray(res)) {
      rawList = res;
    } else if (res?.data && typeof res.data === "object") {
      rawList = Object.values(res.data).filter(Boolean);
    }

    return rawList
      .map((item, index) => {
        if (typeof item === "string") {
          const name = item.trim();
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
          return {
            id: index + 1,
            name,
            slug,
            description: "",
          };
        }
        const name = (item.name || item.permission_name || item.title || item.slug || "").trim();
        const slug = (
          item.slug ||
          item.permission_slug ||
          name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
        ).trim();
        return {
          id: item.id ?? index + 1,
          name,
          slug,
          description: item.description || "",
        };
      })
      .filter((item) => item.name);
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
