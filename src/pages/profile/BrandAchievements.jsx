import { useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Building,
} from "lucide-react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

const BADGE_COLORS = {
  emerald: {
    badge:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    badge:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  orange: {
    badge:
      "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  purple: {
    badge:
      "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
};

export const BrandAchievements = ({
  achievements = [],
  onAddAchievement,
  onDeleteAchievement,
  canEdit = true,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    issuing_body: "",
    year: String(new Date().getFullYear()),
    category: "Industry Excellence",
    description: "",
    badge_color: "emerald",
  });

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      issuing_body: "",
      year: String(new Date().getFullYear()),
      category: "Industry Excellence",
      description: "",
      badge_color: "emerald",
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuing_body.trim()) {
      toast.error("Title and issuing body are required.");
      return;
    }

    if (onAddAchievement) {
      onAddAchievement(formData);
    }
    toast.success("New achievement award added to brand profile.");
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (onDeleteAchievement) {
      onDeleteAchievement(deleteTarget.id);
    }
    toast.success(`Achievement "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Brand Achievements & Industry Certifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Document verified manufacturer awards, ISO certifications, and enterprise production milestones.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Achievement
          </Button>
        )}
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          const style = BADGE_COLORS[ach.badge_color] || BADGE_COLORS.emerald;

          return (
            <div
              key={ach.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current/20 ${style.iconBg}`}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${style.badge}`}
                      >
                        {ach.category}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1 leading-snug">
                        {ach.title}
                      </h4>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ach)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
                      title="Delete achievement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ach.issuing_body}</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year {ach.year}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Achievement Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Brand Achievement / Award"
        subtitle="Record a certified industry milestone or quality accolade"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Achievement / Award Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Best Heavy Machinery OEM 2025"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Issuing Organization / Authority *
              </label>
              <input
                type="text"
                required
                value={formData.issuing_body}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    issuing_body: e.target.value,
                  }))
                }
                placeholder="e.g. Confederation of Indian Industry (CII)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Award Year *
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, year: e.target.value }))
                }
                placeholder="2025"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="Industry Excellence">Industry Excellence</option>
                <option value="Quality & Safety">Quality & Safety</option>
                <option value="Production Milestone">Production Milestone</option>
                <option value="Service Network">Service Network</option>
                <option value="Sustainability">Sustainability</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Badge Theme Color
              </label>
              <select
                value={formData.badge_color}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    badge_color: e.target.value,
                  }))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="emerald">Emerald Green (Recognition)</option>
                <option value="blue">Blue (Quality/Tech)</option>
                <option value="orange">Orange (Milestone)</option>
                <option value="purple">Purple (Network)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Achievement Summary / Citation
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Detailed description of what this recognition signifies..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 resize-none"
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
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Achievement"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to remove the achievement{" "}
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

export default BrandAchievements;
