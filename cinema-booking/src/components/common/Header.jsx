import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Ticket, User, LogOut, Film, Sparkles, MapPin } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#121212] border-b border-[#282828] sticky top-0 z-50 shadow-lg">
      {/* 1. Utility Top Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#1f1f1f] text-xs text-zinc-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> Hệ thống Rạp toàn quốc
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-500 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Ưu Đãi Mới Mỗi Ngược
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-amber-400 font-semibold hover:underline">
                [Trang Quản Trị Admin]
              </Link>
            )}
            {user?.role === 'staff' && (
              <Link to="/staff/pos" className="text-blue-400 font-semibold hover:underline">
                [Phân Hệ Nhân Viên POS]
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/my-tickets" className="hover:text-red-400 transition flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" /> Vé Của Tôi
                </Link>
                <span className="text-zinc-600">|</span>
                <Link to="/profile" className="font-medium text-zinc-200 hover:text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-500" /> {user.full_name}
                </Link>
                <button
                  onClick={logout}
                  className="hover:text-red-400 flex items-center gap-1 text-zinc-400 transition ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Thoát
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hover:text-white transition">Đăng Nhập</Link>
                <span className="text-zinc-600">/</span>
                <Link to="/login" className="hover:text-white transition">Đăng Ký</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo CGV Style */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-[#e71a0f] text-white p-2 rounded-lg font-black text-2xl tracking-tighter shadow-md group-hover:bg-[#c41200] transition">
            CGV
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider text-white">CINEMA</span>
            <span className="text-[10px] text-zinc-400 tracking-widest uppercase -mt-1">CULTURES & MOVIES</span>
          </div>
        </Link>

        {/* Center Menu Links */}
        <nav className="flex items-center gap-8 font-bold text-sm text-zinc-200">
          <Link to="/movies" className="hover:text-[#e71a0f] transition flex items-center gap-1.5">
            <Film className="w-4 h-4 text-red-500" /> PHIM
          </Link>
          <Link to="/movies" className="hover:text-[#e71a0f] transition">RẠP & LỊCH CHIẾU</Link>
          <Link to="/promotions" className="hover:text-[#e71a0f] transition text-amber-400">KHUYẾN MÃI</Link>
        </nav>

        {/* Action Ticket CTA */}
        <button
          onClick={() => navigate('/movies')}
          className="bg-[#e71a0f] hover:bg-[#c41200] text-white px-5 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/30 transition transform active:scale-95 cursor-pointer"
        >
          <Ticket className="w-4 h-4" /> MUA VÉ NGAY
        </button>
      </div>
    </header>
  );
};

export default Header;
