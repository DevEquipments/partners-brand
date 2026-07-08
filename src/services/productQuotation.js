import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

export const getProductQuotations = (payload) =>
  apiRequest({
    ...API_ENDPOINTS.getFeatureEquipmentQuotes,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
