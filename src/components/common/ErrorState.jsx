import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

export const ErrorState = ({
  title = "Failed to load data",
  message = "An error occurred while fetching data from the server.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center min-h-[240px] select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center mb-3.5 text-red-600 dark:text-red-400 shadow-2xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
