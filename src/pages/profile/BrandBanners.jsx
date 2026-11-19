import { useState } from "react";
import {
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Switch from "../../components/common/Switch";
import toast from "react-hot-toast";

const SAMPLE_IMAGES = [
  {
    label: "Earthmoving Machinery",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Construction Site & Crane",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Industrial Workshop",
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
  },
];

export const BrandBanners = ({
  banners = [],
  onAddBanner,
  onToggleStatus,
  onDeleteBanner,
  canEdit = true,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    placement: "Hero Banner (Top)",
    badge: "Featured",
    link_url: "/crm/quotes",
    image_url: SAMPLE_IMAGES[0].url,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      subtitle: "",
      placement: "Hero Banner (Top)",
      badge: "Featured",
      link_url: "/crm/quotes",
      image_url: SAMPLE_IMAGES[0].url,
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Banner title is required.");
      return;
    }

    if (onAddBanner) {
      onAddBanner(formData);
    }
    toast.success("New brand banner published successfully.");
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (onDeleteBanner) {
      onDeleteBanner(deleteTarget.id);
    }
    toast.success(`Banner "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Brand Marketing & Promotional Banners
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure showcase banners displayed on your public partner portal and promotional campaigns.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Banner
          </Button>
        )}
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col"
          >
            {/* Banner Image Preview */}
            <div className="relative aspect-16/8 w-full bg-slate-950 overflow-hidden">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                onError={(e) => {
                  e.target.src = SAMPLE_IMAGES[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Badges on image */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs border border-white/10 uppercase tracking-wider">
                  {banner.placement}
                </span>
                {banner.badge && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-600 text-white shadow-xs">
                    {banner.badge}
                  </span>
                )}
              </div>

              {/* Status on image */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-xs ${
                    banner.is_active
                      ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-900/70 text-slate-300 border border-slate-700/50"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      banner.is_active ? "bg-emerald-400" : "bg-slate-400"
                    }`}
                  />
                  <span>{banner.is_active ? "Active" : "Inactive"}</span>
                </span>
              </div>
            </div>

            {/* Banner Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-1">
                  {banner.title}
                </h4>
                {banner.subtitle && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link_url && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-orange-600 dark:text-orange-400">
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{banner.link_url}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              {canEdit && (
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={Boolean(banner.is_active)}
                      onChange={() => onToggleStatus && onToggleStatus(banner.id)}
                    />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {banner.is_active ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(banner)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Delete banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Brand Banner"
        subtitle="Create and display a hero or promotional campaign banner"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Banner Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Next-Gen 3DX Plus Excavator Launch"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Sub-heading / Offer Description
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              placeholder="Brief campaign pitch or technical capability highlight..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Display Placement
              </label>
              <select
                value={formData.placement}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, placement: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="Hero Banner (Top)">Hero Banner (Top)</option>
                <option value="Promotional Banner">Promotional Banner</option>
                <option value="Seasonal Offer">Seasonal Offer</option>
                <option value="Product Highlight">Product Highlight</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Offer Tag / Badge
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, badge: e.target.value }))
                }
                placeholder="e.g. New Release, 0% EMI"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Redirect Target Link
            </label>
            <input
              type="text"
              value={formData.link_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, link_url: e.target.value }))
              }
              placeholder="/crm/quotes or external URL"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
            />
          </div>

          {/* Image Selection / URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Banner Image
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image_url: img.url }))
                  }
                  className={`p-1 rounded-lg border text-left overflow-hidden cursor-pointer transition-all ${
                    formData.image_url === img.url
                      ? "border-orange-600 ring-2 ring-orange-500/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-12 object-cover rounded-sm mb-1"
                  />
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                    {img.label}
                  </p>
                </button>
              ))}
            </div>
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
              Publish Banner
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Banner"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to remove the banner{" "}
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
                Delete Banner
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BrandBanners;
