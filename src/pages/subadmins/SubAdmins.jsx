import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Plus,
  Mail,
  ShieldCheck,
  Building,
  Building2,
  Phone,
  MapPin,
  ShieldAlert,
  AlertCircle,
  Eye,
  UserPlus,
  User,
  Lock,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useSubAdmins } from "../../hooks/useSubAdmins";
import { usePermissions } from "../../hooks/usePermissions";
import { useBrand } from "../../hooks/useBrand";
import { useAppForm } from "../../hooks/useAppForm";
import SubAdminDetail from "./SubAdminDetail";
import SubAdminPermissions from "./SubAdminPermissions";
import DataTable from "../../components/common/DataTable";
import TableToolbar from "../../components/common/TableToolbar";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import Drawer from "../../components/common/Drawer";
import Form from "../../components/common/Form";
import ErrorState from "../../components/common/ErrorState";
import { TableSkeleton } from "../../components/common/Skeletons";
import toast from "react-hot-toast";

const SUBADMIN_FORM_FIELDS = [
  {
    name: "username",
    label: "Username (Login) *",
    type: "text",
    required: true,
    placeholder: "e.g. operator_north",
    icon: User,
    colSpan: 1,
  },
  {
    name: "password",
    label: "Password *",
    type: "password",
    required: true,
    placeholder: "Min. 6 characters",
    autoComplete: "new-password",
    icon: Lock,
    colSpan: 1,
  },
  {
    name: "email",
    label: "Official Email *",
    type: "email",
    required: true,
    placeholder: "operator@partnerbrand.in",
    icon: Mail,
    colSpan: 1,
  },
  {
    name: "phone_no",
    label: "Contact Phone",
    type: "tel",
    placeholder: "9822012345",
    icon: Phone,
    colSpan: 1,
  },
  {
    name: "company_name",
    label: "Company Name",
    placeholder: "Regional Office / Branch",
    icon: Building,
    colSpan: 1,
  },
  {
    name: "gst",
    label: "GST Number",
    placeholder: "GST Identification Number",
    icon: FileText,
    colSpan: 1,
  },
  {
    name: "office_address",
    label: "Office Address",
    placeholder: "Physical Office Address",
    icon: MapPin,
    colSpan: 2,
  },
];

