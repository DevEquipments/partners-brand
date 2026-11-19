/**
 * Sub-Admin Audit Service (Forwarding Alias)
 *
 * Forwards to subAdminActivityService to maintain backward compatibility
 * while enforcing the simplified 6-action tracking architecture.
 */

import {
  subAdminActivityService,
  SUB_ADMIN_ACTIVITY_TYPES,
} from "./subAdminActivityService";

export { subAdminActivityService, SUB_ADMIN_ACTIVITY_TYPES };
export const subAdminAuditService = subAdminActivityService;
export default subAdminActivityService;
