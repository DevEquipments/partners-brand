import API from './axios';

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  const response = await API.post('/premium-brand-login', { email, password });
  return response.data;
};

/**
 * Register a new brand partner
 * Sends FormData to support file uploads in the future
 */
export const registerUser = async (data) => {
  const formData = new FormData();
  formData.append('brand_name', data.brand_name);
  formData.append('username', data.username);
  formData.append('password', data.password);
  formData.append('company_name', data.company_name);
  formData.append('office_address', data.office_address);
  formData.append('phone_no', data.phone_no);
  formData.append('gst', data.gst);
  formData.append('email', data.email);

  const response = await API.post('/premium-brand-register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Fetch authenticated user profile
 */
export const getProfile = async () => {
  const response = await API.post('/profile', null, {
    headers: { Accept: 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Logout authenticated user
 */
export const logoutUser = async () => {
  const response = await API.post('/logout', null, {
    headers: { Accept: 'multipart/form-data' },
  });
  return response.data;
};
