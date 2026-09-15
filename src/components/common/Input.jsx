import { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      endIcon: EndIcon,
      onEndIconClick,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg transition-all duration-150 outline-none
              placeholder:text-slate-400 dark:placeholder:text-slate-400
              ${Icon ? "pl-10" : "pl-3"}
              ${EndIcon ? "pr-10" : "pr-3"}
              ${
                error
                  ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/50"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/25 shadow-xs"
              }
              disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-850
              ${className}`}
            {...props}
          />
          {EndIcon && (
            <button
              type="button"
              onClick={onEndIconClick}
              tabIndex={onEndIconClick ? 0 : -1}
              className={`absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${
                onEndIconClick ? "cursor-pointer" : "pointer-events-none"
              }`}
            >
              <EndIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-medium text-red-600 dark:text-red-400 animate-fade-in">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
