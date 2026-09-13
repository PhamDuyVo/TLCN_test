import axiosClient from './axiosClient';

export const authApi = {
  // Đăng ký bước 1: Gửi OTP xác thực về Email
  registerInit: (userData) => axiosClient.post('/auth/register-init', userData),

  // Đăng ký bước 2: Xác nhận OTP & kích hoạt tài khoản
  verifyRegistrationOtp: (data) => axiosClient.post('/auth/verify-registration-otp', data),

  // Đăng ký trực tiếp (fallback)
  register: (userData) => axiosClient.post('/auth/register', userData),

  // Đăng nhập Email & Password
  login: (credentials) => axiosClient.post('/auth/login', credentials),

  // Đăng nhập / Đăng ký qua Google
  googleAuth: (googleData) => axiosClient.post('/auth/google', googleData),

  // Refresh Access Token
  refreshToken: (refreshToken) => axiosClient.post('/auth/refresh-token', { refreshToken }),

  // Quên mật khẩu: Gửi OTP khôi phục
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),

  // Đặt lại mật khẩu mới bằng OTP
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),

  // Lấy thông tin tài khoản hiện tại
  getMe: () => axiosClient.get('/auth/me'),

  // Đổi mật khẩu trong trang cá nhân
  changePassword: (data) => axiosClient.put('/auth/change-password', data),

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => axiosClient.put('/auth/profile', data),
};

export default authApi;
