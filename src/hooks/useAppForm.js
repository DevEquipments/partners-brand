import { useState, useCallback, useRef } from "react";
import { getApiErrorMessage, getValidationErrors } from "../utils/errorHandler";

/**
 * Equipments Dekho Partner Admin — Production-Ready Form Management Hook
 *
 * Provides:
 * - Controlled form values & dynamic field updates
 * - Client-side validation (required, email, phone, minLength, custom rules)
 * - Automatic mapping of backend validation errors to field-level errors
 * - Top-level form error banner handling
 * - Auto-focus on the first invalid field
 * - Duplicate submission prevention
 * - State preservation upon failure and clean reset on success
 */
export const useAppForm = ({
  initialValues = {},
  validationRules = {},
  validate,
  onSubmit,
  onSuccess,
  onError,
} = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep a stable ref to initial values
  const initialValuesRef = useRef(initialValues);

  // Update a single field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on edit
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError("");
  }, []);

  // Standard input change handler supporting both event objects and direct values
  const handleChange = useCallback(
    (eOrName, maybeValue) => {
      if (typeof eOrName === "string") {
        setFieldValue(eOrName, maybeValue);
      } else if (eOrName && eOrName.target) {
        const { name, value, type, checked } = eOrName.target;
        setFieldValue(name, type === "checkbox" ? checked : value);
      }
    },
    [setFieldValue]
  );

  // Manually set an error for a field
  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  // Clear an error for a field
  const clearFieldError = useCallback((name) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // Validate form values against rules and optional custom validator
  const runValidation = useCallback(
    (formValues) => {
      const nextErrors = {};

      // 1. Process rules definition
      Object.entries(validationRules).forEach(([field, rules]) => {
        if (!rules) return;

        const val = formValues[field];
        const strVal = val != null ? String(val).trim() : "";
        const fieldLabel = rules.label || field;

        // Required rule
        if (rules.required && !strVal) {
          nextErrors[field] =
            typeof rules.required === "string"
              ? rules.required
              : rules.requiredMessage || `${fieldLabel} is required.`;
          return;
        }

        // Only validate format if value is non-empty
        if (strVal) {
          // Email rule
          if (rules.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(strVal)) {
              nextErrors[field] =
                rules.emailMessage || "Please enter a valid official email address.";
              return;
            }
          }

          // Phone rule
          if (rules.phone) {
            const phoneClean = strVal.replace(/[\s-]/g, "");
            const phoneRegex = /^\+?[0-9]{7,15}$/;
            if (!phoneRegex.test(phoneClean)) {
              nextErrors[field] =
                rules.phoneMessage || "Please enter a valid contact phone number.";
              return;
            }
          }

          // Minimum length rule
          const minLen =
            typeof rules.minLength === "number"
              ? rules.minLength
              : rules.minLength?.value;
          if (minLen && strVal.length < minLen) {
            nextErrors[field] =
              rules.minLength?.message ||
              rules.minLengthMessage ||
              `${fieldLabel} must be at least ${minLen} characters long.`;
            return;
          }

          // Custom field-level validator
          if (typeof rules.validate === "function") {
            const customError = rules.validate(val, formValues);
            if (customError) {
              nextErrors[field] = customError;
              return;
            }
          }
        }
      });

      // 2. Custom form-level validator
      if (typeof validate === "function") {
        const customErrors = validate(formValues);
        if (customErrors && typeof customErrors === "object") {
          Object.assign(nextErrors, customErrors);
        }
      }

      return nextErrors;
    },
    [validationRules, validate]
  );

  // Focus the first invalid field in DOM
  const focusFirstInvalidField = useCallback((errorKeys) => {
    if (!errorKeys || errorKeys.length === 0) return;
    const firstKey = errorKeys[0];

    // Try finding by id or name
    const el =
      document.getElementById(firstKey) ||
      document.getElementById(firstKey.toLowerCase().replace(/[^a-z0-9]+/g, "-")) ||
      document.querySelector(`[name="${firstKey}"]`);

    if (el && typeof el.focus === "function") {
      el.focus();
    }
  }, []);

  // Form submit coordinator
  const handleSubmit = useCallback(
    async (e) => {
      if (e && typeof e.preventDefault === "function") {
        e.preventDefault();
      }

      // Prevent duplicate submissions while in-flight
      if (isSubmitting) return;

      setFormError("");

      // 1. Run client-side validation
      const validationErrors = runValidation(values);
      const errorKeys = Object.keys(validationErrors);

      if (errorKeys.length > 0) {
        setErrors(validationErrors);
        focusFirstInvalidField(errorKeys);
        return;
      }

      setErrors({});
      setIsSubmitting(true);

      try {
        const result = await onSubmit?.(values);
        onSuccess?.(result);
        return result;
      } catch (err) {
        // 2. Map backend validation errors (e.g. 422 Unprocessable Entity)
        const backendErrors = getValidationErrors(err);
        if (backendErrors && typeof backendErrors === "object" && Object.keys(backendErrors).length > 0) {
          const mappedErrors = {};
          Object.entries(backendErrors).forEach(([key, msg]) => {
            mappedErrors[key] = Array.isArray(msg) ? msg[0] : String(msg);
          });
          setErrors(mappedErrors);
          focusFirstInvalidField(Object.keys(mappedErrors));
        }

        const generalMsg = getApiErrorMessage(err, "Failed to submit form.");
        setFormError(generalMsg);
        onError?.(err, generalMsg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      runValidation,
      values,
      focusFirstInvalidField,
      onSubmit,
      onSuccess,
      onError,
    ]
  );

  // Reset form to initial or provided values
  const reset = useCallback((newValues) => {
    setValues(newValues || initialValuesRef.current);
    setErrors({});
    setFormError("");
    setIsSubmitting(false);
  }, []);

  return {
    values,
    setValues,
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    formError,
    setFormError,
    isSubmitting,
    handleChange,
    setFieldValue,
    handleSubmit,
    reset,
  };
};

export default useAppForm;
