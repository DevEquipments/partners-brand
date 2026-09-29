import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import EmptyState from "../common/EmptyState";
import { ShieldAlert } from "lucide-react";

export const PermissionRoute = ({ module, permission, adminOnly = false, children }) => {
  const { canAccessModule, hasPermission, isAdmin } = usePermissions();
  const navigate = useNavigate();

  // Admin-only module guard
  if (adminOnly && !isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <EmptyState
          icon={ShieldAlert}
          title="Access Restricted"
          description="This section is strictly reserved for Brand Administrators. Your Sub Admin account does not have access."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  const isAllowed = isAdmin || (
    module
      ? canAccessModule(module)
      : permission
      ? hasPermission(permission)
      : true
  );

  if (!isAllowed) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <EmptyState
          icon={ShieldAlert}
          title="Access Restricted"
          description="Your Sub Admin account does not currently have permission to access this module. Please contact your Brand Administrator for access."
          actionLabel="Go to Dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  return children;
};

export default PermissionRoute;