export const SubAdmins = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubAdminId = searchParams.get("subAdminId");
  const urlView = searchParams.get("view");

  const { isAdmin } = usePermissions();
  const { brandId: authBrandId, brandName: authBrandName } = useBrand();
  const {
    subAdmins,
    isLoading,
    error,
    retry,
    createSubAdmin,
    allowedSubAdmins,
    currentSubAdmins,
    remainingSubAdmins,
    isLimitsLoaded,
    limits,
    brandId: hookBrandId,
    brandName: hookBrandName,
  } = useSubAdmins();

  const activeBrandId = limits?.brand_id || hookBrandId || authBrandId;
  const activeBrandName = limits?.brand_name || hookBrandName || authBrandName;

  const isLimitReached = isLimitsLoaded && remainingSubAdmins !== null && remainingSubAdmins <= 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);
  const [viewMode, setViewMode] = useState(urlView || (urlSubAdminId ? "access" : "list"));

  // Add Sub Admin Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form management hook initialized before any early returns
  const {
    values: createFormValues,
    errors: createFormErrors,
    formError: createFormError,
    isSubmitting,
    handleChange: handleCreateFormChange,
    handleSubmit: handleCreateFormSubmit,
    reset: resetCreateForm,
  } = useAppForm({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone_no: "",
      company_name: "",
      office_address: "",
      gst: "",
    },
    validationRules: {
      username: { required: true, label: "Username" },
      password: {
        required: true,
        minLength: 6,
        label: "Password",
      },
      email: { required: true, email: true, label: "Official Email" },
      phone_no: { phone: true, label: "Contact Phone" },
    },
    onSubmit: async (formValues) => {
      // 1. Confirm limit information has loaded successfully
      if (!isLimitsLoaded && remainingSubAdmins === null) {
        throw new Error(
          "Account capacity information is still verifying with the server. Please wait a moment."
        );
      }

      // 2. Check whether remaining_sub_admins is greater than zero
      if (remainingSubAdmins !== null && remainingSubAdmins <= 0) {
        const limitMsg = `Brand has reached its Sub Admin account limit (${allowedSubAdmins ?? "maximum"} allowed). 0 slots remaining.`;
        toast.error(limitMsg, { id: "subadmin-limit-exceeded" });
        throw new Error(limitMsg);
      }

      // 3. Confirm brand identity is resolved
      if (!activeBrandId) {
        throw new Error("Brand identifier is unavailable. Please verify your brand session.");
      }

      const response = await createSubAdmin({
        brand_id: activeBrandId,
        brand_name: activeBrandName,
        username: formValues.username.trim(),
        password: formValues.password,
        company_name: (formValues.company_name || "").trim(),
        office_address: (formValues.office_address || "").trim(),
        phone_no: (formValues.phone_no || "").trim(),
        gst: (formValues.gst || "").trim(),
        email: formValues.email.trim().toLowerCase(),
      });

      const successMsg = response?.message || "Sub-admin created successfully.";
      toast.success(successMsg, { id: "subadmin-create-success" });
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err, generalMsg) => {
      if (!err?.toastShown) {
        toast.error(generalMsg, { id: "subadmin-create-error" });
      }
    },
  });

  const handleOpenCreate = () => {
    if (isLimitReached) {
      toast.error(
        `Cannot add Sub Admin: Brand has reached its account limit (${allowedSubAdmins ?? "—"} allowed).`,
        { id: "subadmin-limit-reached" }
      );
      return;
    }
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

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

  // Keep viewMode in sync when URL query params change
  const effectiveViewMode = urlView || (urlSubAdminId ? "access" : viewMode);

  // Sync selectedSubAdmin when URL parameter changes
  const targetUrlId = urlSubAdminId;
  const currentSelectedId = selectedSubAdmin?.id ? String(selectedSubAdmin.id) : null;
  if (targetUrlId && currentSelectedId !== String(targetUrlId) && subAdmins.length > 0) {
    const matched = subAdmins.find((m) => String(m.id) === String(targetUrlId));
    if (matched && matched !== selectedSubAdmin) {
      setSelectedSubAdmin(matched);
    }
  }

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
  if (effectiveViewMode === "access") {
    return (
      <SubAdminPermissions
        initialSubAdminId={urlSubAdminId || selectedSubAdmin?.id}
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
      className: "min-w-[160px]",
      render: (username) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-600/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-xs shrink-0 border border-orange-500/20">
            {username?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">
              @{username}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      className: "min-w-[180px]",
      render: (email) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[200px]" title={email}>{email || "-"}</span>
        </span>
      ),
    },
    {
      key: "company_name",
      label: "Company",
      className: "min-w-[140px]",
      render: (company) => (
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium min-w-0">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[160px]" title={company}>{company || "-"}</span>
        </span>
      ),
    },
    {
      key: "phone_no",
      label: "Phone",
      className: "min-w-[130px]",
      render: (phone) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{phone || "-"}</span>
        </span>
      ),
    },
    {
      key: "office_address",
      label: "Office Address",
      className: "min-w-[180px]",
      render: (address) => (
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs min-w-0">
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
      className: "min-w-[210px]",
      render: (_, member) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
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
    <div className="space-y-6 animate-fade-in w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600 shrink-0" />
            <span className="truncate">Sub Admins</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage regional Sub Admin operators, review operator credentials, and configure module access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {isLimitReached && (
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 px-2.5 py-1 rounded-md flex items-center gap-1.5 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Limit reached ({allowedSubAdmins ?? "—"} max)</span>
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={Plus}
            disabled={isLimitReached}
            className="shrink-0"
            title={isLimitReached ? "Sub Admin account limit reached. Cannot add more sub admins." : "Add Sub Admin"}
          >
            Add Sub Admin
          </Button>
        </div>
      </div>

      {/* Account Capacity & Usage Summary */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs animate-pulse space-y-3 ${
                i === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <StatCard
            icon={ShieldCheck}
            title="Allowed Sub Admins"
            value={allowedSubAdmins !== null ? allowedSubAdmins : "—"}
            subtitle={
              allowedSubAdmins !== null
                ? "Maximum permitted accounts"
                : "Quota limit unavailable"
            }
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Current Sub Admins"
            value={currentSubAdmins !== null ? currentSubAdmins : (subAdmins ? subAdmins.length : "—")}
            subtitle={
              currentSubAdmins !== null
                ? "Active operator accounts"
                : "Active accounts"
            }
            color="orange"
          />
          <StatCard
            className="sm:col-span-2 lg:col-span-1"
            icon={UserPlus}
            title="Remaining Slots"
            value={remainingSubAdmins !== null ? remainingSubAdmins : "—"}
            subtitle={
              remainingSubAdmins === null
                ? "Slot availability unavailable"
                : remainingSubAdmins <= 0
                ? "Capacity limit reached"
                : `${remainingSubAdmins} slot${remainingSubAdmins === 1 ? "" : "s"} available`
            }
            badge={
              remainingSubAdmins === null
                ? "Unavailable"
                : remainingSubAdmins <= 0
                ? "Quota Full"
                : "Available"
            }
            color={
              remainingSubAdmins !== null && remainingSubAdmins <= 0
                ? "slate"
                : "emerald"
            }
          />
        </div>
      )}

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

      {/* Add Sub Admin Drawer (Following Admin Panel Slide-Over Drawer Pattern) */}
      <Drawer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Sub Admin Operator"
        subtitle="Register and configure a new Sub Admin account for this brand."
        width="w-full sm:w-[500px] md:w-[560px]"
        preventClose={isSubmitting}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-subadmin-form"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={isSubmitting || isLimitReached || !isLimitsLoaded}
              title={
                isLimitReached
                  ? "Sub Admin limit reached. No slots remaining."
                  : !isLimitsLoaded
                  ? "Verifying capacity limits..."
                  : "Register Sub Admin"
              }
            >
              Register Sub Admin
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Assigned Brand Identity Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Assigned Brand
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeBrandName || "Brand Partner"}
                </p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-md font-mono text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
              {activeBrandId || "—"}
            </div>
          </div>

          {/* Account Limit / Quota Banner */}
          {isLimitReached ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Sub Admin limit reached ({allowedSubAdmins ?? "—"} allowed)
                </p>
                <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                  This brand has reached its maximum permitted Sub Admin accounts. No remaining slots are available.
                </p>
              </div>
            </div>
          ) : isLimitsLoaded && remainingSubAdmins !== null ? (
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                  Account Capacity Available
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {remainingSubAdmins} of {allowedSubAdmins ?? "—"} slots remaining
              </span>
            </div>
          ) : null}

          <Form
            id="create-subadmin-form"
            fields={SUBADMIN_FORM_FIELDS}
            values={createFormValues}
            onChange={handleCreateFormChange}
            errors={createFormErrors}
            formError={createFormError}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateFormSubmit}
            hideActions
          />
        </div>
      </Drawer>
    </div>
  );
};

export default SubAdmins;
