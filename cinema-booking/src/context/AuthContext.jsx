import { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo kiểm tra đăng nhập khi mở ứng dụng
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user_info', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Không thể tự động đăng nhập:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          setUser(null);
        }
      } else {
        const savedUser = localStorage.getItem('user_info');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('user_info');
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Xử lý lưu thông tin khi đăng nhập thành công
  const handleLoginSuccess = (userData, accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    if (userData) {
      localStorage.setItem('user_info', JSON.stringify(userData));
      setUser(userData);
    }
  };

  // 1. Đăng nhập truyền thống
  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      handleLoginSuccess(res.data.user, res.data.token, res.data.refreshToken);
    }
    return res;
  };

  // 2. Bước 1 Đăng ký: Gửi mã OTP
  const registerInit = async (userData) => {
    return await authApi.registerInit(userData);
  };

  // 3. Bước 2 Đăng ký: Xác thực OTP & Tự động đăng nhập
  const verifyRegistrationOtp = async (data) => {
    const res = await authApi.verifyRegistrationOtp(data);
    if (res.success && res.data) {
      handleLoginSuccess(res.data.user, res.data.token, res.data.refreshToken);
    }
    return res;
  };

  // 4. Đăng nhập qua Google
  const googleAuth = async (googleData) => {
    const res = await authApi.googleAuth(googleData);
    if (res.success && res.data) {
      handleLoginSuccess(res.data.user, res.data.token, res.data.refreshToken);
    }
    return res;
  };

  // 5. Quên Mật Khẩu - Gửi OTP
  const forgotPassword = async (email) => {
    return await authApi.forgotPassword(email);
  };

  // 6. Đặt lại Mật Khẩu Mới với OTP
  const resetPassword = async (data) => {
    return await authApi.resetPassword(data);
  };

  // 7. Đổi Mật Khẩu
  const changePassword = async (data) => {
    return await authApi.changePassword(data);
  };

  // 8. Cập nhật thông tin Hồ sơ cá nhân
  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('user_info', JSON.stringify(res.data));
    }
    return res;
  };

  // 9. Đăng xuất
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerInit,
        verifyRegistrationOtp,
        googleAuth,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        logout,
        setUser,
        handleLoginSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
