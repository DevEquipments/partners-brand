import { getPriorityConfig } from "../../utils/statusConfig";

export const PriorityBadge = ({ priority, size = "sm", className = "" }) => {
  const cfg = getPriorityConfig(priority);

  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[9px]",
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold select-none shadow-2xs ${sizeStyles[size]} ${cfg.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      <span>{cfg.label}</span>
    </span>
  );
};

export default PriorityBadge;
