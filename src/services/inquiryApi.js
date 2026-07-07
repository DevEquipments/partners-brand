import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

export const getPremiumBrandInquiries = (payload) =>
  apiRequest({
    ...API_ENDPOINTS.getPremiumBrandInquiries,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
