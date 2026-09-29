import API from "./axios";

export const apiRequest = async (config) => {
  try {
    const response = await API({
      url: config.url,
      method: config.method,
      ...(config.data && { data: config.data }),
      ...(config.params && { params: config.params }),
      ...(config.headers && { headers: config.headers }),
      ...(config.skipGlobalToast !== undefined && { skipGlobalToast: config.skipGlobalToast }),
      ...(config.silent !== undefined && { silent: config.silent }),
    });

    return response.data;
  } catch (error) {
    const errorData = error?.response?.data;
    const message =
      errorData?.message ||
      errorData?.error ||
      error.message ||
      "Something went wrong";

    const err = new Error(message);
    err.name = "ApiError";
    err.response = error?.response;
    err.status = error?.response?.status;
    err.data = errorData;
    err.errors = errorData?.errors || {};
    err.toastShown = Boolean(error?.toastShown);
    err.success = false;

    throw err;
  }
};