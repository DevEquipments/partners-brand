import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useSubAdminPermissions } from "../../hooks/useSubAdminPermissions";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionTable from "../../components/common/PermissionTable";
import SearchableSelect from "../../components/common/SearchableSelect";
import Button from "../../components/common/Button";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { TableSkeleton } from "../../components/common/Skeletons";

export const SubAdminPermissions = ({ initialSubAdminId: propSubAdminId, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subAdminIdFromUrl = propSubAdminId || searchParams.get("subAdminId");
  const { isAdmin } = usePermissions();

  const {
    definitions,
    subAdmins,
    selectedSubAdminId,
    selectedSubAdmin,
    permissions,
    isDirty,
    isLoading,
    isSaving,
    error,
    handleSelectSubAdmin,
    handlePermissionChange,
    handleCancel,
    handleSave,
    retry,
  } = useSubAdminPermissions(subAdminIdFromUrl);

  // Format options for react-select SearchableSelect using real sub admin data
  const subAdminOptions = useMemo(() => {
    return subAdmins.map((admin) => ({
      value: String(admin.id),
      label: `@${admin.username}${admin.company_name ? ` (${admin.company_name})` : ""} — ${admin.email || `ID #${admin.id}`}`,
      admin,
    }));
  }, [subAdmins]);

  const onSelectChange = (id) => {
    handleSelectSubAdmin(id);
    if (id) {
      setSearchParams({ subAdminId: id });
    } else {
      setSearchParams({});
    }
  };

  // Admin access guard
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Access Denied
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sub Admin permission management is strictly reserved for primary brand administrators.
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Unable to load Sub Admin permissions"
          message={error}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-1 sm:px-2">
      {/* Top Back Action */}
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Sub Admins</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-900/60 flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sub Admin Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign portal permissions to individual Sub Admin accounts.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          <TableSkeleton rows={6} cols={2} />
        </div>
      ) : subAdmins.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No Sub Admins found"
          description="There are no Sub Admin accounts registered for this brand."
        />
      ) : (
        /* Single Clean Content Flow */
        <div className="space-y-6">
          {/* SELECT SUB ADMIN CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Select Sub Admin
            </h2>

            <SearchableSelect
              placeholder="Search and select Sub Admin by username, company, or email..."
              options={subAdminOptions}
              value={selectedSubAdminId}
              onChange={onSelectChange}
              isClearable={false}
              isLoading={isLoading}
            />

            {/* Compact Sub Admin Identity Summary */}
            {selectedSubAdmin && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Sub Admin ID
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    #{selectedSubAdmin.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Username
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    @{selectedSubAdmin.username}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Company
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate block font-medium"
                    title={selectedSubAdmin.company_name || "-"}
                  >
                    {selectedSubAdmin.company_name || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Email
                  </span>
                  <span
                    className="text-slate-700 dark:text-slate-300 truncate block"
                    title={selectedSubAdmin.email || "-"}
                  >
                    {selectedSubAdmin.email || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MODULE ACCESS CONTROL CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4 shadow-2xs">
            <div>
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Module Access Control
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle module access for {selectedSubAdmin ? `@${selectedSubAdmin.username}` : "the selected Sub Admin"}. Enabled modules will be visible in their portal.
              </p>
            </div>

            {/* Dynamic Permission List */}
            <PermissionTable
              definitions={definitions}
              permissions={permissions}
              onChange={handlePermissionChange}
              disabled={isLoading || isSaving}
            />

            {/* Single Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={!isDirty || isSaving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!isDirty || isSaving}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminPermissions;
