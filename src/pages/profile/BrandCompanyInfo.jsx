import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit3,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

export const BrandCompanyInfo = ({
  companyInfo,
  onUpdateCompanyInfo,
  canEdit = true,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: "",
    company_name: "",
    brand_id: "",
    gst: "",
    email: "",
    phone: "",
    office_address: "",
    website: "",
    established_year: "",
    bio: "",
  });

  const handleOpenEdit = () => {
    setFormData({
      brand_name: companyInfo.brand_name || "",
      company_name: companyInfo.company_name || "",
      brand_id: companyInfo.brand_id || "",
      gst: companyInfo.gst || "",
      email: companyInfo.email || "",
      phone: companyInfo.phone || "",
      office_address: companyInfo.office_address || "",
      website: companyInfo.website || "",
      established_year: companyInfo.established_year || "",
      bio: companyInfo.bio || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
    toast.success("Copied to clipboard.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onUpdateCompanyInfo) {
        await onUpdateCompanyInfo(formData);
      }
      toast.success("Brand company profile updated successfully.");
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err?.message || "Failed to update company details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Profile Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-sm shrink-0 uppercase tracking-tight">
              {companyInfo.brand_name?.[0] || "J"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  {companyInfo.brand_name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Main Brand Admin</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified OEM Partner</span>
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                {companyInfo.company_name}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="font-mono">Brand ID: #{companyInfo.brand_id}</span>
                <span>•</span>
                <span>Est. {companyInfo.established_year}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={handleOpenEdit}
            >
              Edit Company Info
            </Button>
          )}
        </div>
      </div>

      {/* Corporate Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Corporate Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span>Corporate Information</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Legal Identity
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Brand Name</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-sm">
                  {companyInfo.brand_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(companyInfo.brand_name, "brand")}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {copiedField === "brand" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Legal Registered Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {companyInfo.company_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(companyInfo.company_name, "company")}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {copiedField === "company" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">GST Identification Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block uppercase">
                  {companyInfo.gst}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(companyInfo.gst, "gst")}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {copiedField === "gst" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Corporate Website</span>
                <a
                  href={companyInfo.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-orange-600 dark:text-orange-400 hover:underline mt-0.5 block"
                >
                  {companyInfo.website}
                </a>
              </div>
              <Globe className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Card 2: Contact & Official Address */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Contact & Headquarters</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Operations
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Official Partner Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {companyInfo.email}
                </span>
              </div>
              <Mail className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="py-2.5 flex items-start justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Support & Toll-Free Phone</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {companyInfo.phone}
                </span>
              </div>
              <Phone className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="py-2.5">
              <span className="text-slate-400 block font-medium">Headquarters Address</span>
              <span className="text-slate-800 dark:text-slate-200 mt-0.5 block leading-relaxed">
                {companyInfo.office_address}
              </span>
            </div>

            <div className="py-2.5">
              <span className="text-slate-400 block font-medium">About Brand / Specialization</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                {companyInfo.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Company Info Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Brand Company Information"
        subtitle="Update corporate details, verified GST, and headquarter contacts"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.brand_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand_name: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Legal Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company_name: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                GSTIN *
              </label>
              <input
                type="text"
                required
                value={formData.gst}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gst: e.target.value.toUpperCase() }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Corporate Headquarters Address
            </label>
            <textarea
              rows={2}
              value={formData.office_address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, office_address: e.target.value }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              About Brand & Machinery Specialization
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Save Company Info
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BrandCompanyInfo;
