import { permissionManagementService } from "./permissionManagementService";
import { subAdminService } from "./subAdminService";
import { teamRepository } from "../repositories/local/crmRepository";

// Persistent storage key for Sub Admin assigned permissions: { [subAdminId]: { [slug]: boolean } }
const SUB_ADMIN_PERMISSIONS_STORAGE_KEY = "sub_admin_permissions_by_user_v1";

export const getAllStoredSubAdminPermissions = () => {
  try {
    const raw = localStorage.getItem(SUB_ADMIN_PERMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setStoredSubAdminPermissions = (subAdminId, permissions) => {
  if (!subAdminId) return;
  const all = getAllStoredSubAdminPermissions();
  all[String(subAdminId)] = { ...permissions };
  try {
    localStorage.setItem(SUB_ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Storage quota safe
  }
};

export const getStoredSubAdminPermissions = (subAdminId) => {
  if (!subAdminId) return null;
  const all = getAllStoredSubAdminPermissions();
  return all[String(subAdminId)] || null;
};

/**
 * Builds an initial permission map for a Sub Admin from dynamic definitions.
 * @param {Array<Object>} definitions - Dynamic definitions [{ id, name, slug, ... }]
 * @param {Array<string|Object>} rawUserPermissions - Sub Admin permissions from server
 * @returns {Object} { [slug]: boolean }
 */
export const buildAssignedPermissionsMap = (definitions = [], rawUserPermissions = []) => {
  const result = {};
  const rawSet = new Set(
    (rawUserPermissions || []).map((p) => {
      if (typeof p === "string") return p.toLowerCase().trim();
      return (p?.slug || p?.name || "").toLowerCase().trim();
    })
  );

  definitions.forEach((def) => {
    const slugLower = (def.slug || "").toLowerCase().trim();
    const nameLower = (def.name || "").toLowerCase().trim();

    if (rawSet.size > 0) {
      result[def.slug] = rawSet.has(slugLower) || rawSet.has(nameLower);
    } else {
      // By default when newly registering, permissions start unassigned unless explicit
      result[def.slug] = false;
    }
  });

  return result;
};

export const subAdminPermissionService = {
  /**
   * Retrieves dynamic permission definitions from the real backend API.
   * Calls: POST /get-premium-brand-permissions
   * @returns {Promise<Array<Object>>}
   */
  async fetchPermissionDefinitions() {
    return permissionManagementService.fetchPermissionDefinitions();
  },

  getStoredPermissions(subAdminId) {
    return getStoredSubAdminPermissions(subAdminId);
  },

  setStoredPermissions(subAdminId, permissions) {
    setStoredSubAdminPermissions(subAdminId, permissions);
  },

  /**
   * Fetches Sub Admins for the brand and assigns their dynamic permission state.
   * @param {string|number} brandId
   * @returns {Promise<Array>}
   */
  async fetchSubAdmins(brandId) {
    const [list, definitions] = await Promise.all([
      subAdminService.fetchSubAdmins(brandId),
      this.fetchPermissionDefinitions(),
    ]);

    return list.map((item) => {
      const userKey = String(item.id);
      const stored = getStoredSubAdminPermissions(userKey);

      let assigned;
      if (stored) {
        assigned = { ...stored };
        definitions.forEach((def) => {
          if (assigned[def.slug] === undefined) {
            assigned[def.slug] = false;
          }
        });
      } else {
        assigned = buildAssignedPermissionsMap(definitions, item.permissions);
      }

      return {
        ...item,
        id: userKey,
        name: item.username,
        assignedPermissions: assigned,
      };
    });
  },

  /**
   * Fetches permissions for a specific Sub Admin.
   * @param {string|number} subAdminId
   * @param {string|number} brandId
   * @returns {Promise<Object>}
   */
  async fetchPermissions(subAdminId, brandId) {
    const userKey = String(subAdminId);
    const definitions = await this.fetchPermissionDefinitions();
    const stored = getStoredSubAdminPermissions(userKey);

    if (stored) {
      const assigned = { ...stored };
      definitions.forEach((def) => {
        if (assigned[def.slug] === undefined) {
          assigned[def.slug] = false;
        }
      });
      return {
        raw: [],
        assigned,
      };
    }

    if (brandId) {
      const list = await subAdminService.fetchSubAdmins(brandId);
      const match = list.find((m) => String(m.id) === userKey);
      if (match) {
        const assigned = buildAssignedPermissionsMap(definitions, match.permissions);
        return {
          raw: match.permissions || [],
          assigned,
        };
      }
    }

    return {
      raw: [],
      assigned: buildAssignedPermissionsMap(definitions, []),
    };
  },

  /**
   * Assigns permissions to the selected Sub Admin.
   *
   * Only persists changed permissions for the specific Sub Admin.
   * Does NOT call permission definition APIs.
   *
   * @param {string|number} subAdminId
   * @param {Object} permissions - Current toggle state { [slug]: boolean }
   * @param {Object} originalPermissions - Original toggle state { [slug]: boolean }
   */
  async savePermissions(
    subAdminId,
    permissions,
    originalPermissions = {}
  ) {
    if (!subAdminId) {
      throw new Error("Sub Admin ID is required to update permissions.");
    }

    // Determine changed permission slugs
    const changedSlugs = Object.keys(permissions).filter(
      (slug) =>
        originalPermissions[slug] === undefined ||
        Boolean(permissions[slug]) !== Boolean(originalPermissions[slug])
    );

    if (changedSlugs.length === 0) {
      return {
        success: true,
        savedKeys: [],
        message: "No changes to update.",
        data: {
          subAdminId,
          permissions,
        },
      };
    }

    // Persist assignments for this Sub Admin
    const currentStored = getStoredSubAdminPermissions(subAdminId) || { ...originalPermissions };
    const updatedStored = { ...currentStored };

    for (const slug of changedSlugs) {
      updatedStored[slug] = Boolean(permissions[slug]);
    }

    setStoredSubAdminPermissions(subAdminId, updatedStored);

    // Sync local CRM team repository if member exists
    try {
      const activeSlugs = Object.entries(updatedStored)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([slug]) => slug);
      await teamRepository.update(subAdminId, { permissions: activeSlugs });
    } catch {
      // Dynamic backend Sub Admin record
    }

    return {
      success: true,
      savedKeys: changedSlugs,
      message: "Permissions updated successfully.",
      data: {
        subAdminId,
        permissions: updatedStored,
      },
    };
  },
};

export default subAdminPermissionService;
