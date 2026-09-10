import { Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Header / Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-red-500 tracking-wider">
            CINEMA<span className="text-white">TICKET</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-red-400 transition">Trang Chủ</Link>
            <Link to="/movies" className="hover:text-red-400 transition">Phim</Link>
            <Link to="/promotions" className="hover:text-red-400 transition">Khuyến Mãi</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-sm font-medium hover:text-red-400">
                  {user.full_name}
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-slate-400 text-sm">
        <p>© 2026 Cinema Ticket System - Nhóm 5. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CustomerLayout;
