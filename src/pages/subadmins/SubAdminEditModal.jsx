import { useState } from "react";
import {
  Building,
  Mail,
  Phone,
  FileText,
  MapPin,
} from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const SubAdminEditModal = ({
  isOpen,
  onClose,
  subAdmin,
  onSave,
}) => {
  const [formData, setFormData] = useState(() => ({
    username: subAdmin?.username || "",
    company_name: subAdmin?.company_name || "",
    email: subAdmin?.email || "",
    phone_no: subAdmin?.phone_no || subAdmin?.phone || "",
    gst: subAdmin?.gst || "",
    office_address: subAdmin?.office_address || "",
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email?.trim()) {
      errs.email = "Official email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Valid email is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave({
          ...subAdmin,
          ...formData,
        });
      }
      toast.success(`Sub-Admin @${subAdmin?.username} updated successfully.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to update Sub-Admin details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!subAdmin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Sub Admin Operator"
      subtitle={`Update company, branch address, and official contact credentials for @${subAdmin.username}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Monospace ID & Role Header */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-500/20">
              {subAdmin.username?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                @{subAdmin.username}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Brand: {subAdmin.brand_name || "Partner"}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            Sub Admin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Company / Branch Name</span>
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company_name: e.target.value }))
              }
              placeholder="e.g. Delhi Regional Office"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Email *</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="operator@demo.com"
              className={`w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-slate-900 dark:text-white focus:outline-hidden ${
                errors.email
                  ? "border-red-500"
                  : "border-slate-200 dark:border-slate-700 focus:border-orange-500"
              }`}
            />
            {errors.email && (
              <p className="text-[10px] text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Phone</span>
            </label>
            <input
              type="tel"
              value={formData.phone_no}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone_no: e.target.value }))
              }
              placeholder="9721400226"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
            />
          </div>

          {/* GST */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>GST Registration</span>
            </label>
            <input
              type="text"
              value={formData.gst}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gst: e.target.value.toUpperCase() }))
              }
              placeholder="e.g. 07AAAAA0000A1Z5"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono uppercase"
            />
          </div>
        </div>

        {/* Office Address */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Physical Branch / Office Address</span>
          </label>
          <textarea
            rows={2}
            value={formData.office_address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, office_address: e.target.value }))
            }
            placeholder="Complete physical office address..."
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubAdminEditModal;
