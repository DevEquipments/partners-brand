import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Calendar,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  MapPin,
  User,
  Hash,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions, PERMISSIONS } from "../hooks/usePermissions";
import { updateProfile } from "../services/profile";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Textarea from "../components/common/Textarea";
import Modal from "../components/common/Modal";
import Avatar from "../components/common/Avatar";
import LoadingState from "../components/common/LoadingState";
import { formatDate } from "../utils/formatters";
import toast from "react-hot-toast";

export const Profile = () => {
  const { user, fetchProfile, loading: authLoading, role, isDummySession } = useAuth();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.PROFILE_EDIT);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Populate edit form when user data loads or modal opens
  useEffect(() => {
    if (user) {
      reset({
        brand_name: user.brand_name || "",
        company_name: user.company_name || "",
        office_address: user.office_address || "",
        phone_no: user.phone_no || user.phone || "",
        gst: user.gst || "",
        email: user.email || "",
      });
    }
  }, [user, reset, isEditModalOpen]);

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
    toast.success("Copied to clipboard");
  };

  const onSaveProfile = async (formData) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit profile credentials.");
      return;
    }

    if (isDummySession) {
      toast.error("Profile updates are disabled in test Sub Admin session.");
      return;
    }

    setIsSaving(true);
    try {
      // Backend expects multipart/form-data via updateProfile service
      const response = await updateProfile(formData);

      if (response?.status) {
        toast.success(response?.message || "Brand profile updated successfully.");
        setIsEditModalOpen(false);
        await fetchProfile();
      } else {
        toast.error(response?.message || "Failed to update profile details.");
      }
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        "Error updating brand profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <LoadingState text="Loading partner credentials..." />
      </div>
    );
  }

  const displayName = user?.brand_name || user?.name || user?.username || "Brand Partner";
  const roleTitle = role === "ADMIN" ? "Primary Administrator" : "Sub Admin";

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Company Profile"
        subtitle="Manage brand credentials, verified GSTIN, and corporate contact records"
        breadcrumbs={[{ label: "Account" }, { label: "Profile" }]}
        actions={
          canEdit ? (
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Read-Only Account</span>
            </div>
          )
        }
      />

      {/* Brand Identity Hero Banner (Clean, Professional, Zero Fake Stats) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size="xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{roleTitle}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified OEM Partner</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                {user?.company_name || "Authorized Commercial Equipment Partner"}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                {user?.username && (
                  <span className="flex items-center gap-1 font-mono">
                    <User className="w-3.5 h-3.5" />
                    <span>@{user.username}</span>
                  </span>
                )}
                {user?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {formatDate(user.created_at)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => setIsEditModalOpen(true)}
            >
              Update Credentials
            </Button>
          )}
        </div>
      </div>

      {/* Structured Enterprise Profile Grid (4 Clean Sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Corporate Credentials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Corporate Credentials
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Company Metadata
            </span>
          </div>

          <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Brand Name
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block text-sm">
                  {user?.brand_name || "Not specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.brand_name, "brand")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy brand name"
              >
                {copiedField === "brand" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Legal Company Name
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {user?.company_name || "Not specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.company_name, "company")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy company name"
              >
                {copiedField === "company" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  GST Identification Number (GSTIN)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block tracking-wide">
                  {user?.gst || "Not specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.gst, "gst")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy GSTIN"
              >
                {copiedField === "gst" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Records */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Official Contact Directory
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Communication
            </span>
          </div>

          <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Official Email Address
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {user?.email || "Not specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.email, "email")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy email"
              >
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Primary Phone Number
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {user?.phone_no || user?.phone || "Not specified"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.phone_no || user?.phone, "phone")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy phone"
              >
                {copiedField === "phone" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-3">
              <span className="text-slate-400 dark:text-slate-500 font-medium block">
                Primary Operating Channel
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                Equipments Dekho Partner Operations Desk
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Office Address */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Registered Office Address
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </span>
          </div>

          <div className="p-5 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium block">
              Physical Operating Location
            </span>
            <p className="font-medium text-slate-800 dark:text-slate-200 mt-2 leading-relaxed bg-slate-50/70 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/70">
              {user?.office_address || "No office address specified."}
            </p>
          </div>
        </div>

        {/* Section 4: Account Security & Platform Governance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Platform Governance & Identity
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security
            </span>
          </div>

          <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Assigned Username
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {user?.username || "Not assigned"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(user?.username, "username")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy username"
              >
                {copiedField === "username" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Brand Resolution Code
                </span>
                <span className="font-mono font-bold uppercase text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {user?.brand_id || user?.brand_slug || "Active Partner Brand"}
                </span>
              </div>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium block">
                  Account Authority Level
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {role === "ADMIN" ? "Primary Administrator (Full Master Rights)" : "Subordinate Operational User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Using Shared Enterprise Inputs) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Profile Details"
        subtitle="Submit updated brand credentials to the API gateway (POST /update-profile)"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <Input
            label="Brand Name"
            icon={Building2}
            error={errors.brand_name?.message}
            {...register("brand_name", { required: "Brand name is required" })}
          />

          <Input
            label="Legal Company Name"
            icon={Building2}
            error={errors.company_name?.message}
            {...register("company_name", { required: "Company name is required" })}
          />

          <Input
            label="GST Identification Number"
            icon={FileText}
            placeholder="15-character GSTIN"
            error={errors.gst?.message}
            {...register("gst", {
              required: "GST is required",
              pattern: {
                value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                message: "Enter a valid GSTIN format",
              },
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Valid email required",
                },
              })}
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              icon={Phone}
              placeholder="10-digit mobile"
              error={errors.phone_no?.message}
              {...register("phone_no", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              })}
            />
          </div>

          <Textarea
            label="Office Address"
            rows={2}
            error={errors.office_address?.message}
            {...register("office_address", { required: "Office address is required" })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isSaving}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
