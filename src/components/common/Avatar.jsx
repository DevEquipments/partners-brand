import { getInitials } from "../../utils/formatters";

export const Avatar = ({ name = "", size = "md", className = "" }) => {
  const sizeStyles = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
  };

  const initials = getInitials(name);

  return (
    <div
      className={`relative rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center select-none shrink-0 border border-slate-700/50 shadow-xs ${sizeStyles[size]} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
