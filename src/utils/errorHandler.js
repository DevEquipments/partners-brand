/**
 * Equipments Dekho Premium Brand CRM — API Error Normalizer
 *
 * Provides standardized, human-readable error messages for:
 * - 401 Unauthorized
 * - 403 Forbidden
 * - 404 Not Found
 * - 422 Validation Errors
 * - 429 Rate Limiting
 * - 500+ Server Errors
 * - Network failures & timeouts
 */

export const getApiErrorMessage = (error, fallback = "An unexpected error occurred. Please try again.") => {
  if (!error) return fallback;

  // String passed directly
  if (typeof error === "string") return error;

  // Network / Offline errors
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Request timed out. Please verify your connection and try again.";
  }
  if (!error.response && error.request) {
    return "Network connection issue. Please check your internet and try again.";
  }

  // Response status handling
  const status = error.response?.status || error.status;
  const data = error.response?.data || error.data;
  const errors = error.errors || data?.errors;

  // Extract nested server messages
  const serverMsg = data?.message || data?.error || (error.name === "ApiError" ? error.message : null);

  switch (status) {
    case 400:
      return serverMsg || "Invalid request. Please check the provided information.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "Access denied. You do not have permission to perform this action.";
    case 404:
      return serverMsg || "The requested CRM record or resource was not found.";
    case 422: {
      if (errors && typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        const val = errors[firstKey];
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === "string") return val;
      }
      return serverMsg || "Validation failed. Please review your input fields.";
    }
    case 429:
      return "Too many requests. Please wait a few moments before trying again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "The operations server is temporarily unavailable. Please try again shortly.";
    default:
      return serverMsg || error.message || fallback;
  }
};

export const getValidationErrors = (error) => {
  if (error?.errors && typeof error.errors === "object" && Object.keys(error.errors).length > 0) {
    return error.errors;
  }
  if (error?.response?.status === 422 && error?.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
};

export default getApiErrorMessage;
