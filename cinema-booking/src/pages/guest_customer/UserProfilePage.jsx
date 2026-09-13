import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { User, Mail, Phone, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, Key, Ticket, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await updateProfile({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
      });
      if (res.success) {
        setSuccessMsg('Cập nhật thông tin cá nhân thành công!');
      } else {
        setErrorMsg(res.message || 'Cập nhật thất bại!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi cập nhật hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      return setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên!');
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg('Mật khẩu mới nhập lại không trùng khớp!');
    }

    setLoading(true);

    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        setSuccessMsg('Đổi mật khẩu thành công! Mật khẩu mới đã được áp dụng.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#181818] border border-zinc-800 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Bạn chưa đăng nhập</h2>
        <p className="text-xs text-zinc-400 mb-6">Vui lòng đăng nhập để xem thông tin cá nhân và quản lý tài khoản.</p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-md inline-block"
        >
          ĐĂNG NHẬP NGAY
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#181818] to-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-[#e71a0f] overflow-hidden flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user.full_name ? user.full_name.charAt(0) : 'U'
              )}
            </div>
            {user.is_email_verified ? (
              <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-[#181818]" title="Email đã xác thực">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : null}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user.full_name}</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 rounded">
                {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên Rạp' : 'Thành viên UTE Cinema'}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">{user.email}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Tham gia từ: {new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/my-tickets"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-lg border border-zinc-700 flex items-center gap-2 transition"
          >
            <Ticket className="w-4 h-4 text-red-500" />
            Vé Của Tôi
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-200 font-semibold text-xs rounded-lg border border-red-800 flex items-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          onClick={() => {
            setActiveTab('info');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-[#e71a0f] text-[#e71a0f] bg-[#181818]'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Thông Tin Cá Nhân
        </button>
        <button
          onClick={() => {
            setActiveTab('password');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'password'
              ? 'border-[#e71a0f] text-[#e71a0f] bg-[#181818]'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          Đổi Mật Khẩu
        </button>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        {activeTab === 'info' ? (
          /* ================= FORM CẬP NHẬT PROFILE ================= */
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e71a0f]" />
              CHỈNH SỬA THÔNG TIN CÁ NHÂN
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Họ Và Tên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Địa Chỉ Email (Không thể thay đổi)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-lg pl-10 pr-4 py-2.5 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                  Link Ảnh Đại Diện (Avatar URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-900/40 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                LƯU THAY ĐỔI
              </button>
            </div>
          </form>
        ) : (
          /* ================= FORM ĐỔI MẬT KHẨU ================= */
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#e71a0f]" />
              THAY ĐỔI MẬT KHẨU BẢO MẬT
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                Mật Khẩu Hiện Tại
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
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
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase">
                Xác Nhận Mật Khẩu Mới
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e71a0f]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-900/40 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                CẬP NHẬT MẬT KHẨU
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
