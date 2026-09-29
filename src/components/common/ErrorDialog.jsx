import Modal from "./Modal";
import Button from "./Button";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorDialog = ({
  isOpen,
  onClose,
  title = "Action Failed",
  message = "An unexpected error occurred while performing this action.",
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-900/50 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">
              {typeof message === "string" ? message : message?.message || "Please check your network and try again."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                onClose();
                onRetry();
              }}
            >
              Try Again
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorDialog;
