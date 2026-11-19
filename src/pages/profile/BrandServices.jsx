import { useState } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Switch from "../../components/common/Switch";
import toast from "react-hot-toast";

export const BrandServices = ({
  services = [],
  onAddService,
  onToggleStatus,
  onDeleteService,
  canEdit = true,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Equipment Sales",
    description: "",
    turnaround: "Immediate Dispatch",
    warranty: "Comprehensive Warranty",
    featuresText: "",
    is_active: true,
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      category: "Equipment Sales",
      description: "",
      turnaround: "Immediate Dispatch",
      warranty: "Comprehensive Warranty",
      featuresText: "",
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Service title and description are required.");
      return;
    }

    const features = formData.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (onAddService) {
      onAddService({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        turnaround: formData.turnaround,
        warranty: formData.warranty,
        features,
        is_active: formData.is_active,
      });
    }
    toast.success("New commercial service published to brand profile.");
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (onDeleteService) {
      onDeleteService(deleteTarget.id);
    }
    toast.success(`Service "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Brand Equipment Services & Commercial Capabilities
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure enterprise machinery sales, rental terms, 24/7 on-site repair SLAs, and operator training programs.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Service
          </Button>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {srv.category}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                      {srv.title}
                    </h4>
                  </div>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(srv)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                    title="Delete service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {srv.description}
              </p>

              {/* SLA & Warranty Tags */}
              <div className="space-y-1.5 pt-1">
                {srv.turnaround && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="font-medium">SLA:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {srv.turnaround}
                    </span>
                  </div>
                )}
                {srv.warranty && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium">Warranty:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {srv.warranty}
                    </span>
                  </div>
                )}
              </div>

              {/* Included Features Bullet Points */}
              {srv.features && srv.features.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Included Capabilities
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    {srv.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {canEdit && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Boolean(srv.is_active)}
                    onChange={() => onToggleStatus && onToggleStatus(srv.id)}
                  />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {srv.is_active ? "Service Active" : "Service Inactive"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Brand Service"
        subtitle="Offer machinery maintenance, fleet leasing, or spare parts coverage"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Service Offering Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. 24/7 Mobile Breakdown & Field Maintenance"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Service Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="Equipment Sales">Equipment Sales</option>
                <option value="Fleet Leasing">Fleet Leasing</option>
                <option value="Field Maintenance">Field Maintenance</option>
                <option value="Spare Parts">Spare Parts</option>
                <option value="Digital Fleet">Digital Fleet</option>
                <option value="Training & Safety">Training & Safety</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Turnaround SLA
              </label>
              <input
                type="text"
                value={formData.turnaround}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, turnaround: e.target.value }))
                }
                placeholder="e.g. Under 4 Hours Response"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Warranty Terms / Guarantee
            </label>
            <input
              type="text"
              value={formData.warranty}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, warranty: e.target.value }))
              }
              placeholder="e.g. 1 Year Comprehensive OEM Coverage"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Service Scope & Overview *
            </label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed description of what this service delivers..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Key Features & Capabilities (One item per line)
            </label>
            <textarea
              rows={3}
              value={formData.featuresText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, featuresText: e.target.value }))
              }
              placeholder={"Factory-trained technicians\nToll-free breakdown hotline\nPre-delivery inspection"}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Service"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to remove the service{" "}
              <strong>"{deleteTarget.title}"</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BrandServices;
