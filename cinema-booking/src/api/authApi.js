import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
  logout: () => axiosClient.post('/auth/logout'),
  getProfile: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/profile', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};

export default authApi;
