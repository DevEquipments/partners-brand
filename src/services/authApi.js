import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

/**
 * Login User
 */
export const loginUser = (payload) =>
  apiRequest({
    ...API_ENDPOINTS.login,
    data: payload,
  });

/**
 * Register User
 */
export const registerUser = (data) => {
  const formData = new FormData();

  formData.append("brand_name", data.brand_name);
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("company_name", data.company_name);
  formData.append("office_address", data.office_address);
  formData.append("phone_no", data.phone_no);
  formData.append("gst", data.gst);
  formData.append("email", data.email);

  return apiRequest({
    ...API_ENDPOINTS.register,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Get Logged In User Profile
 */
export const getProfile = () =>
  apiRequest({
    ...API_ENDPOINTS.profile,
  });

/**
 * Logout User
 */
export const logoutUser = () =>
  apiRequest({
    ...API_ENDPOINTS.logout,
  });