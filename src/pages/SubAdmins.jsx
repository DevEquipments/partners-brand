import { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldAlert,
  AlertCircle,
  Key,
  Search,
  CheckCircle2,
  Lock,
  UserCheck,
} from "lucide-react";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Switch from "../components/common/Switch";
import EmptyState from "../components/common/EmptyState";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const MODULE_PERMISSIONS = [
  {
    module: "Operations Dashboard",
    description: "Operational key metrics, activity velocity charts, and summary feeds",
    actions: [
      { key: PERMISSIONS.DASHBOARD_VIEW, label: "View Dashboard Overview", description: "Access real-time incoming volume trends and activity cards" },
    ],
  },
  {
    module: "Customer Enquiry Management",
    description: "Inbound customer equipment specifications and requirement requests",
    actions: [
      { key: PERMISSIONS.ENQUIRIES_VIEW, label: "View Enquiries Queue", description: "Access customer name, message details, and phone/email" },
      { key: PERMISSIONS.ENQUIRIES_EXPORT, label: "Export Enquiries (CSV)", description: "Download filtered or selected inquiry spreadsheets" },
      { key: PERMISSIONS.ENQUIRIES_UPDATE, label: "Update Enquiry Status", description: "Qualify leads and modify status progression" },
    ],
  },
  {
    module: "Feature Equipment Quotations",
    description: "Commercial pricing and RFQ requests submitted on machinery models",
    actions: [
      { key: PERMISSIONS.QUOTES_VIEW, label: "View Quotations Queue", description: "Access commercial buyer requirements and machinery model requests" },
      { key: PERMISSIONS.QUOTES_EXPORT, label: "Export Quotations (CSV)", description: "Download equipment quotation request spreadsheets" },
      { key: PERMISSIONS.QUOTES_UPDATE, label: "Update Quote Status & Priority", description: "Classify lead priority and modify quote pipeline stages" },
    ],
  },
  {
    module: "Corporate Brand Profile",
    description: "Authorized company credentials, GSTIN, and official contact directory",
    actions: [
      { key: PERMISSIONS.PROFILE_VIEW, label: "View Brand Profile", description: "Access verified OEM company credentials and address directory" },
      { key: PERMISSIONS.PROFILE_EDIT, label: "Edit Brand Profile", description: "Modify company information, GSTIN, and contact phone/email" },
    ],
  },
];

export const SubAdmins = () => {
  const { isAdmin } = usePermissions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPermissions, setSelectedPermissions] = useState([
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ENQUIRIES_VIEW,
    PERMISSIONS.ENQUIRIES_EXPORT,
    PERMISSIONS.QUOTES_VIEW,
    PERMISSIONS.PROFILE_VIEW,
  ]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm();

  // If accessed directly by non-admin, block access at the component level
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <EmptyState
          icon={ShieldAlert}
          title="Admin Access Required"
          description="Sub Admin user management is strictly reserved for primary brand administrators. Subordinate accounts do not have access to manage organization accounts."
        />
      </div>
    );
  }

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCreateSubAdmin = (_data) => {
    // Non-deceptive honest state: inform user clearly that backend endpoint is pending
    toast(
      "Backend persistence pending: Sub Admin management API is not currently available.",
      {
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid #334155",
        },
      }
    );
    setIsCreateModalOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Sub Admin Management"
        subtitle="Provision delegated staff accounts and configure granular role permissions"
        breadcrumbs={[{ label: "Administration" }, { label: "Sub Admins" }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Sub Admin
          </Button>
        }
      />

      {/* Backend Integration Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950 dark:text-amber-200">
            Backend persistence pending
          </p>
          <p className="leading-relaxed">
            Sub Admin management API is not currently available. The frontend permission architecture and granular RBAC controls are fully configured, but accounts cannot be saved to the database until the API gateway provisions the required endpoints (<code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">POST /sub-admin-create</code>, <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">GET /sub-admins</code>).
          </p>
        </div>
      </div>

      {/* Sub Admin User Directory Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-900/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Authorized Brand Sub Admins
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Staff members with delegated module access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff accounts..."
                className="w-56 h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg outline-none transition-colors hover:border-slate-400 dark:hover:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <EmptyState
          icon={Users}
          title="No Sub Admin users found"
          description="Sub Admins allow your team members to monitor inquiries and process quotations with granular permission governance."
          actionLabel="Provision First Sub Admin"
          onAction={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Comprehensive Permission Architecture Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Key className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Granular RBAC Permission Matrix
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Module and action boundaries enforced across the portal
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Enforced by usePermissions Engine
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULE_PERMISSIONS.map((group) => (
            <div
              key={group.module}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 space-y-3"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {group.module}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {group.description}
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-750">
                {group.actions.map((act) => (
                  <div
                    key={act.key}
                    className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {act.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {act.key}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redesigned Enterprise Create Sub Admin Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Sub Admin User"
        subtitle="Configure subordinate brand credentials and assign explicit permissions"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(handleCreateSubAdmin)} className="space-y-6">
          {/* Section 1: Account Identity (2 Column Grid) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <UserCheck className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1. Staff Credentials
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Ramesh Kumar"
                error={errors.name?.message}
                {...register("name", { required: "Full name is required" })}
              />

              <Input
                label="Official Email Address"
                type="email"
                placeholder="ramesh@brandpartner.com"
                error={errors.email?.message}
                {...register("email", {
                  required: "Official email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Valid email is required",
                  },
                })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Assigned Username"
                placeholder="ramesh_ops"
                error={errors.username?.message}
                {...register("username", { required: "Username is required" })}
              />

              <Input
                label="Contact Mobile Number"
                type="tel"
                placeholder="10-digit mobile"
                error={errors.phone?.message}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Valid 10-digit mobile required",
                  },
                })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Account Password"
                type="password"
                placeholder="Minimum 6 characters"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters required" },
                })}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                error={errors.confirm_password?.message}
                {...register("confirm_password", {
                  required: "Please confirm password",
                  validate: (val) => val === getValues("password") || "Passwords do not match",
                })}
              />
            </div>
          </div>

          {/* Section 2: Role & Granular Permission Assignment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  2. Role & Access Governance
                </h4>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                Role: SUB_ADMIN (Fixed)
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-850/60">
              {MODULE_PERMISSIONS.map((group) => (
                <div
                  key={group.module}
                  className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {group.module}
                  </span>

                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {group.actions.map((act) => (
                      <Switch
                        key={act.key}
                        label={act.label}
                        description={act.description}
                        checked={selectedPermissions.includes(act.key)}
                        onChange={() => togglePermission(act.key)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={UserPlus}>
              Save Sub Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubAdmins;
