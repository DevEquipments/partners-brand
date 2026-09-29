export const TableSkeleton = ({ rows = 5, cols = 6, className = "" }) => {
  return (
    <div className={`divide-y divide-slate-100 dark:divide-slate-800 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-3.5 bg-slate-200 dark:bg-slate-800 rounded ${
                cIdx === 0 ? "w-28" : cIdx === 1 ? "w-44 flex-1" : "w-20"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-28" />
        </div>
      ))}
    </div>
  );
};

export const DrawerSkeleton = ({ className = "" }) => {
  return (
    <div className={`p-6 space-y-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-28" />
        <div className="h-20 bg-slate-100 dark:bg-slate-850 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 bg-slate-100 dark:bg-slate-850 rounded-xl" />
          <div className="h-14 bg-slate-100 dark:bg-slate-850 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const FormSkeleton = ({ fields = 4, className = "" }) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
