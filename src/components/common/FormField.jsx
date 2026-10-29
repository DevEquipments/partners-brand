import { forwardRef } from "react";
import Input from "./Input";
import PasswordInput from "./PasswordInput";
import Textarea from "./Textarea";
import Select from "./Select";

export const FormField = forwardRef(
  (
    {
      as,
      type = "text",
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      children,
      containerClassName = "",
      className = "",
      ...props
    },
    ref
  ) => {
    // If custom children are provided, wrap them with standard label/error layout
    if (children) {
      const fieldId = props.id || props.name;
      const errorId = fieldId ? `${fieldId}-error` : undefined;
      const helperId = fieldId ? `${fieldId}-helper` : undefined;

      return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
          {label && (
            <label
              htmlFor={fieldId}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center gap-1"
            >
              <span>{label}</span>
              {required && !String(label).includes("*") && (
                <span className="text-red-500 font-bold" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {children}
          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-[11px] font-medium text-red-600 dark:text-red-400 animate-fade-in"
            >
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={helperId} className="text-[11px] text-slate-500 dark:text-slate-400">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Direct input rendering based on type / as
    const isTextarea = as === "textarea" || type === "textarea";
    const isSelect = as === "select" || type === "select";
    const isPassword = type === "password";

    if (isTextarea) {
      return (
        <Textarea
          ref={ref}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled}
          containerClassName={containerClassName}
          className={className}
          {...props}
        />
      );
    }

    if (isSelect) {
      return (
        <Select
          ref={ref}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled}
          containerClassName={containerClassName}
          className={className}
          {...props}
        />
      );
    }

    if (isPassword) {
      return (
        <PasswordInput
          ref={ref}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
          disabled={disabled}
          containerClassName={containerClassName}
          className={className}
          {...props}
        />
      );
    }

    return (
      <Input
        ref={ref}
        type={type}
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        containerClassName={containerClassName}
        className={className}
        {...props}
      />
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
