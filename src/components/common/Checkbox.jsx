import { forwardRef } from "react";
import { Check } from "lucide-react";

export const Checkbox = forwardRef(
  ({ checked = false, onChange, label, className = "", id, disabled = false, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-2 select-none cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked, e)}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
              ${
                checked
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 peer-hover:border-slate-400"
              }`}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
