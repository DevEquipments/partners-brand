import axios from "axios";
import toast from "react-hot-toast";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Request cancelled
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const config = error.config || {};

    // Network Error
    if (!error.response) {
      if (!config.skipGlobalToast && !config.silent) {
        toast.error("Network error. Please check your internet connection.", {
          id: "network-error",
        });
        error.toastShown = true;
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    const message =
      data?.message ||
      data?.error ||
      "Something went wrong.";

    console.error("API Error:", status, message, data);

    // If caller explicitly requested to skip global toasts, do not toast here
    if (config.skipGlobalToast || config.silent) {
      error.toastShown = false;
      return Promise.reject(error);
    }

    // Dedup ID to prevent duplicate stacked toasts
    const toastId = `api-error-${status}-${String(message).slice(0, 30)}`;

    switch (status) {
      case 400:
        toast.error(message, { id: toastId });
        error.toastShown = true;
        break;

      case 401:
        toast.error("Session expired. Please login again.", { id: "session-expired" });
        error.toastShown = true;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        break;

      case 403:
        toast.error("You are not authorized.", { id: "forbidden" });
        error.toastShown = true;
        break;

      case 404:
        toast.error(message || "Resource not found.", { id: toastId });
        error.toastShown = true;
        break;

      case 422:
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          const errorText = Array.isArray(firstError) ? firstError[0] : firstError;
          toast.error(errorText, { id: toastId });
        } else {
          toast.error(message, { id: toastId });
        }
        error.toastShown = true;
        break;

      case 429:
        toast.error("Too many requests. Please try again later.", { id: "rate-limit" });
        error.toastShown = true;
        break;

      default:
        if (status >= 500) {
          toast.error("Server error. Please try again later.", { id: "server-error" });
        } else {
          toast.error(message, { id: toastId });
        }
        error.toastShown = true;
    }

    return Promise.reject(error);
  }
);

export default API;