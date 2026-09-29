import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-lg";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-xs font-semibold gap-2",
      lg: "h-11 px-5 text-sm font-semibold gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-orange-600 hover:bg-orange-700 text-white shadow-sm focus-visible:ring-orange-500 border border-orange-600 dark:border-orange-500",
      secondary:
        "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus-visible:ring-slate-700 border border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700",
      outline:
        "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 focus-visible:ring-slate-400",
      ghost:
        "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500 border border-red-600",
      dangerOutline:
        "bg-transparent text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:ring-red-400",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />
        )}
        <span>{children}</span>
        {!isLoading && Icon && iconPosition === "right" && (
          <Icon className="w-4 h-4 shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
