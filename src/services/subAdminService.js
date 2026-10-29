import { subAdminRepository } from "../repositories/subAdminRepository";

/**
 * Resolves the role identifier for a Sub Admin record.
 * Uses the Sub Admin's account ID (`item.id`) as the `role_id` for permission assignment.
 *
 * @param {Object} item - Sub Admin record or user object
 * @returns {number|string|null} Resolved ID or null
 */
export const extractRoleIdFromRecord = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const resolved = item.id ?? item.role_id ?? item.roleId;
  if (resolved !== undefined && resolved !== null && String(resolved).trim() !== "") {
    return resolved;
  }

  return null;
};

/**
 * Sub Admin Business Service
 *
 * Provides validated data access and normalization for Sub Admin records.
 */
export const subAdminService = {
  /**
   * Retrieve and normalize Sub Admins along with account quota limits for a specific brand.
   * Calls: POST /get-subadmins
   *
   * Normalized output:
   * {
   *   brand_id: string|null,
   *   brand_name: string,
   *   allowed_sub_admins: number|null,
   *   current_sub_admins: number|null,
   *   remaining_sub_admins: number|null,
   *   sub_admins: Array<Object>
   * }
   *
   * @param {string|number} brandId
   * @returns {Promise<Object>} Normalized structure containing limits and Sub Admin records
   */
  async fetchSubAdmins(brandId) {
    if (!brandId) {
      throw new Error("Brand ID is required to fetch sub admins.");
    }

    const response = await subAdminRepository.getSubAdmins(brandId);

    if (response?.status === false) {
      throw new Error(response?.message || "Failed to fetch Sub Admins from server.");
    }

    const dataObj =
      response?.data && typeof response.data === "object" && !Array.isArray(response.data)
        ? response.data
        : response && typeof response === "object" && !Array.isArray(response)
        ? response
        : {};

    // Extract sub_admins array accounting for nested response variations
    const rawList =
      dataObj.sub_admins ||
      response?.sub_admins ||
      (Array.isArray(response?.data) ? response.data : []);

    const subAdminsArray = Array.isArray(rawList) ? rawList : [];

    const normalizedSubAdmins = subAdminsArray.map((item) => ({
      ...item,
      id: item.id,
      role_id: item.id,
      brand_id: item.brand_id ?? dataObj.brand_id ?? brandId,
      brand_name: item.brand_name ?? dataObj.brand_name ?? "",
      username: item.username,
      company_name: item.company_name || "",
      office_address: item.office_address || "",
      phone_no: item.phone_no || item.phone || "",
      gst: item.gst || "",
      email: item.email || "",
      role: "SUB_ADMIN",
      user_type: "sub_admin",
    }));

    const parseLimit = (val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    };

    const result = {
      brand_id: dataObj.brand_id ?? (brandId ? String(brandId) : null),
      brand_name: dataObj.brand_name ?? "",
      allowed_sub_admins: parseLimit(dataObj.allowed_sub_admins),
      current_sub_admins: parseLimit(dataObj.current_sub_admins),
      remaining_sub_admins: parseLimit(dataObj.remaining_sub_admins),
      sub_admins: normalizedSubAdmins,
    };

    // Backward-compatibility: allow array-like spreading and iteration if consumed directly
    result[Symbol.iterator] = function* () {
      yield* normalizedSubAdmins;
    };
    Object.defineProperty(result, "length", {
      get() {
        return normalizedSubAdmins.length;
      },
      enumerable: false,
    });

    return result;
  },

  /**
   * Create a new Sub Admin account.
   * Calls: POST /create-premium-brand-sub-admins
   *
   * Validates required inputs and delegates to repository.
   *
   * @param {Object} subAdminData
   * @param {Object} [options={}]
   * @returns {Promise<Object>} Server response
   */
  async createSubAdmin(subAdminData, options = {}) {
    if (!subAdminData?.brand_id) {
      throw new Error("Brand identifier is required to create a Sub Admin.");
    }
    if (!subAdminData?.username || !String(subAdminData.username).trim()) {
      throw new Error("Username is required.");
    }
    if (!subAdminData?.password || !String(subAdminData.password).trim()) {
      throw new Error("Password is required.");
    }
    if (!subAdminData?.email || !String(subAdminData.email).trim()) {
      throw new Error("Official email is required.");
    }

    const payload = {
      brand_id: String(subAdminData.brand_id).trim(),
      brand_name: String(subAdminData.brand_name || "").trim(),
      username: String(subAdminData.username).trim(),
      password: String(subAdminData.password),
      company_name: String(subAdminData.company_name || "").trim(),
      office_address: String(subAdminData.office_address || "").trim(),
      phone_no: String(subAdminData.phone_no || subAdminData.phone || "").trim(),
      gst: String(subAdminData.gst || "").trim(),
      email: String(subAdminData.email).trim().toLowerCase(),
    };

    return subAdminRepository.createSubAdmin(payload, options);
  },
};

export default subAdminService;
