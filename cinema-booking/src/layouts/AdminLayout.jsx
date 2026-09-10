import { Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-red-500">ADMIN PORTAL</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Dashboard</Link>
          <Link to="/admin/movies" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Phim</Link>
          <Link to="/admin/showtimes" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Lịch Chiếu</Link>
          <Link to="/admin/cinemas" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Rạp & Phòng</Link>
          <Link to="/admin/users" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Người Dùng</Link>
          <Link to="/admin/promotions" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Khuyến Mãi</Link>
          <Link to="/admin/bookings" className="block px-4 py-2.5 rounded hover:bg-slate-800 text-sm font-medium">Quản lý Đơn Hàng</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sm rounded">
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-200">Hệ Thống Quản Trị Rạp Phim</h1>
          <span className="text-sm text-slate-400">Admin: {user?.full_name}</span>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
