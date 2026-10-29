import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import FormField from "./FormField";
import Button from "./Button";

export const Form = forwardRef(
  (
    {
      fields = [],
      values = {},
      onChange,
      errors = {},
      formError,
      isSubmitting = false,
      submitDisabled = false,
      submitText = "Submit",
      cancelText = "Cancel",
      onCancel,
      onSubmit,
      hideActions = false,
      actions,
      children,
      className = "space-y-4",
      gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-3",
      ...props
    },
    ref
  ) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        noValidate
        className={className}
        {...props}
      >
        {/* Form-Level Error Alert Banner */}
        {formError && (
          <div
            role="alert"
            className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div className="flex-1 font-medium">{formError}</div>
          </div>
        )}

        {/* Configuration-driven Fields */}
        {fields.length > 0 && (
          <div className={gridClassName}>
            {fields.map((field) => {
              const isFullWidth = field.colSpan === 2 || field.fullWidth;
              const containerClass = `${isFullWidth ? "sm:col-span-2" : ""} ${
                field.containerClassName || ""
              }`.trim();

              return (
                <FormField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type || "text"}
                  as={field.as}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={isSubmitting || field.disabled}
                  value={values[field.name] ?? ""}
                  onChange={(e) => {
                    if (field.onChange) {
                      field.onChange(e);
                    } else if (onChange) {
                      onChange(field.name, e.target ? e.target.value : e);
                    }
                  }}
                  error={errors[field.name]}
                  helperText={field.helperText}
                  icon={field.icon}
                  options={field.options}
                  rows={field.rows}
                  autoComplete={field.autoComplete}
                  containerClassName={containerClass}
                  className={field.className}
                />
              );
            })}
          </div>
        )}

        {/* Custom Form Content */}
        {children}

        {/* Form Action Controls */}
        {!hideActions && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {actions ? (
              actions
            ) : (
              <>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || submitDisabled}
                >
                  {submitText}
                </Button>
              </>
            )}
          </div>
        )}
      </form>
    );
  }
);

Form.displayName = "Form";

export default Form;
