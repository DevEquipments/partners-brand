import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Shield,
  Plus,
  Pencil,
  Search,
} from "lucide-react";
import { permissionManagementService } from "../../services/permissionManagementService";
import { usePermissions } from "../../hooks/usePermissions";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import PermissionFormModal from "../../components/permissions/PermissionFormModal";
import { getApiErrorMessage } from "../../utils/errorHandler";
import toast from "react-hot-toast";

/**
 * Permission Definition Management
 *
 * Allows Main Admin to view, create, and edit system permission definitions.
 * Integrates:
 * - POST /get-premium-brand-permissions
 * - POST /premium-brand-add-permission
 * - POST /premium-brand-edit-permission
 */
export const PermissionManagement = () => {
  const { isAdmin, refreshAdminPermissions } = usePermissions();

  const [definitions, setDefinitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedDefinition, setSelectedDefinition] = useState(null);

  const loadDefinitions = useCallback(async () => {
    setIsLoading(true);
    try {
      const defs = await permissionManagementService.fetchPermissionDefinitions();
      setDefinitions(defs);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load permission definitions."), {
        id: "perm-mgmt-toast",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchInit = async () => {
      setIsLoading(true);
      try {
        const defs = await permissionManagementService.fetchPermissionDefinitions();
        if (isMounted) setDefinitions(defs);
      } catch (err) {
        if (isMounted) {
          toast.error(getApiErrorMessage(err, "Failed to load permission definitions."), {
            id: "perm-mgmt-toast",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInit();

    return () => {
      isMounted = false;
    };
  }, []);

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
      toast.success(res?.message || "Permission added successfully.", {
        id: "perm-mgmt-toast",
      });
    } else {
      const res = await permissionManagementService.editPermission(payload);
      toast.success(res?.message || "Permission updated successfully.", {
        id: "perm-mgmt-toast",
      });
    }
    setIsModalOpen(false);
    await Promise.all([
      loadDefinitions(),
      typeof refreshAdminPermissions === "function" ? refreshAdminPermissions() : Promise.resolve(),
    ]);
  };

  // Filter definitions by name or slug
  const filteredDefinitions = useMemo(() => {
    if (!searchQuery.trim()) return definitions;
    const q = searchQuery.toLowerCase().trim();
    return definitions.filter(
      (d) =>
        (d.name || "").toLowerCase().includes(q) ||
        (d.slug || "").toLowerCase().includes(q)
    );
  }, [definitions, searchQuery]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Permission definition management is reserved for administrators.
      </div>
    );
  }

  const columns = [
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
      render: (name) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-xs">
            {name}
          </span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Active
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
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Permissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage global permission definitions available for Sub Admin assignment.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={Plus}
        >
          Add Permission
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions by name or slug..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Permissions Table */}
      <DataTable
        columns={columns}
        data={filteredDefinitions}
        isLoading={isLoading}
        keyExtractor={(item) => String(item.id || item.slug)}
        emptyMessage={
          searchQuery
            ? `No permissions matching "${searchQuery}".`
            : "No permission definitions found."
        }
      />

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
