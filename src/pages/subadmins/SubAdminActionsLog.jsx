/**
 * SubAdminActionsLog (Forwarding Alias)
 *
 * Re-exports SubAdminActivityHistory to maintain backward compatibility.
 */

import SubAdminActivityHistory from "./SubAdminActivityHistory";

export { SubAdminActivityHistory };
export const SubAdminActionsLog = SubAdminActivityHistory;
export default SubAdminActivityHistory;
