import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  Shield,
  CheckCircle,
  Copy,
  Star,
  TrendingUp,
  Zap,
  Sparkles,
  BadgeCheck,
  Clock,
  Edit3,
  X,
  AlertCircle,
  ChevronRight,
  Eye,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { updateProfile } from "../services/profile";

// ─── Copy hook ───────────────────────────────────────────────────────────────
const useCopy = () => {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  };
  return { copied, copy };
};

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-emerald-50" : "bg-red-50";
  const borderColor =
    type === "success" ? "border-emerald-200" : "border-red-200";
  const textColor = type === "success" ? "text-emerald-700" : "text-red-700";
  const iconColor = type === "success" ? "text-emerald-500" : "text-red-500";

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in backdrop-blur-sm`}
    >
      <AlertCircle className={`w-4 h-4 ${iconColor}`} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ─── Professional Stat Indicator ──────────────────────────────────────────────
const StatIndicator = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = "orange",
}) => {
  const colorClasses = {
    orange: "text-orange-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
  };

  const bgClasses = {
    orange: "bg-orange-50",
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
  };

  return (
    <div className="flex items-start gap-3 group">
      <div
        className={`${bgClasses[color]} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-zinc-900 mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-zinc-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

// ─── Field row (View Mode) ───────────────────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, copyKey, onCopy, isCopied }) => (
  <div className="flex items-start gap-3 py-3.5 px-1 group">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200/50 flex items-center justify-center shrink-0 group-hover:from-orange-200 transition-all">
      <Icon className="w-4 h-4 text-orange-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      {value ? (
        <p className="text-[13px] font-semibold text-zinc-800 break-words leading-snug">
          {value}
        </p>
      ) : (
        <p className="text-[12px] text-zinc-400 italic">Not provided</p>
      )}
    </div>
    {value && copyKey && (
      <button
        onClick={() => onCopy(value, copyKey)}
        title="Copy"
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-orange-50 text-zinc-400 hover:text-orange-500 transition-all cursor-pointer shrink-0"
      >
        {isCopied ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    )}
  </div>
);

// ─── Edit Field ──────────────────────────────────────────────────────────────
const EditField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
      <Icon className="w-4 h-4 text-orange-500" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white
        ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-transparent"
            : "border-zinc-200 focus:ring-orange-500 focus:border-transparent hover:border-zinc-300"
        }`}
    />
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// ─── Completeness Bar ────────────────────────────────────────────────────────
const CompletenessBar = ({ percent }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-0.5">
            Profile Strength
          </p>
          <p className="text-2xl font-bold text-zinc-900">{percent}%</p>
        </div>
        <div className="text-right">
          {percent === 100 && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Complete
            </span>
          )}
          {percent >= 75 && percent < 100 && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              Almost Done
            </span>
          )}
          {percent < 75 && (
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              In Progress
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, action, color = "orange" }) => {
  const colorMap = {
    orange:
      "border-orange-200 bg-gradient-to-br from-orange-50/30 to-transparent",
    emerald:
      "border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-transparent",
    blue: "border-blue-200 bg-gradient-to-br from-blue-50/30 to-transparent",
  };

  const iconColor = {
    orange: "text-orange-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl border ${colorMap[color]} shadow-sm overflow-hidden hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${color}-100`}>
            <Icon className={`w-5 h-5 ${iconColor[color]}`} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="px-5 divide-y divide-zinc-100">{children}</div>
    </div>
  );
};

