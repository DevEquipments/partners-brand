import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

export const getPremiumBrandsList = (brand) =>
    apiRequest({
        ...API_ENDPOINTS.endPointPremiumBrandsList,
        data: brand,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

