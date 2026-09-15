export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  change,
  changeType = "neutral", // positive, negative, neutral
  badge,
  color = "orange",
  onClick,
  className = "",
}) => {
  const iconColorMap = {
    orange:
      "bg-orange-50 text-orange-600 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50",
    blue:
      "bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50",
    slate:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`relative p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between transition-all text-left ${
        onClick
          ? "cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconColorMap[color]}`}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider truncate">
            {title}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shrink-0">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </div>
        {(subtitle || change) && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {change && (
              <span
                className={`font-semibold ${
                  changeType === "positive"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : changeType === "negative"
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-500"
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </Component>
  );
};

export default StatCard;
