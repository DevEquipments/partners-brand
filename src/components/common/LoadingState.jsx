import { Loader2 } from "lucide-react";

export const LoadingState = ({ text = "Loading data...", rows = 5, skeleton = false, className = "" }) => {
  if (skeleton) {
    return (
      <div className={`divide-y divide-slate-100 dark:divide-slate-800 animate-pulse ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-2 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
            </div>
            <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[220px] ${className}`}>
      <Loader2 className="w-7 h-7 animate-spin text-orange-600 mb-3" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
};

export default LoadingState;
