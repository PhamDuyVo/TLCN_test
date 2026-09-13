import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../../hooks/useAuth';
import { Mail, Lock, User, Phone, Key, Eye, EyeOff, ShieldCheck, ArrowRight, X, Sparkles, AlertCircle, CheckCircle2, Loader2, RefreshCw, LogIn } from 'lucide-react';

export const AuthPages = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Registration OTP Modal State
  const [isRegOtpModalOpen, setIsRegOtpModalOpen] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // OTP Lockout & Spamming Control (30s Lockout on 3 Failed Attempts)
  const [failedOtpCount, setFailedOtpCount] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Google Login Quick Select Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, registerInit, verifyRegistrationOtp, googleAuth, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Reset messages when switching tabs
  const handleTabChange = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 30-second Lockout countdown timer effect
  useEffect(() => {
    let timer = null;
    if (lockoutTimer > 0) {
      setIsLockedOut(true);
      timer = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0) {
      setIsLockedOut(false);
    }
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  // 60-second countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  // 1. Xử lý Đăng Nhập Email & Mật Khẩu
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      if (res.success) {
        setSuccessMsg(`🎉 Đăng nhập thành công! Chào mừng ${res.data.user.full_name || 'bạn'} trở lại UTE Cinema!`);
        setTimeout(() => navigate('/'), 1200);
      } else {
        setErrorMsg(res.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi kết nối server!');
    } finally {
      setLoading(false);
    }
  };

  // 2a. Xử lý Đăng Ký Bước 1: Gửi Mã OTP đến Email
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      return setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự!');
    }

    if (regPassword !== regConfirmPassword) {
      return setErrorMsg('Mật khẩu nhập lại không trùng khớp!');
    }

    setLoading(true);

    try {
      const res = await registerInit({
        full_name: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      if (res.success) {
        setSuccessMsg('Mã OTP xác thực đã được gửi tới Email của bạn! Vui lòng kiểm tra hộp thư.');
        setIsRegOtpModalOpen(true);
        setRegOtpCode('');
        setResendTimer(60);
        setIsTimerActive(true);
        setFailedOtpCount(0);
        setLockoutTimer(0);
        setIsLockedOut(false);
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi đăng ký tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  // 2b. Xử lý Gửi lại mã OTP Đăng Ký
  const handleResendRegOtp = async () => {
    if (isTimerActive || isLockedOut) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await registerInit({
        full_name: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      if (res.success) {
        setSuccessMsg('Mã OTP mới đã được gửi lại tới Email của bạn!');
        setResendTimer(60);
        setIsTimerActive(true);
        setFailedOtpCount(0);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi gửi lại mã OTP!');
    } finally {
      setLoading(false);
    }
  };

  // 2c. Xử lý Đăng Ký Bước 2: Xác nhận OTP & Tự động Đăng nhập với Chống Spam & Khóa 30s
  const handleVerifyRegOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLockedOut) {
      return setErrorMsg(`⚠️ Bạn đã bị khóa nhập mã trong 30 giây do nhập sai quá số lần quy định. Vui lòng chờ thêm ${lockoutTimer} giây!`);
    }

    if (!regOtpCode || regOtpCode.length !== 6) {
      return setErrorMsg('Vui lòng nhập đúng mã OTP 6 chữ số!');
    }

    setLoading(true);

    try {
      const res = await verifyRegistrationOtp({
        email: regEmail,
        otp_code: regOtpCode,
      });

      if (res.success) {
        // Thông báo chào mừng tùy chỉnh cá nhân hóa giàu cảm xúc
        setSuccessMsg(`🎉 CHÀO MƯỜNG ${regFullName.toUpperCase()} GIA NHẬP THÀNH VIÊN UTE CINEMA! Tài khoản của bạn đã được kích hoạt thành công. Đang tự động chuyển hướng...`);
        setIsRegOtpModalOpen(false);
        setFailedOtpCount(0);
        setTimeout(() => navigate('/'), 1500);
      } else {
        const nextFailed = failedOtpCount + 1;
        setFailedOtpCount(nextFailed);

        if (nextFailed >= 3) {
          setLockoutTimer(30);
          setIsLockedOut(true);
          setErrorMsg('⚠️ BẠN ĐÃ NHẬP SAI MÃ OTP 3 LẦN LIÊN TIẾP! Để đảm bảo an toàn và chống spam, tính năng nhập mã tạm thời bị khóa trong 30 giây.');
        } else {
          setErrorMsg(`❌ Mã OTP không chính xác! Vui lòng kiểm tra lại Email và nhập lại (Còn ${3 - nextFailed} lần thử).`);
        }
      }
    } catch (err) {
      const apiErrMsg = err.response?.data?.message || err.message || '';
      const nextFailed = failedOtpCount + 1;
      setFailedOtpCount(nextFailed);

      if (nextFailed >= 3 || apiErrMsg.includes('quá 3 lần')) {
        setLockoutTimer(30);
        setIsLockedOut(true);
        setErrorMsg('⚠️ BẠN ĐÃ NHẬP SAI MÃ OTP 3 LẦN LIÊN TIẾP! Để bảo mật hệ thống và phòng chống spam, phần nhập mã bị khóa trong 30 giây.');
      } else {
        setErrorMsg(apiErrMsg || `❌ Mã OTP không đúng. Vui lòng kiểm tra lại hộp thư Email và nhập lại (Còn ${3 - nextFailed} lần thử).`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Đăng Nhập Bằng Google qua Cửa Sổ Bật Lên Official (accounts.google.com)
  const triggerGoogleOAuthPopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('⏳ Đang xác thực tài khoản Google...');

        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleProfile = await googleRes.json();

        const res = await googleAuth({
          google_id: googleProfile.sub,
          email: googleProfile.email,
          full_name: googleProfile.name,
          avatar_url: googleProfile.picture,
        });

        if (res.success) {
          setSuccessMsg(`🎉 Đăng nhập Google thành công! Chào mừng ${googleProfile.name || googleProfile.email} trở lại UTE Cinema!`);
          setTimeout(() => navigate('/'), 1200);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || err.message || 'Lỗi xác thực tài khoản Google!');
      } finally {
        setLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google OAuth Popup Error:', errorResponse);
      setErrorMsg('Đăng nhập Google bị hủy hoặc gặp lỗi xác thực!');
    },
  });

  const handleGoogleAuthAction = (googleUserObj) => {
    if (googleUserObj && googleUserObj.email) {
      // Cho chọn trực tiếp từ modal nếu cần
      googleAuth(googleUserObj).then((res) => {
        if (res.success) {
          setSuccessMsg(`🎉 Đăng nhập Google thành công! (${res.data.user.email})`);
          setIsGoogleModalOpen(false);
          setTimeout(() => navigate('/'), 1200);
        }
      }).catch(err => setErrorMsg(err.message));
      return;
    }

    // Kích hoạt cửa sổ Popup chính thức của Google (accounts.google.com/v3/signin/accountchooser)
    try {
      triggerGoogleOAuthPopup();
    } catch (e) {
      // Fallback mở popup window Google Account Chooser
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(
        'https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Faccounts.google.com%2F',
        'GoogleAccountChooser',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
      );
    }
  };

  // 4. Quên Mật Khẩu Step 1: Gửi Mã OTP qua Email
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.success) {
        setSuccessMsg('Mã OTP khôi phục mật khẩu đã được gửi tới Email của bạn!');
        setForgotStep(2);
      } else {
        setErrorMsg(res.message || 'Không thể gửi mã OTP!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi gửi yêu cầu OTP!');
    } finally {
      setLoading(false);
    }
  };

  // 5. Quên Mật Khẩu Step 2: Xác thực OTP & Đổi Mật Khẩu
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      return setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên!');
    }

    if (newPassword !== confirmNewPassword) {
      return setErrorMsg('Mật khẩu mới nhập lại không trùng khớp!');
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email: forgotEmail,
        otp_code: otpCode,
        new_password: newPassword,
      });

      if (res.success) {
        setSuccessMsg('Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotStep(1);
          setMode('login');
          setLoginEmail(forgotEmail);
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi xác thực mã OTP!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] py-12 px-4 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-[#181818] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Branding Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-[#181818] to-zinc-950 p-6 border-b border-zinc-800 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#e71a0f] text-white px-3.5 py-1 rounded-md font-black text-sm tracking-widest mb-2 shadow-md">
            UTE CINEMA
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">
            {mode === 'login' ? 'TÀI KHOẢN THÀNH VIÊN' : 'ĐĂNG KÝ TÀI KHOẢN MOVIE'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Đặt vé xem phim nhanh chóng • Tích điểm nhận quà UTE
          </p>
        </div>

        {/* Tab Switcher: Đăng Nhập vs Đăng Ký */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 text.sm font-bold transition duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'text-[#e71a0f] border-b-2 border-[#e71a0f] bg-[#181818]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-3 text-sm font-bold transition duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'text-[#e71a0f] border-b-2 border-[#e71a0f] bg-[#181818]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            ĐĂNG KÝ TÀI KHOẢN
          </button>
        </div>

        {/* Alert Feedback Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            /* ================= FORM ĐĂNG NHẬP ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Địa Chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Mật Khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotEmail(loginEmail);
                      setForgotStep(1);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-red-500 hover:text-red-400 font-medium transition cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                ĐĂNG NHẬP NGAY
              </button>

              {/* Social Login Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <span className="relative bg-[#181818] px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                  HOẶC ĐĂNG NHẬP BẰNG
                </span>
              </div>

              {/* Google Auth Button - Trigger Real Google OAuth Popup (accounts.google.com) */}
              <button
                type="button"
                onClick={() => handleGoogleAuthAction()}
                disabled={loading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg font-semibold text-xs flex items-center justify-center gap-3 transition cursor-pointer shadow-sm hover:border-zinc-500"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Đăng nhập bằng tài khoản Google
              </button>
            </form>
          ) : (
            /* ================= FORM ĐĂNG KÝ ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Họ Và Tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Địa Chỉ Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Mã OTP xác thực sẽ được gửi tới Email này</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Mật Khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                  Xác Nhận Mật Khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                TIẾP TỤC & GỬI MÃ OTP XÁC THỰC
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ================= MODAL XÁC THỰC OTP ĐĂNG KÝ TÀI KHOẢN ================= */}
      {isRegOtpModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-red-800/40 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setIsRegOtpModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-950/80 border border-red-600/50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-950">
                <Mail className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">XÁC THỰC EMAIL ĐĂNG KÝ</h3>
              <p className="text-xs text-zinc-400 mt-1 px-2">
                Mã xác thực OTP (6 chữ số) đã được gửi tới địa chỉ Email:
              </p>
              <p className="text-sm font-semibold text-red-400 mt-0.5">{regEmail}</p>
            </div>

            <form onSubmit={handleVerifyRegOtpSubmit} className="space-y-4">
              {/* Spam Lockout Warning Banner */}
              {isLockedOut && (
                <div className="p-3 rounded-lg bg-red-950/90 border border-red-700 text-red-200 text-xs flex items-center gap-2 animate-bounce">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-300">TẠM THỜI KHÓA NHẬP MÃ (CHỐNG SPAM)</p>
                    <p className="text-[11px] text-red-300/90">
                      Bạn đã nhập sai 3 lần. Vui lòng chờ <span className="font-extrabold text-white text-sm">{lockoutTimer}s</span> để mở lại.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase text-center flex items-center justify-center gap-1">
                  Nhập Mã OTP 6 Chữ Số
                  {failedOtpCount > 0 && !isLockedOut && (
                    <span className="text-[11px] text-amber-400 font-normal">
                      (Đã sai {failedOtpCount}/3 lần)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={isLockedOut || loading}
                    maxLength={6}
                    placeholder={isLockedOut ? `Đã khóa (${lockoutTimer}s)` : '123456'}
                    value={regOtpCode}
                    onChange={(e) => setRegOtpCode(e.target.value)}
                    className={`w-full bg-zinc-900 border rounded-lg pl-12 pr-4 py-3 text-lg font-mono text-center tracking-[10px] focus:outline-none transition shadow-inner ${
                      isLockedOut
                        ? 'border-red-800 text-zinc-500 cursor-not-allowed bg-zinc-950/90'
                        : 'border-zinc-700 text-white focus:border-[#e71a0f]'
                    }`}
                  />
                </div>
              </div>

              {/* Resend OTP Timer Controls */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Không nhận được mã?</span>
                <button
                  type="button"
                  onClick={handleResendRegOtp}
                  disabled={isTimerActive || isLockedOut || loading}
                  className={`font-semibold flex items-center gap-1 cursor-pointer transition ${
                    isTimerActive || isLockedOut ? 'text-zinc-600 cursor-not-allowed' : 'text-red-500 hover:text-red-400'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {isTimerActive ? `Gửi lại mã (${resendTimer}s)` : 'Gửi lại mã OTP ngay'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || isLockedOut}
                className={`w-full py-3 text-white font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 ${
                  isLockedOut
                    ? 'bg-zinc-800 border border-zinc-700 cursor-not-allowed text-zinc-500'
                    : 'bg-[#e71a0f] hover:bg-[#c41200] shadow-red-900/50'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isLockedOut ? `ĐÃ KHÓA (CHỜ ${lockoutTimer}S)` : 'XÁC NHẬN & HOÀN TẤT ĐĂNG KÝ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL QUÊN MẬT KHẨU OTP ================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-950/80 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white">KHÔI PHỤC MẬT KHẨU</h3>
              <p className="text-xs text-zinc-400 mt-1">
                {forgotStep === 1
                  ? 'Nhập Email đăng ký để nhận mã OTP 6 số xác minh'
                  : `Nhập mã OTP vừa gửi tới ${forgotEmail}`}
              </p>
            </div>

            {forgotStep === 1 ? (
              /* Step 1: Form Nhập Email */
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                    Địa Chỉ Email Đăng Ký
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  GỬI MÃ OTP VỀ EMAIL
                </button>
              </form>
            ) : (
              /* Step 2: Form Nhập OTP & Đổi Mật Khẩu Mới */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">
                    Mã OTP (6 Chữ Số)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white tracking-widest font-mono text-center focus:outline-none focus:border-[#e71a0f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">
                    Mật Khẩu Mới
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase">
                    Xác Nhận Mật Khẩu Mới
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-lg transition cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-xs rounded-lg shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    ĐỔI MẬT KHẨU
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL GOOGLE AUTH ACCOUNT CHOOSER (CHUẨN TÀI KHOẢN GOOGLE) ================= */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-zinc-700/80 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in text-zinc-100">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white tracking-tight">Chọn một tài khoản</h3>
              <p className="text-xs text-zinc-400 mt-1">để tiếp tục tới <span className="font-semibold text-red-500">UTE Cinema Việt Nam</span></p>
            </div>

            {/* Danh sách các Tài khoản Google thực tế của người dùng */}
            <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {/* Account 1: Vo Pham Duy (23110088@student.hcmute.edu.vn) */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleAuthAction({
                    google_id: 'google_id_23110088',
                    email: '23110088@student.hcmute.edu.vn',
                    full_name: 'Vo Pham Duy',
                    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIq9Xz9X_default_user_1',
                  })
                }
                disabled={loading}
                className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-blue-500/60 rounded-xl flex items-center gap-3.5 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 font-bold text-white flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition">
                  V
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition">Vo Pham Duy</p>
                  <p className="text-xs text-zinc-400 truncate">23110088@student.hcmute.edu.vn</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Đã lưu</span>
              </button>

              {/* Account 2: Võ Phạm Duy (phamduyvo1303@gmail.com) */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleAuthAction({
                    google_id: 'google_id_phamduyvo1303',
                    email: 'phamduyvo1303@gmail.com',
                    full_name: 'Võ Phạm Duy',
                    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIq9Xz9X_default_user_2',
                  })
                }
                disabled={loading}
                className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-purple-500/60 rounded-xl flex items-center gap-3.5 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 font-bold text-white flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition">Võ Phạm Duy</p>
                  <p className="text-xs text-zinc-400 truncate">phamduyvo1303@gmail.com</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Đã lưu</span>
              </button>

              {/* Account 3: Võ Phạm duy (vophamduy.13032005@gmail.com) */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleAuthAction({
                    google_id: 'google_id_vophamduy13032005',
                    email: 'vophamduy.13032005@gmail.com',
                    full_name: 'Võ Phạm duy',
                    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIq9Xz9X_default_user_3',
                  })
                }
                disabled={loading}
                className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-teal-500/60 rounded-xl flex items-center gap-3.5 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-600 font-bold text-white flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-teal-400 transition">Võ Phạm duy</p>
                  <p className="text-xs text-zinc-400 truncate">vophamduy.13032005@gmail.com</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Đã lưu</span>
              </button>

              {/* Account 4: Nghiem Phan Vinh (23110129@student.hcmute.edu.vn) */}
              <button
                type="button"
                onClick={() =>
                  handleGoogleAuthAction({
                    google_id: 'google_id_23110129',
                    email: '23110129@student.hcmute.edu.vn',
                    full_name: 'Nghiem Phan Vinh',
                    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocIq9Xz9X_default_user_4',
                  })
                }
                disabled={loading}
                className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-emerald-500/60 rounded-xl flex items-center gap-3.5 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 font-bold text-white flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition">Nghiem Phan Vinh</p>
                  <p className="text-xs text-zinc-400 truncate">23110129@student.hcmute.edu.vn</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Đã lưu</span>
              </button>
            </div>

            {/* Tùy chọn Nhập một Tài khoản Google Khác */}
            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hoặc đăng nhập tài khoản Google khác:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="email.google@gmail.com"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  placeholder="Họ và Tên Google"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleGoogleAuthAction(null)}
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />}
                {loading ? 'ĐANG ĐĂNG NHẬP GOOGLE...' : 'ĐĂNG NHẬP VỚI TÀI KHOẢN TÙY CHỌN NÀY'}
              </button>
            </div>

            {/* Google OAuth Footer Terms */}
            <p className="text-[11px] text-zinc-500 text-center mt-5 leading-relaxed">
              Để tiếp tục, Google sẽ chia sẻ tên, địa chỉ email và ảnh hồ sơ của bạn với UTE Cinema. Xem Điều khoản dịch vụ và Chính sách quyền riêng tư.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPages;
