import { apiRequest } from "../api/apiRequest";
import API_ENDPOINTS from "../endPoints/APIEndpoints";

/**
 * Sub Admin Permission Repository
 *
 * Provides a clean data access layer for Sub Admin permissions.
 */
export const subAdminPermissionRepository = {
  /**
   * Save sub admin permissions.
   * Dispatches request to the backend assignment endpoint if configured.
   *
   * @param {string|number} subAdminId - The target Sub Admin ID
   * @param {Array<string>} permissions - Denormalized array of permission strings
   * @returns {Promise<Object>} API response or structured error
   */
  async savePermissions(subAdminId, permissions) {
    if (!subAdminId) {
      throw new Error("Sub Admin ID is required to save permissions.");
    }

    if (API_ENDPOINTS.assignSubAdminPermissions) {
      return apiRequest({
        ...API_ENDPOINTS.assignSubAdminPermissions,
        data: {
          sub_admin_id: subAdminId,
          permissions,
        },
      });
    }

    return {
      success: false,
      message: "Backend permission assignment API endpoint is not provisioned on the server. Please contact your administrator.",
    };
  },
};

export default subAdminPermissionRepository;
