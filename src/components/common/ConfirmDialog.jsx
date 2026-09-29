import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning", // 'warning' | 'danger' | 'info'
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    danger: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
  };

  const bgMap = {
    warning: "bg-amber-500/10 border-amber-200 dark:border-amber-900/50",
    danger: "bg-red-500/10 border-red-200 dark:border-red-900/50",
    info: "bg-blue-500/10 border-blue-200 dark:border-blue-900/50",
  };

  const btnVariantMap = {
    warning: "primary",
    danger: "danger",
    info: "secondary",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!isLoading}>
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${bgMap[variant]}`}>
            {iconMap[variant]}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={btnVariantMap[variant]}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
