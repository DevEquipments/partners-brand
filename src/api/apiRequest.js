import API from "./axios";

export const apiRequest = async (config) => {
  // console.log("config", config)
  try {
    const response = await API({
      url: config.url,
      method: config.method,
      ...(config.data && { data: config.data }),
      ...(config.params && { params: config.params }),
      ...(config.headers && { headers: config.headers }),
    });

    // console.log("response", response)
    return response.data;
  } catch (error) {
    throw (
      error?.response?.data || {
        success: false,
        message: error.message || "Something went wrong",
      }
    );
  }
};