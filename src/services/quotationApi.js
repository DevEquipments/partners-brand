import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

export const getPremiumBrandQuotes = (payload) =>
    apiRequest({
        ...API_ENDPOINTS.getPremiumBrandQuotes,
        data: payload,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

