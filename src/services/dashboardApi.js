import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";


export const getDashboardData = (payload) =>
    apiRequest({
        ...API_ENDPOINTS.getDashboardData,
        data: payload,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
