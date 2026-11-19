/**
 * Sub-Admin Activity Tracking — Demonstration Dataset
 *
 * NOTICE: DEMONSTRATION DATA ONLY
 * This is static fictional demonstration data for frontend review while
 * backend audit APIs are under development.
 * It does not contain real customer or production operator information.
 *
 * Supported Action Types:
 * 1. ADD - Sub-Admin account created
 * 2. EDIT - Sub-Admin profile updated
 * 3. DELETE - Sub-Admin deleted
 * 4. ACTIVATE - Sub-Admin account activated
 * 5. DEACTIVATE - Sub-Admin account deactivated
 * 6. PERMISSION_CHANGE - Sub-Admin permissions updated
 */

export const SUB_ADMIN_ACTIVITY_TYPES = {
  ADD: "ADD",
  EDIT: "EDIT",
  DELETE: "DELETE",
  ACTIVATE: "ACTIVATE",
  DEACTIVATE: "DEACTIVATE",
  PERMISSION_CHANGE: "PERMISSION_CHANGE",
};

export const SUB_ADMIN_ACTIVITY_DEMO_DATA = [
  {
    id: "demo-activity-6",
    subAdminId: 103,
    subAdminUsername: "demo_operator_south",
    action: SUB_ADMIN_ACTIVITY_TYPES.ACTIVATE,
    description: "Sub Admin account activated.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-19T09:45:00+05:30",
    isDemo: true,
  },
  {
    id: "demo-activity-5",
    subAdminId: 102,
    subAdminUsername: "demo_operator_west",
    action: SUB_ADMIN_ACTIVITY_TYPES.PERMISSION_CHANGE,
    description: "Permissions updated for Sub Admin.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-19T08:15:00+05:30",
    isDemo: true,
  },
  {
    id: "demo-activity-4",
    subAdminId: 101,
    subAdminUsername: "demo_operator_north",
    action: SUB_ADMIN_ACTIVITY_TYPES.DEACTIVATE,
    description: "Sub Admin account deactivated.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-18T17:20:00+05:30",
    isDemo: true,
  },
  {
    id: "demo-activity-3",
    subAdminId: 102,
    subAdminUsername: "demo_operator_west",
    action: SUB_ADMIN_ACTIVITY_TYPES.EDIT,
    description: "Sub Admin profile updated.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-18T14:10:00+05:30",
    isDemo: true,
  },
  {
    id: "demo-activity-2",
    subAdminId: 99,
    subAdminUsername: "demo_operator_temp",
    action: SUB_ADMIN_ACTIVITY_TYPES.DELETE,
    description: "Sub Admin deleted.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-18T11:55:00+05:30",
    isDemo: true,
  },
  {
    id: "demo-activity-1",
    subAdminId: 101,
    subAdminUsername: "demo_operator_north",
    action: SUB_ADMIN_ACTIVITY_TYPES.ADD,
    description: "Sub Admin account created.",
    performedBy: "Brand Admin",
    createdAt: "2026-11-18T10:30:00+05:30",
    isDemo: true,
  },
];

export default SUB_ADMIN_ACTIVITY_DEMO_DATA;
