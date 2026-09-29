import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Plus,
  Mail,
  Eye,
  ShieldCheck,
  Building,
  Phone,
  MapPin,
  ShieldAlert,
  X,
} from "lucide-react";
import { useSubAdmins } from "../../hooks/useSubAdmins";
import { usePermissions } from "../../hooks/usePermissions";
import SubAdminDetail from "./SubAdminDetail";
import SubAdminPermissions from "./SubAdminPermissions";
import DataTable from "../../components/common/DataTable";
import TableToolbar from "../../components/common/TableToolbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ErrorState from "../../components/common/ErrorState";
import { TableSkeleton } from "../../components/common/Skeletons";
import toast from "react-hot-toast";

export const SubAdmins = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubAdminId = searchParams.get("subAdminId");
  const urlView = searchParams.get("view");

  const { isAdmin } = usePermissions();
  const {
    subAdmins,
    isLoading,
    error,
    retry,
  } = useSubAdmins();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [viewMode, setViewMode] = useState(urlView || (urlSubAdminId ? "access" : "list"));

  // Add Sub Admin Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [gst, setGst] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side search across real API fields
  const filteredSubAdmins = useMemo(() => {
    if (!searchQuery.trim()) {
      return subAdmins;
    }
    const q = searchQuery.toLowerCase().trim();
    return subAdmins.filter((member) => {
      const matchId = String(member.id).includes(q);
      const matchUser = (member.username || "").toLowerCase().includes(q);
      const matchEmail = (member.email || "").toLowerCase().includes(q);
      const matchCompany = (member.company_name || "").toLowerCase().includes(q);
      const matchPhone = (member.phone_no || member.phone || "").toLowerCase().includes(q);
      const matchAddress = (member.office_address || "").toLowerCase().includes(q);
      const matchGst = (member.gst || "").toLowerCase().includes(q);

      return (
        matchId ||
        matchUser ||
        matchEmail ||
        matchCompany ||
        matchPhone ||
        matchAddress ||
        matchGst
      );
    });
  }, [subAdmins, searchQuery]);

  const hasActiveFilters = Boolean(searchQuery.trim());

  const handleClearFilters = () => {
    setSearchQuery("");
  };

  // Admin access guard
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Admin Access Required
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sub Admin operator management is strictly reserved for primary brand administrators.
        </p>
      </div>
    );
  }

  // View: Permission / Module Access Interface
  if (viewMode === "access") {
    return (
      <SubAdminPermissions
        initialSubAdminId={selectedSubAdmin?.id || urlSubAdminId}
        onBack={() => {
          setViewMode("list");
          setSelectedSubAdmin(null);
          setSearchParams({});
        }}
      />
    );
  }

  // View: Sub Admin Detail Overview
  if (viewMode === "detail" && selectedSubAdmin) {
    return (
      <SubAdminDetail
        subAdmin={selectedSubAdmin}
        _subAdminId={selectedSubAdmin.id}
        onBack={() => {
          setViewMode("list");
          setSelectedSubAdmin(null);
          setSearchParams({});
        }}
        onManageAccess={(member) => {
          setSelectedSubAdmin(member);
          setViewMode("access");
          setSearchParams({ subAdminId: member.id, view: "access" });
        }}
      />
    );
  }

  const handleOpenCreate = () => {
    setUsername("");
    setEmail("");
    setPhone("");
    setCompanyName("");
    setOfficeAddress("");
    setGst("");
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || !email.trim()) {
      setFormError("Please fill out username and official email.");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.success(
        `Sub Admin creation request received for @${username.trim()}. Contact your system administrator to complete credentials provisioning.`
      );
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to submit Sub Admin registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns Definition according to prompt requirements
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
      key: "username",
      label: "Username",
      render: (username) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-xs shrink-0 border border-orange-500/20">
            {username?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              @{username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (email) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{email || "-"}</span>
        </span>
      ),
    },
    {
      key: "company_name",
      label: "Company",
      render: (company) => (
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{company || "-"}</span>
        </span>
      ),
    },
    {
      key: "phone_no",
      label: "Phone",
      render: (phone) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{phone || "-"}</span>
        </span>
      ),
    },
    {
      key: "office_address",
      label: "Office Address",
      render: (address) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[200px]" title={address}>
            {address || "-"}
          </span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, member) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubAdmin(member);
              setViewMode("detail");
            }}
            icon={Eye}
            title="View details"
          >
            View
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubAdmin(member);
              setViewMode("access");
              setSearchParams({ subAdminId: member.id, view: "access" });
            }}
            icon={ShieldCheck}
            title="Manage Sub Admin module access"
          >
            Manage Access
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>Sub Admins</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage regional Sub Admin operators, review operator credentials, and configure module access permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={Plus}
        >
          Add Sub Admin
        </Button>
      </div>

      {/* TableToolbar with Search and Sub Admin Count */}
      <TableToolbar
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by ID, username, email, company, or address..."
        tabs={[
          { value: "all", label: "All Sub Admins", count: subAdmins.length },
        ]}
        activeTab="all"
        onTabChange={() => {}}
        hasActiveFilters={hasActiveFilters}
        onClear={handleClearFilters}
      />

      {/* Error State */}
      {error && !isLoading ? (
        <ErrorState
          title="Unable to load Sub Admins"
          message={error}
          onRetry={retry}
        />
      ) : isLoading ? (
        /* Loading Skeleton */
        <TableSkeleton rows={5} cols={7} />
      ) : (
        /* Sub Admins DataTable */
        <DataTable
          columns={columns}
          data={filteredSubAdmins}
          emptyTitle="No Sub Admins found"
          emptyDescription={
            searchQuery.trim()
              ? "There are no Sub Admin operators matching your search query."
              : "No Sub Admin accounts registered for this brand."
          }
          rowKey="id"
          onRowClick={(member) => {
            setSelectedSubAdmin(member);
            setViewMode("access");
            setSearchParams({ subAdminId: member.id, view: "access" });
          }}
        />
      )}

      {/* Add Sub Admin Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-xs p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Sub Admin Operator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure Sub Admin details for this brand.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Username (Login) *"
                  required
                  placeholder="e.g. operator_north"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  label="Official Email *"
                  type="email"
                  required
                  placeholder="operator@partnerbrand.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone"
                  type="tel"
                  placeholder="9822012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Company Name"
                  placeholder="Regional Office / Branch"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <Input
                label="Office Address"
                placeholder="Physical Office Address"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
              />

              <Input
                label="GST Number"
                placeholder="GST Identification Number"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  Register Sub Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
