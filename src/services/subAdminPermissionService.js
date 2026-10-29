import { subAdminPermissionRepository } from "../repositories/subAdminPermissionRepository";
import { subAdminSidebarService } from "./subAdminSidebarService";

/**
 * Resolves the role ID for a Sub Admin record.
 * Uses the Sub Admin's `id` (`subAdmin.id`) as `role_id` for permission assignment.
 *
 * @param {Object|string|number} subAdmin - The Sub Admin record or ID
 * @returns {string|number|null} Resolved Sub Admin ID or null
 */
export const resolveRoleId = (subAdmin) => {
  if (!subAdmin) return null;

  if (typeof subAdmin === "number" || typeof subAdmin === "string") {
    const trimmed = String(subAdmin).trim();
    return trimmed !== "" ? subAdmin : null;
  }

  const resolved = subAdmin.id ?? subAdmin.role_id ?? subAdmin.roleId;
  if (resolved !== undefined && resolved !== null && String(resolved).trim() !== "") {
    return resolved;
  }

  return null;
};

/**
 * Maps dynamic permission definitions into a boolean toggle map based on backend permissions.
 * Matches by exact canonical permission name or slug.
 *
 * @param {Array<Object>} definitions - Definitions [{ id, name, slug }]
 * @param {Array<string|Object>} rawPermissions - Server permissions array
 * @returns {Object} { [slug]: boolean }
 */
export const buildAssignedPermissionsMap = (definitions = [], rawPermissions = []) => {
  const result = {};

  const rawSet = new Set(
    (rawPermissions || []).map((p) => {
      if (typeof p === "string") return p.toLowerCase().trim();
      return (p?.name || p?.slug || "").toLowerCase().trim();
    })
  );

  definitions.forEach((def) => {
    const slugLower = (def.slug || "").toLowerCase().trim();
    const nameLower = (def.name || "").toLowerCase().trim();

    if (rawSet.size > 0) {
      result[def.slug] = rawSet.has(nameLower) || rawSet.has(slugLower);
    } else {
      result[def.slug] = false;
    }
  });

  return result;
};

/**
 * Sub Admin Permission Service
 *
 * Direct business logic layer for Premium Brand Role Permissions.
 * Uses `subAdmin.id` as `role_id` for `/sub-admin-sidebar` and `/add-premium-brand-role-permission`.
 */
export const subAdminPermissionService = {
  /**
   * Retrieves dynamic permission definitions from the real backend API.
   * Calls: POST /get-premium-brand-permissions
   * @param {Object} [options]
   * @returns {Promise<Array<{ id: number|string, name: string, slug: string }>>}
   */
  async fetchPermissionDefinitions(options = {}) {
    return subAdminPermissionRepository.getPremiumBrandPermissions(options);
  },

  /**
   * Assign permissions to a Sub Admin via the real backend API.
   * Calls: POST /add-premium-brand-role-permission
   * @param {Object} payload - { role_id, permission_name[] }
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async addPremiumBrandRolePermission(payload, options = {}) {
    return subAdminPermissionRepository.addPremiumBrandRolePermission(payload, options);
  },

  /**
   * Delete a single permission from a Sub Admin role via the real backend API.
   * Calls: POST /delete-role-permission
   * @param {Object} payload - { role_id, permission_name }
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async deleteRolePermission(payload, options = {}) {
    return subAdminPermissionRepository.deleteRolePermission(payload, options);
  },

  /**
   * Remove a single permission from a Sub Admin.
   *
   * @param {Object} params
   * @param {Object|string|number} [params.subAdmin] - The Sub Admin record or ID
   * @param {string|number} [params.roleId] - The role ID (defaults to resolved subAdmin role ID)
   * @param {string} params.permissionName - The canonical permission name to delete
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async removePermission({ subAdmin, roleId, permissionName }, options = {}) {
    const resolvedRole = roleId ?? resolveRoleId(subAdmin);

    if (resolvedRole === undefined || resolvedRole === null || String(resolvedRole).trim() === "") {
      throw new Error("Role ID is required to remove permission.");
    }

    const name = String(permissionName || "").trim();
    if (!name) {
      throw new Error("Permission name is required to remove permission.");
    }

    const response = await this.deleteRolePermission(
      {
        role_id: String(resolvedRole),
        permission_name: name,
      },
      options
    );

    return {
      success: true,
      message: response?.message || "Permission deleted successfully.",
      data: response?.data || { role_id: String(resolvedRole), permission_name: name },
      roleId: resolvedRole,
      permissionName: name,
    };
  },

  /**
   * Fetches real assigned permissions for a Sub Admin from the server.
   * Calls: POST /sub-admin-sidebar with { role_id: roleId }
   * @param {string|number} roleId
   * @param {Object} [options]
   * @returns {Promise<Array<string>>} List of assigned permission names
   */
  async fetchAssignedPermissions(roleId, options = {}) {
    if (!roleId) return [];
    return subAdminSidebarService.fetchSubAdminSidebar({ role_id: roleId }, options);
  },

  /**
   * Saves permissions for a Sub Admin.
   * Revokes turned-off permissions via POST /delete-role-permission,
   * and assigns turned-on permissions via POST /add-premium-brand-role-permission.
   *
   * @param {Object} params
   * @param {Object} params.subAdmin - The Sub Admin record being edited
   * @param {Object} params.permissions - Current toggle state { [slug]: boolean }
   * @param {Array<Object>} params.definitions - Dynamic definitions [{ id, name, slug }]
   * @param {Object} [params.originalPermissions] - Prior state { [slug]: boolean } to detect revoking
   * @param {Object} [options] - Optional request config
   * @returns {Promise<Object>} API response
   */
  async savePermissions({ subAdmin, permissions, definitions, originalPermissions = {} }, options = {}) {
    if (!subAdmin) {
      throw new Error("Sub Admin record is required to assign permissions.");
    }

    const roleId = resolveRoleId(subAdmin);

    if (roleId === undefined || roleId === null || String(roleId).trim() === "") {
      throw new Error("Sub Admin ID is required to assign permissions.");
    }

    // Filter dynamic definitions to extract exact names for all toggled ON permissions
    const selectedNames = (definitions || [])
      .filter((def) => Boolean(permissions[def.slug]))
      .map((def) => def.name.trim())
      .filter(Boolean);

    // Identify permissions that were active previously and are now toggled OFF
    const toRevokeDefinitions = (definitions || []).filter(
      (def) => Boolean(originalPermissions[def.slug]) && !permissions[def.slug]
    );

    // 1. Delete all permissions that were switched OFF
    if (toRevokeDefinitions.length > 0) {
      await Promise.all(
        toRevokeDefinitions.map((def) =>
          this.deleteRolePermission(
            {
              role_id: String(roleId),
              permission_name: def.name.trim(),
            },
            options
          )
        )
      );
    }

    // 2. Add / Update permissions if any are selected ON
    let addResponse = null;
    if (selectedNames.length > 0) {
      addResponse = await this.addPremiumBrandRolePermission(
        {
          role_id: String(roleId),
          permission_name: selectedNames,
        },
        options
      );
    }

    return {
      success: true,
      message:
        addResponse?.message ||
        (toRevokeDefinitions.length > 0
          ? "Permission deleted successfully."
          : "Permissions updated successfully."),
      data: addResponse?.data || { role_id: String(roleId), permission_name: selectedNames },
      selectedNames,
      revokedCount: toRevokeDefinitions.length,
      roleId,
    };
  },
};

export default subAdminPermissionService;
