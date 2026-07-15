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

    // Network Error
    if (!error.response) {
      toast.error("Network error. Please check your internet connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    const message =
      data?.message ||
      data?.error ||
      "Something went wrong.";

    console.error("API Error:", status, message, data);

    switch (status) {
      case 400:
        toast.error(message);
        break;

      case 401:
        toast.error("Session expired. Please login again.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        break;

      case 403:
        toast.error("You are not authorized.");
        break;

      case 404:
        toast.error(message || "Resource not found.");
        break;
      // toast.error("Something Went Wrong");

      case 422:
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(
            Array.isArray(firstError) ? firstError[0] : firstError
          );
        } else {
          toast.error(message);
        }
        break;

      case 429:
        toast.error("Too many requests. Please try again later.");
        break;

      default:
        if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default API;