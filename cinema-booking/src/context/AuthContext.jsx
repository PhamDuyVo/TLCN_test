import { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import { clearSession, normalizeUser, restoreSession, saveSession } from './authSession';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    restoreSession(localStorage, () => authApi.getMe()).then((restored) => {
      if (active) { setUser(restored); setLoading(false); }
    });
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);
    return () => { active = false; window.removeEventListener('auth:expired', expired); };
  }, []);

  const handleLoginSuccess = (userData, accessToken, refreshToken) => {
    setUser(saveSession(localStorage, { user: userData, accessToken, refreshToken }));
  };

  // 1. Đăng nhập truyền thống
  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      handleLoginSuccess(res.data.user, res.data.accessToken ?? res.data.token, res.data.refreshToken);
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
      handleLoginSuccess(res.data.user, res.data.accessToken ?? res.data.token, res.data.refreshToken);
    }
    return res;
  };

  // 4. Đăng nhập qua Google
  const googleAuth = async (googleData) => {
    const res = await authApi.googleAuth(googleData);
    if (res.success && res.data) {
      handleLoginSuccess(res.data.user, res.data.accessToken ?? res.data.token, res.data.refreshToken);
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
      setUser(normalizeUser(res.data));
      localStorage.setItem('user_info', JSON.stringify(normalizeUser(res.data)));
    }
    return res;
  };

  // 9. Đăng xuất
  const logout = () => {
    clearSession(localStorage);
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
