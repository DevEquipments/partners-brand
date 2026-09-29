import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const IconButton = forwardRef(
  (
    {
      icon: Icon,
      variant = "outline",
      size = "md",
      isLoading = false,
      disabled = false,
      title = "",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-lg shrink-0";

    const sizeStyles = {
      xs: "w-7 h-7 p-1",
      sm: "w-8 h-8 p-1.5",
      md: "w-9 h-9 p-2",
      lg: "w-10 h-10 p-2.5",
    };

    const iconSizes = {
      xs: "w-3.5 h-3.5",
      sm: "w-4 h-4",
      md: "w-4.5 h-4.5",
      lg: "w-5 h-5",
    };

    const variantStyles = {
      primary:
        "bg-orange-600 hover:bg-orange-700 text-white shadow-sm focus-visible:ring-orange-500 border border-orange-600",
      secondary:
        "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus-visible:ring-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
      outline:
        "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
      ghost:
        "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400",
      danger:
        "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/40",
    };

    return (
      <button
        ref={ref}
        type={type}
        title={title}
        aria-label={title}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          Icon && <Icon className={iconSizes[size]} />
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export default IconButton;
