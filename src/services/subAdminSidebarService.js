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
    const rawRoleId =
      payload?.role_id ??
      payload?.roleId ??
      (typeof payload === "number" || typeof payload === "string" ? payload : null);

    if (rawRoleId === undefined || rawRoleId === null || String(rawRoleId).trim() === "") {
      throw new Error("Role ID is required to fetch Sub Admin sidebar.");
    }

    const response = await subAdminRepository.getSubAdminSidebar(
      { role_id: String(rawRoleId).trim() },
      options
    );

    if (response?.status === false) {
      const err = new Error(response?.message || "Failed to fetch Sub Admin sidebar.");
      err.data = response;
      throw err;
    }

    let rawList = [];
    if (Array.isArray(response?.data)) {
      rawList = response.data;
    } else if (Array.isArray(response?.data?.sidebar)) {
      rawList = response.data.sidebar;
    } else if (Array.isArray(response?.data?.permissions)) {
      rawList = response.data.permissions;
    } else if (Array.isArray(response?.sidebar)) {
      rawList = response.sidebar;
    } else if (Array.isArray(response?.permissions)) {
      rawList = response.permissions;
    } else if (Array.isArray(response)) {
      rawList = response;
    } else if (response?.data && typeof response.data === "object") {
      rawList = Object.values(response.data).filter(Boolean);
    }

    return rawList
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return (item.name || item.slug || item.permission_name || item.title || "").trim();
        }
        return String(item || "").trim();
      })
      .filter(Boolean);
  },
};

export default subAdminSidebarService;
