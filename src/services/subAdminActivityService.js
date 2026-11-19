/**
 * Sub-Admin Activity Tracking Service
 *
 * Current Mode: DEMONSTRATION / PREVIEW
 * Real backend audit APIs are pending development.
 * This service reads strictly from the dedicated demo dataset (src/data/subAdminActivityDemoData.js).
 * Does not mix demo records into production API responses or localStorage.
 */

import {
  SUB_ADMIN_ACTIVITY_DEMO_DATA,
  SUB_ADMIN_ACTIVITY_TYPES,
} from "../data/subAdminActivityDemoData";

export { SUB_ADMIN_ACTIVITY_TYPES };

export const subAdminActivityService = {
  /**
   * Indicates whether the service is currently running in Demo Mode.
   * Will return false once production audit endpoints are deployed.
   */
  isDemoMode: true,

  /**
   * Fetch activity records.
   * @param {Object} [filters]
   * @param {string} [filters.action] - Filter by specific action type
   * @param {string} [filters.username] - Filter by Sub-Admin username
   * @returns {Array} List of activity records
   */
  getActivities(filters = {}) {
    let records = [...SUB_ADMIN_ACTIVITY_DEMO_DATA];

    if (filters.action && filters.action !== "ALL") {
      records = records.filter(
        (item) => (item.action || item.action_type) === filters.action
      );
    }

    if (filters.username && filters.username.trim()) {
      const q = filters.username.toLowerCase().trim();
      records = records.filter((item) =>
        (item.subAdminUsername || item.sub_admin_name || "")
          .toLowerCase()
          .includes(q)
      );
    }

    return records;
  },

  /**
   * Calculate summary counts dynamically from activity records.
   * Never hardcodes counts.
   * @param {Array} [records] - Optional records array; defaults to all demo records
   * @returns {Object} Summary counts object
   */
  getActivitySummary(records = null) {
    const list = records || SUB_ADMIN_ACTIVITY_DEMO_DATA;
    return {
      total: list.length,
      added: list.filter(
        (a) => (a.action || a.action_type) === SUB_ADMIN_ACTIVITY_TYPES.ADD
      ).length,
      edited: list.filter(
        (a) => (a.action || a.action_type) === SUB_ADMIN_ACTIVITY_TYPES.EDIT
      ).length,
      deleted: list.filter(
        (a) => (a.action || a.action_type) === SUB_ADMIN_ACTIVITY_TYPES.DELETE
      ).length,
      activated: list.filter(
        (a) => (a.action || a.action_type) === SUB_ADMIN_ACTIVITY_TYPES.ACTIVATE
      ).length,
      deactivated: list.filter(
        (a) =>
          (a.action || a.action_type) === SUB_ADMIN_ACTIVITY_TYPES.DEACTIVATE
      ).length,
      statusChanges: list.filter((a) => {
        const act = a.action || a.action_type;
        return (
          act === SUB_ADMIN_ACTIVITY_TYPES.ACTIVATE ||
          act === SUB_ADMIN_ACTIVITY_TYPES.DEACTIVATE
        );
      }).length,
      permissionChanges: list.filter(
        (a) =>
          (a.action || a.action_type) ===
          SUB_ADMIN_ACTIVITY_TYPES.PERMISSION_CHANGE
      ).length,
    };
  },

  /**
   * Future-ready method for logging an action.
   * In Demo Mode, creates an explicitly tagged DEMO record without modifying production stores.
   */
  logAction({
    action,
    subAdminId,
    subAdminUsername,
    description,
    performedBy = "Brand Admin",
  }) {
    return {
      id: `demo-activity-${Date.now()}`,
      subAdminId: subAdminId ?? "N/A",
      subAdminUsername: subAdminUsername || "demo_operator",
      action: action || SUB_ADMIN_ACTIVITY_TYPES.EDIT,
      description: description || "Sub Admin action recorded (Demo).",
      performedBy: performedBy || "Brand Admin",
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
  },
};

export default subAdminActivityService;
