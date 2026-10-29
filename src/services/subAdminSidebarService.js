import { subAdminRepository } from "../repositories/subAdminRepository";

/**
 * Sub Admin Sidebar Service
 *
 * Business logic layer for retrieving dynamic Sub Admin navigation menu items.
 * Integrates: POST /sub-admin-sidebar with { role_id: 1 }
 */
export const subAdminSidebarService = {
  /**
   * Retrieve permitted sidebar items for Sub Admin role.
   * Calls: POST /sub-admin-sidebar
   * @param {Object} payload - { role_id: number|string }
   * @param {Object} [options]
   * @returns {Promise<Array<string>>} List of permitted menu names, e.g. ["Customer Enquiry", "Leads"]
   */
  async fetchSubAdminSidebar(payload, options = {}) {
    const rawRoleId = payload?.role_id ?? payload?.roleId ?? (typeof payload === "number" || typeof payload === "string" ? payload : null);

    if (rawRoleId === undefined || rawRoleId === null || String(rawRoleId).trim() === "") {
      throw new Error("Role ID is required to fetch Sub Admin sidebar.");
    }

    const response = await subAdminRepository.getSubAdminSidebar({ role_id: rawRoleId }, options);

    if (response?.status === false) {
      const err = new Error(response?.message || "Failed to fetch Sub Admin sidebar.");
      err.data = response;
      throw err;
    }

    const items = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

    return items;
  },
};

export default subAdminSidebarService;
