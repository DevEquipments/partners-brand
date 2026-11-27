import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  CheckCircle2,
  RotateCcw,
  Save,
  Search,
  Plus,
  Pencil,
  Layers,
  MessageSquareText,
  Clock,
  BarChart3,
  FileSpreadsheet,
  AlertCircle,
  Sliders,
  ListFilter,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { permissionManagementService } from "../../services/permissionManagementService";
import {
  subAdminPermissionService,
  buildAssignedPermissionsMap,
  resolveRoleId,
} from "../../services/subAdminPermissionService";
import { subAdminSidebarService } from "../../services/subAdminSidebarService";
import Button from "../../components/common/Button";
import Switch from "../../components/common/Switch";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import PermissionFormModal from "../../components/permissions/PermissionFormModal";
import ErrorState from "../../components/common/ErrorState";
import { TableSkeleton } from "../../components/common/Skeletons";
import { getApiErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";

// Helper to map module names to contextual icons
const getModuleIcon = (slug = "") => {
  const s = slug.toLowerCase();
  if (s.includes("lead")) return Layers;
  if (s.includes("enquir") || s.includes("inquir")) return MessageSquareText;
  if (s.includes("quote")) return FileSpreadsheet;
  if (s.includes("follow")) return Clock;
  if (s.includes("report")) return BarChart3;
  return Shield;
};

/**
 * Brand Admin Permission Management
 *
 * Provides complete management of:
 * 1. Brand Admin Role Permissions (enable/disable CRM modules via backend API contracts)
 * 2. System Permission Definitions (catalog definitions CRUD)
 *
 * Endpoints:
 * - POST /get-premium-brand-permissions
 * - POST /sub-admin-sidebar { role_id: user.id }
 * - POST /add-premium-brand-role-permission
 * - POST /delete-role-permission
 * - POST /premium-brand-add-permission
 * - POST /premium-brand-edit-permission
 */
export const PermissionManagement = () => {
  const { user } = useAuth();
  const { isAdmin, refreshAdminPermissions } = usePermissions();

  const [activeTab, setActiveTab] = useState("assignment"); // 'assignment' | 'catalog'
  const [searchQuery, setSearchQuery] = useState("");

  // Permissions Data States
  const [definitions, setDefinitions] = useState([]);
  const [toggledPermissions, setToggledPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});

  // Loading and Process States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Catalog Definition Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedDefinition, setSelectedDefinition] = useState(null);

  // Resolve active role ID for the current user
  const currentRoleId = useMemo(() => resolveRoleId(user), [user]);

  // Load dynamic definitions and Admin's assigned permissions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [defs, assignedList] = await Promise.all([
        permissionManagementService.fetchPermissionDefinitions().catch((err) => {
          console.warn("Failed to fetch definitions:", err.message);
          return [];
        }),
        currentRoleId
          ? subAdminSidebarService.fetchSubAdminSidebar({ role_id: currentRoleId }).catch((err) => {
              console.warn("Failed to fetch assigned sidebar permissions:", err.message);
              return [];
            })
          : Promise.resolve([]),
      ]);

      const normalizedDefs = Array.isArray(defs) ? defs : [];
      setDefinitions(normalizedDefs);

      // Build assigned permissions map
      const map = buildAssignedPermissionsMap(normalizedDefs, assignedList);

      // If backend assignedList is empty (initial state for brand admin), default all definitions to active
      if (!assignedList || assignedList.length === 0) {
        normalizedDefs.forEach((def) => {
          map[def.slug] = true;
        });
      }

      setToggledPermissions({ ...map });
      setOriginalPermissions({ ...map });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load permissions data."));
    } finally {
      setIsLoading(false);
    }
  }, [currentRoleId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    init();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Toggle single permission
  const handleToggle = (slug) => {
    setToggledPermissions((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Check if state is modified compared to server
  const isDirty = useMemo(() => {
    if (!originalPermissions || !toggledPermissions) return false;
    return definitions.some(
      (def) => Boolean(originalPermissions[def.slug]) !== Boolean(toggledPermissions[def.slug])
    );
  }, [definitions, originalPermissions, toggledPermissions]);

  // Filter definitions
  const filteredDefinitions = useMemo(() => {
    if (!searchQuery.trim()) return definitions;
    const q = searchQuery.toLowerCase().trim();
    return definitions.filter(
      (d) =>
        (d.name || "").toLowerCase().includes(q) ||
        (d.slug || "").toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q)
    );
  }, [definitions, searchQuery]);

  // Discard changes
  const handleDiscard = () => {
    setToggledPermissions({ ...originalPermissions });
    toast("Changes discarded.", { id: "perm-admin-toast" });
  };

  // Save permissions
  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    if (!user) {
      toast.error("User session is required to save permissions.", { id: "perm-admin-toast" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await subAdminPermissionService.savePermissions({
        subAdmin: user,
        permissions: toggledPermissions,
        definitions,
        originalPermissions,
      });

      if (res?.success) {
        toast.success(res?.message || "Admin permissions saved successfully.", {
          id: "perm-admin-toast",
        });

        // Refetch fresh permissions from server to guarantee sync
        try {
          if (currentRoleId) {
            const freshAssigned = await subAdminSidebarService.fetchSubAdminSidebar({
              role_id: currentRoleId,
            });
            const freshMap = buildAssignedPermissionsMap(definitions, freshAssigned);
            setToggledPermissions({ ...freshMap });
            setOriginalPermissions({ ...freshMap });
          } else {
            setOriginalPermissions({ ...toggledPermissions });
          }
        } catch {
          setOriginalPermissions({ ...toggledPermissions });
        }

        // Update active application permissions context immediately
        if (typeof refreshAdminPermissions === "function") {
          await refreshAdminPermissions();
        }
      } else {
        toast.error(res?.message || "Failed to update permissions.", { id: "perm-admin-toast" });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save permissions. Please try again."), {
        id: "perm-admin-toast",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Catalog Definition Handlers
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedDefinition(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (def) => {
    setModalMode("edit");
    setSelectedDefinition(def);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (payload) => {
    if (modalMode === "add") {
      const res = await permissionManagementService.addPermission(payload);
      toast.success(res?.message || "Permission definition added successfully.", {
        id: "perm-admin-toast",
      });
    } else {
      const res = await permissionManagementService.editPermission(payload);
      toast.success(res?.message || "Permission definition updated successfully.", {
        id: "perm-admin-toast",
      });
    }
    setIsModalOpen(false);
    await loadData();
    if (typeof refreshAdminPermissions === "function") {
      await refreshAdminPermissions();
    }
  };

  // Derived Summary Metrics
  const totalCount = definitions.length;
  const enabledCount = definitions.filter((def) => Boolean(toggledPermissions[def.slug])).length;
  const lockedCount = Math.max(0, totalCount - enabledCount);

  // Guard: Strictly Admin Only
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Admin Access Required
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Permission configuration is strictly reserved for primary brand administrators.
        </p>
      </div>
    );
  }

  // Table columns for Catalog Definitions tab
  const catalogColumns = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
      render: (id) => (
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
          #{id}
        </span>
      ),
    },
    {
      key: "name",
      label: "Permission Name",
      render: (name, def) => {
        const IconComponent = getModuleIcon(def.slug || name);
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{name}</p>
              {def.description && (
                <p className="text-[11px] text-slate-400 truncate max-w-xs">{def.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "slug",
      label: "Identifier Slug",
      render: (slug) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {slug}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          <span>Active Definition</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, def) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(def)}
            icon={Pencil}
            title="Edit permission definition"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full min-w-0 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Permission Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure system role permissions and manage global definitions.
            </p>
          </div>
        </div>

        {activeTab === "catalog" && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={Plus}
            className="shrink-0"
          >
            Add Permission Definition
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("assignment")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "assignment"
              ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Admin Role Permissions</span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "catalog"
              ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Permission Catalog Definitions</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load permissions"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <TableSkeleton rows={6} cols={3} />
        </div>
      ) : (
        <>
          {/* TAB 1: Role Permissions Assignment */}
          {activeTab === "assignment" && (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Total System Permissions"
                  value={totalCount}
                  icon={Shield}
                  description="Dynamic modules configured"
                />
                <StatCard
                  title="Enabled Permissions"
                  value={enabledCount}
                  icon={CheckCircle2}
                  trend={{ value: `${Math.round((enabledCount / (totalCount || 1)) * 100)}%`, isPositive: true }}
                  description="Active on Brand Admin role"
                />
                <StatCard
                  title="Locked / Restricted"
                  value={lockedCount}
                  icon={Lock}
                  trend={{ value: `${lockedCount} restricted`, isPositive: lockedCount === 0 }}
                  description="Inactive on Brand Admin role"
                />
              </div>

              {/* Dirty Changes Floating Bar */}
              {isDirty && (
                <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slide-down">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-semibold text-orange-900 dark:text-orange-200">
                      You have unsaved permission changes. Save your changes to apply them to your role.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDiscard}
                      disabled={isSaving}
                      icon={RotateCcw}
                    >
                      Discard
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      isLoading={isSaving}
                      icon={Save}
                    >
                      Save Permissions
                    </Button>
                  </div>
                </div>
              )}

              {/* Card Container for Permissions Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
                {/* Search & Actions Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search permissions by name or slug..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDiscard}
                      disabled={!isDirty || isSaving}
                      icon={RotateCcw}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={!isDirty || isSaving}
                      isLoading={isSaving}
                      icon={Save}
                    >
                      Save Permissions
                    </Button>
                  </div>
                </div>

                {/* Permissions Rows */}
                {filteredDefinitions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {searchQuery
                      ? `No permissions matching "${searchQuery}".`
                      : "No permissions available."}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredDefinitions.map((def) => {
                      const IconComponent = getModuleIcon(def.slug || def.name);
                      const isEnabled = Boolean(toggledPermissions[def.slug]);

                      return (
                        <div
                          key={def.id || def.slug}
                          className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                            isEnabled
                              ? "bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                              : "bg-slate-50/30 dark:bg-slate-900/40 opacity-70 hover:opacity-90"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isEnabled
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 dark:text-white">
                                  {def.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700/60">
                                  {def.slug}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                                {def.description ||
                                  (isEnabled
                                    ? "Full read and write operations permitted for this module."
                                    : "Access to this module is currently restricted.")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <span
                              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                isEnabled
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {isEnabled ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Enabled</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  <span>Locked</span>
                                </>
                              )}
                            </span>

                            <Switch
                              checked={isEnabled}
                              onChange={() => handleToggle(def.slug)}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Catalog Definitions CRUD */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search definitions by name or slug..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Definitions Table */}
              <DataTable
                columns={catalogColumns}
                data={filteredDefinitions}
                isLoading={isLoading}
                keyExtractor={(item) => String(item.id || item.slug)}
                emptyMessage={
                  searchQuery
                    ? `No permission definitions matching "${searchQuery}".`
                    : "No permission definitions found."
                }
              />
            </div>
          )}
        </>
      )}

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <PermissionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          initialData={selectedDefinition}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default PermissionManagement;
