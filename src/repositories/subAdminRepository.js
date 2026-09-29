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
};

export default subAdminRepository;
