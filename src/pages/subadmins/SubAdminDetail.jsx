import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Building,
  User,
  Edit3,
  KeyRound,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  Lock,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquareText,
  Clock,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import Button from "../../components/common/Button";
import Switch from "../../components/common/Switch";
import { normalizeSubAdminStatus } from "../../utils/subAdminStatus";
import {
  subAdminPermissionService,
  buildAssignedPermissionsMap,
} from "../../services/subAdminPermissionService";

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

export const SubAdminDetail = ({
  subAdmin,
  _subAdminId,
  onBack,
  onManageAccess,
  onToggleStatus,
  isUpdatingStatus = false,
  onEdit,
  onDelete,
  onUpdatePassword,
}) => {
  const navigate = useNavigate();
  const member = subAdmin;
  const statusInfo = normalizeSubAdminStatus(member?.status, member?.status_text);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  // Dynamic permissions state
  const [permissionDefs, setPermissionDefs] = useState([]);
  const [assignedPerms, setAssignedPerms] = useState([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(true);

  // Fetch real permission definitions & assigned privileges
  useEffect(() => {
    let isMounted = true;
    const loadPermissions = async () => {
      try {
        setIsLoadingPerms(true);
        const [defs, assigned] = await Promise.all([
          subAdminPermissionService.fetchPermissionDefinitions().catch(() => []),
          subAdminPermissionService.fetchAssignedPermissions(member?.id).catch(() => []),
        ]);
        if (isMounted) {
          setPermissionDefs(Array.isArray(defs) ? defs : []);
          setAssignedPerms(Array.isArray(assigned) ? assigned : []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) {
          setIsLoadingPerms(false);
        }
      }
    };

    if (member?.id) {
      loadPermissions();
    }

    return () => {
      isMounted = false;
    };
  }, [member?.id]);

  if (!member) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-500">Sub Admin not found.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Return to Sub Admins list
        </Button>
      </div>
    );
  }

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleManageAccess = () => {
    if (onManageAccess) {
      onManageAccess(member);
    } else {
      navigate(`/sub-admins?subAdminId=${member.id}&view=access`);
    }
  };

  const permissionsMap = buildAssignedPermissionsMap(permissionDefs, assignedPerms);
  const activePermsCount = Object.values(permissionsMap).filter(Boolean).length;
  const totalPermsCount = permissionDefs.length;

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Top Header & Admin Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          icon={ArrowLeft}
        >
          Back to Sub Admins
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(member)}
              icon={Edit3}
            >
              Edit Profile
            </Button>
          )}

          {onUpdatePassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdatePassword(member)}
              icon={KeyRound}
            >
              Reset Password
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleManageAccess}
            icon={ShieldCheck}
          >
            Manage Permissions
          </Button>

          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(member)}
              icon={Trash2}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Operator Hero Profile Banner */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Avatar and Primary Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/15 to-orange-700/20 text-orange-600 dark:text-orange-400 font-extrabold text-2xl flex items-center justify-center border border-orange-500/30 shadow-xs shrink-0">
              {member.username?.[0]?.toUpperCase() || "S"}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  @{member.username}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Role: Sub Admin
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 ${statusInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                  <span>{statusInfo.text}</span>
                </span>
              </div>

              {/* Subtitle Chips */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {member.company_name || "Regional Office"}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.email || "No email"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.phone_no || member.phone || "No phone"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Single Status Switch */}
          {onToggleStatus && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shrink-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Account Active:
              </span>
              <Switch
                checked={Boolean(statusInfo.isActive)}
                disabled={isUpdatingStatus || statusInfo.isActive === null}
                onChange={() => onToggleStatus(member)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Unified 2-Column Section: Credentials & Branch Information (No separate tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Operator Credentials & Account Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Operator Credentials & Account Information
                </h2>
                <p className="text-[11px] text-slate-400">
                  System login credentials and brand identity
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs flex-1">
            {/* Username */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Username (Login ID)</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  @{member.username}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(member.username, "username")}
                  className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors"
                  title="Copy username"
                >
                  {copiedKey === "username" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Official Email */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Official Email</span>
              <div className="flex items-center gap-1.5">
                <a
                  href={`mailto:${member.email}`}
                  className="text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {member.email || "Not specified"}
                </a>
                {member.email && (
                  <button
                    type="button"
                    onClick={() => handleCopy(member.email, "email")}
                    className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors"
                    title="Copy email"
                  >
                    {copiedKey === "email" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Contact Phone */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Contact Phone</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {member.phone_no || member.phone || "Not specified"}
                </span>
                {(member.phone_no || member.phone) && (
                  <button
                    type="button"
                    onClick={() => handleCopy(member.phone_no || member.phone, "phone")}
                    className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors"
                    title="Copy phone"
                  >
                    {copiedKey === "phone" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Associated Brand */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Associated Brand</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {member.brand_name || "Partner"}
                </span>
              </div>
            </div>

            {/* System Role */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">System Role</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Sub Admin (Brand Regional Operator)
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Company & Regional Branch Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Company & Regional Office
                </h2>
                <p className="text-[11px] text-slate-400">
                  Physical branch, tax details, and location
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs flex-1">
            {/* Company / Branch Name */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Company Name</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {member.company_name || "Not specified"}
              </span>
            </div>

            {/* GST Number */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">GST Identification</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  {member.gst || "Not provided"}
                </span>
                {member.gst && (
                  <button
                    type="button"
                    onClick={() => handleCopy(member.gst, "gst")}
                    className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-md transition-colors"
                    title="Copy GST"
                  >
                    {copiedKey === "gst" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Office Address */}
            <div className="py-2.5 flex items-start justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">
                Office Address
              </span>
              <div className="flex items-start gap-1.5 text-right">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 max-w-xs leading-relaxed">
                  {member.office_address || "Not specified"}
                </span>
              </div>
            </div>

            {/* Operational Jurisdiction Note */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Territory Scope</span>
              <span className="text-slate-600 dark:text-slate-300">
                Regional Brand Equipment Enquiries & Quotes
              </span>
            </div>

            {/* Branch Status */}
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Branch Verification</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Branch Account</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: CRM Module Access & Permissions Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  CRM Permissions & Module Access
                </h2>
                {!isLoadingPerms && totalPermsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    {activePermsCount} of {totalPermsCount} Enabled
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Modules this operator is authorized to view and manage in the brand CRM
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManageAccess}
            icon={ExternalLink}
            className="shrink-0"
          >
            Configure Permissions
          </Button>
        </div>

        <div className="p-4 sm:p-5">
          {isLoadingPerms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                </div>
              ))}
            </div>
          ) : permissionDefs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <Shield className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Default regional operator permissions applied
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageAccess}
                icon={ArrowRight}
              >
                Open Permission Manager
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissionDefs.map((def) => {
                const IconComponent = getModuleIcon(def.slug || def.name);
                const isEnabled = Boolean(permissionsMap[def.slug]);

                return (
                  <div
                    key={def.id || def.slug}
                    className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      isEnabled
                        ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                        : "bg-slate-50/20 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isEnabled
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {def.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {isEnabled ? "Full access granted" : "Access restricted"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Enabled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubAdminDetail;
