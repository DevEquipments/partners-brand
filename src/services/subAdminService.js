import { subAdminRepository } from "../repositories/subAdminRepository";

/**
 * Sub Admin Business Service
 *
 * Provides validated data access and normalization for Sub Admin records.
 */
export const subAdminService = {
  /**
   * Retrieve and normalize Sub Admins for a specific brand.
   * @param {string|number} brandId
   * @returns {Promise<Array>} Normalized list of Sub Admin records
   */
  async fetchSubAdmins(brandId) {
    if (!brandId) {
      throw new Error("Brand ID is required to fetch sub admins.");
    }

    const response = await subAdminRepository.getSubAdmins(brandId);

    if (response?.status === false) {
      throw new Error(response?.message || "Failed to fetch Sub Admins from server.");
    }

    // Extract sub_admins array accounting for API wrapper responses
    const rawList =
      response?.data?.sub_admins ||
      response?.sub_admins ||
      (Array.isArray(response?.data) ? response.data : []);

    if (!Array.isArray(rawList)) {
      return [];
    }

    return rawList.map((item) => ({
      id: item.id,
      brand_id: item.brand_id,
      brand_name: item.brand_name,
      username: item.username,
      company_name: item.company_name || "",
      office_address: item.office_address || "",
      phone_no: item.phone_no || item.phone || "",
      gst: item.gst || "",
      email: item.email || "",
      role: "SUB_ADMIN",
      user_type: "sub_admin",
      // Include any permissions array if returned by backend on user record
      permissions: Array.isArray(item.permissions) ? item.permissions : [],
    }));
  },
};

export default subAdminService;
