import { forwardRef } from "react";

export const Switch = forwardRef(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      disabled = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex items-start justify-between gap-3 ${className}`}>
        {(label || description) && (
          <label
            htmlFor={switchId}
            className={`select-none cursor-pointer text-xs ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {label && (
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
                {description}
              </span>
            )}
          </label>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          id={switchId}
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            checked ? "bg-orange-600" : "bg-slate-200 dark:bg-slate-700"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...props}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
