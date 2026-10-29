import { apiRequest } from "../api/apiRequest";
import API_ENDPOINTS from "../endPoints/APIEndpoints";

/**
 * Sub Admin Repository
 *
 * Real API client layer for Sub Admin accounts of Premium Brand partners.
 * Integrates: POST /get-subadmins
 */
export const subAdminRepository = {
  /**
   * Fetch Sub Admin accounts belonging to the authenticated brand.
   * @param {string|number} brandId - Dynamic brand identifier of the logged in Main Admin.
   * @returns {Promise<Object>} API response object
   */
  async getSubAdmins(brandId) {
    if (!brandId) {
      throw new Error("Brand identifier is required to retrieve sub admin accounts.");
    }

    return apiRequest({
      ...API_ENDPOINTS.getSubAdmins,
      data: {
        brand_id: brandId,
      },
    });
  },

  /**
   * Create a new Sub Admin operator account for the authenticated brand.
   * Calls: POST /create-premium-brand-sub-admins
   *
   * @param {Object|FormData} payload
   * @param {Object} [options={}]
   * @returns {Promise<Object>} API response object
   */
  async createSubAdmin(payload, options = {}) {
    let formData;

    if (typeof FormData !== "undefined" && payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      formData.append("brand_id", payload?.brand_id ?? "");
      formData.append("brand_name", payload?.brand_name ?? "");
      formData.append("username", payload?.username ?? "");
      formData.append("password", payload?.password ?? "");
      formData.append("company_name", payload?.company_name ?? "");
      formData.append("office_address", payload?.office_address ?? "");
      formData.append("phone_no", payload?.phone_no ?? payload?.phone ?? "");
      formData.append("gst", payload?.gst ?? "");
      formData.append("email", payload?.email ?? "");
    }

    const response = await apiRequest({
      ...API_ENDPOINTS.createPremiumBrandSubAdmin,
      data: formData,
      ...options,
    });

    if (response?.status === false) {
      const err = new Error(response?.message || "Failed to create Sub Admin.");
      err.errors = response?.errors || {};
      err.data = response?.data;
      throw err;
    }

    return response;
  },

  /**
   * Fetch permitted sidebar navigation items for Sub Admin role.
   * Calls: POST /sub-admin-sidebar
   * @param {Object} payload - { role_id: number|string }
   * @param {Object} [options={}]
   * @returns {Promise<Object>} API response object
   */
  async getSubAdminSidebar(payload, options = {}) {
    const roleId = payload?.role_id ?? payload?.roleId;
    if (roleId === undefined || roleId === null || String(roleId).trim() === "") {
      throw new Error("Role ID is required to retrieve Sub Admin sidebar.");
    }

    return apiRequest({
      ...API_ENDPOINTS.subAdminSidebar,
      data: {
        role_id: roleId,
      },
      ...options,
    });
  },
};

export default subAdminRepository;
