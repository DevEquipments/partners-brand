import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const SubAdminDeleteModal = ({
  isOpen,
  onClose,
  subAdmin,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!subAdmin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onConfirmDelete) {
        await onConfirmDelete(subAdmin);
      }
      toast.success(`Sub-Admin @${subAdmin.username} was permanently removed.`);
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to delete Sub-Admin account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Sub Admin Account"
      subtitle="Permanent account revocation"
      size="sm"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
              Are you sure you want to delete @{subAdmin.username}?
            </h4>
            <p className="text-[11px] text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              This action will revoke the operator's CRM credentials, terminate all active login sessions, and free up 1 slot in your brand's account quota.
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Operator ID:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              #{subAdmin.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Login Username:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              @{subAdmin.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Official Email:</span>
            <span className="text-slate-700 dark:text-slate-300">
              {subAdmin.email || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-sans">Branch / Company:</span>
            <span className="text-slate-700 dark:text-slate-300 font-sans">
              {subAdmin.company_name || "Regional Office"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={Trash2}
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SubAdminDeleteModal;