// ─── Enhanced Edit Modal ──────────────────────────────────────────────────────
const EditModal = ({ isOpen, user, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    brand_name: user?.brand_name || "",
    company_name: user?.company_name || "",
    office_address: user?.office_address || "",
    phone_no: user?.phone_no || user?.phone || "",
    gst: user?.gst || "",
    email: user?.email || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({
      brand_name: user?.brand_name || "",
      company_name: user?.company_name || "",
      office_address: user?.office_address || "",
      phone_no: user?.phone_no || user?.phone || "",
      gst: user?.gst || "",
      email: user?.email || "",
    });
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (
      formData.phone_no &&
      !/^\d{10}$/.test(formData.phone_no.replace(/\D/g, ""))
    ) {
      newErrors.phone_no = "Phone must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 sticky top-0 bg-gradient-to-r from-orange-50/80 to-transparent backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Edit Profile</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Update your business information
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Business Info Group */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-1">
              Business Information
            </h3>
            <div className="space-y-4 pl-1">
              <EditField
                icon={Building2}
                label="Brand Name"
                name="brand_name"
                value={formData.brand_name}
                onChange={handleChange}
                placeholder="e.g., JCB"
              />
              <EditField
                icon={Building2}
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g., JCB Company"
              />
            </div>
          </div>

          {/* Location & Contact Group */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-1">
              Location & Contact
            </h3>
            <div className="space-y-4 pl-1">
              <EditField
                icon={MapPin}
                label="Office Address"
                name="office_address"
                value={formData.office_address}
                onChange={handleChange}
                placeholder="e.g., Nashik, India"
              />
              <EditField
                icon={Phone}
                label="Phone Number"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleChange}
                placeholder="e.g., 1234567890"
                type="tel"
                error={errors.phone_no}
              />
            </div>
          </div>

          {/* Tax & Email Group */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-1">
              Tax & Email
            </h3>
            <div className="space-y-4 pl-1">
              <EditField
                icon={FileText}
                label="GST Number"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                placeholder="e.g., ABC123XYZ"
              />
              <EditField
                icon={Mail}
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., email@example.com"
                type="email"
                error={errors.email}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-5 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-3 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── HERO SECTION ─────────────────────────────────────
const HeroSection = ({
  user,
  initials,
  displayName,
  memberSinceFull,
  completion,
  onEditOpen,
}) => {
  const stats = [
    {
      icon: TrendingUp,
      label: "Leads",
      value: "1,284",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: Star,
      label: "Rating",
      value: "4.8",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: Zap,
      label: "Plan",
      value: "Premium",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Sparkles,
      label: "Profile",
      value: `${completion}%`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
      {/* Background */}
      <div className="absolute -top-20 right-0 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Left */}
          <div className="flex flex-1 items-start gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-md" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-lg font-bold text-white ring-4 ring-orange-100 shadow-lg">
                {initials}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-zinc-900 capitalize">
                  {displayName}
                </h2>

                <BadgeCheck className="h-5 w-5 text-emerald-500" />
              </div>

              <p className="mt-0.5 text-sm text-zinc-500">
                {user?.company_name || "Brand Partner"} • @{user?.username}
              </p>

              {/* Chips */}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-600">
                  <Clock className="h-3 w-3 text-orange-500" />
                  {memberSinceFull}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
                  <Shield className="h-3 w-3" />
                  Active
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] text-orange-700">
                  <Zap className="h-3 w-3" />
                  Premium
                </span>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Profile Completion</span>

                  <span className="font-semibold text-orange-600">
                    {completion}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onEditOpen}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 transition hover:bg-orange-500 hover:text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>

            {/* Slim Stats */}
            <div className="flex flex-wrap justify-end gap-2">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 transition-all hover:border-orange-200 hover:shadow-sm"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}
                    >
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>

                    <div>
                      <div className="text-sm font-bold leading-none text-zinc-900">
                        {item.value}
                      </div>

                      <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const { user, fetchProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const { copied, copy } = useCopy();

  useEffect(() => {
    if (!user) fetchProfile().finally(() => setIsLoading(false));
  }, [user, fetchProfile]);

  const handleEditOpen = () => setIsEditOpen(true);
  const handleEditClose = () => setIsEditOpen(false);

  const handleSaveProfile = async (formData) => {
    setIsSaving(true);
    try {
      const response = await updateProfile(formData);

      if (response?.status) {
        setToast({
          type: "success",
          message: "Profile updated successfully!",
        });
        setIsEditOpen(false);
        await fetchProfile();
      } else {
        setToast({
          type: "error",
          message: response?.message || "Failed to update profile",
        });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Error updating profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || loading)
    return <Loader fullScreen={false} text="Loading profile…" />;

  const displayName =
    user?.brand_name || user?.name || user?.username || "Partner";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSinceFull = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const fields = [
    user?.brand_name,
    user?.company_name,
    user?.gst,
    user?.office_address,
    user?.email,
    user?.phone_no || user?.phone,
  ];
  const completion = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* NEW HERO SECTION */}
      <HeroSection
        user={user}
        initials={initials}
        displayName={displayName}
        memberSinceFull={memberSinceFull}
        completion={completion}
        onEditOpen={handleEditOpen}
      />

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <Section
            title="Business Details"
            icon={Building2}
            color="orange"
            action={
              <button
                onClick={handleEditOpen}
                className="p-2.5 hover:bg-orange-100 rounded-lg text-orange-500 hover:text-orange-600 transition-all group"
                title="Edit profile"
              >
                <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            }
          >
            <FieldRow
              icon={Building2}
              label="Brand Name"
              value={user?.brand_name}
              copyKey="brand"
              onCopy={copy}
              isCopied={copied === "brand"}
            />
            <FieldRow
              icon={Building2}
              label="Company Name"
              value={user?.company_name}
              copyKey="company"
              onCopy={copy}
              isCopied={copied === "company"}
            />
            <FieldRow
              icon={FileText}
              label="GST Number"
              value={user?.gst}
              copyKey="gst"
              onCopy={copy}
              isCopied={copied === "gst"}
            />
            <FieldRow
              icon={MapPin}
              label="Office Address"
              value={user?.office_address}
            />
          </Section>

          {/* Contact Details */}
          <Section
            title="Contact Information"
            icon={Mail}
            color="blue"
            action={
              <button
                onClick={handleEditOpen}
                className="p-2.5 hover:bg-blue-100 rounded-lg text-blue-500 hover:text-blue-600 transition-all group"
                title="Edit profile"
              >
                <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            }
          >
            <FieldRow
              icon={User}
              label="Username"
              value={user?.username}
              copyKey="uname"
              onCopy={copy}
              isCopied={copied === "uname"}
            />
            <FieldRow
              icon={Mail}
              label="Email Address"
              value={user?.email}
              copyKey="email"
              onCopy={copy}
              isCopied={copied === "email"}
            />
            <FieldRow
              icon={Phone}
              label="Phone Number"
              value={user?.phone_no || user?.phone}
              copyKey="phone"
              onCopy={copy}
              isCopied={copied === "phone"}
            />
          </Section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Profile Strength Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 hover:shadow-lg transition-all">
            <CompletenessBar percent={completion} />
            <div className="mt-6 pt-6 border-t border-zinc-200 space-y-3">
              <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Missing Information
              </p>
              <div className="space-y-2">
                {!user?.brand_name && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                    Add brand name
                  </div>
                )}
                {!user?.company_name && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                    Add company name
                  </div>
                )}
                {!user?.office_address && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                    Add office address
                  </div>
                )}
                {!user?.gst && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                    Add GST number
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Account Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-zinc-600">
                    Type
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-700">
                  Premium
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200/50">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-zinc-600">
                    Access
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-zinc-600">
                    Verify
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={handleEditOpen}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-5 h-5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditOpen}
        user={user}
        onClose={handleEditClose}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Profile;
