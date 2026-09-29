import { permissionManagementRepository } from "../repositories/permissionManagementRepository";

/**
 * Permission Management Service
 *
 * Business logic and validation layer for Main Admin permission management.
 */
export const permissionManagementService = {
  /**
   * Retrieve dynamic permission definitions from the backend API.
   * Calls: POST /get-premium-brand-permissions
   * @param {Object} options
   * @returns {Promise<Array<Object>>} Normalized list [{ id, name, slug, description }]
   */
  async fetchPermissionDefinitions(options = {}) {
    return permissionManagementRepository.fetchPermissionDefinitions(options);
  },

  /**
   * Validate and add a permission definition.
   * Calls: POST /premium-brand-add-permission
   * @param {Object} param0 - { name, slug }
   * @param {Object} options - Optional request options (e.g. skipGlobalToast)
   */
  async addPermission({ name, slug }, options = {}) {
    const trimmedName = (name || "").trim();
    const trimmedSlug = (slug || "").trim();

    if (!trimmedName) {
      throw new Error("Permission Name is required.");
    }

    if (!trimmedSlug) {
      throw new Error("Permission Slug is required.");
    }

    const response = await permissionManagementRepository.addPermission(
      {
        name: trimmedName,
        slug: trimmedSlug,
      },
      options
    );

    if (!response || response.status === false) {
      const err = new Error(response?.message || "Failed to add permission.");
      err.errors = response?.errors || {};
      throw err;
    }

    return response;
  },

  /**
   * Validate and edit an existing permission definition.
   * Calls: POST /premium-brand-edit-permission
   * @param {Object} param0 - { id, name, slug }
   * @param {Object} options - Optional request options (e.g. skipGlobalToast)
   */
  async editPermission({ id, name, slug }, options = {}) {
    if (id === undefined || id === null || id === "") {
      throw new Error("Permission ID is required for editing.");
    }

    const trimmedName = (name || "").trim();
    const trimmedSlug = (slug || "").trim();

    if (!trimmedName) {
      throw new Error("Permission Name is required.");
    }

    if (!trimmedSlug) {
      throw new Error("Permission Slug is required.");
    }

    const response = await permissionManagementRepository.editPermission(
      {
        id,
        name: trimmedName,
        slug: trimmedSlug,
      },
      options
    );

    if (!response || response.status === false) {
      const err = new Error(response?.message || "Failed to update permission.");
      err.errors = response?.errors || {};
      throw err;
    }

    return response;
  },
};

export default permissionManagementService;
