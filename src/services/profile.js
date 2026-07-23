import API_ENDPOINTS from "../endPoints/APIEndpoints";
import { apiRequest } from "../api/apiRequest";

export const updateProfile = (payload) =>
    apiRequest({
        ...API_ENDPOINTS.update_Profile,
        data: payload,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
