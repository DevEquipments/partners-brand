import { usePermissions } from "../../hooks/usePermissions";

export const PermissionGate = ({
  permission,
  module,
  fallback = null,
  children,
}) => {
  const { hasPermission, canAccessModule } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (module && !canAccessModule(module)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
