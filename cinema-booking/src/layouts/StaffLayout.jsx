import { Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const StaffLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="font-bold text-red-500 text-xl">STAFF POS & SCANNER</span>
          <nav className="flex gap-4">
            <Link to="/staff/pos" className="px-3 py-1.5 rounded hover:bg-slate-800 text-sm">Bán Vé (POS)</Link>
            <Link to="/staff/checkin" className="px-3 py-1.5 rounded hover:bg-slate-800 text-sm">Soát Vé QR</Link>
            <Link to="/staff/lookup" className="px-3 py-1.5 rounded hover:bg-slate-800 text-sm">Tra Cứu Vé</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">NV: {user?.full_name}</span>
          <button onClick={logout} className="text-xs bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded">
            Thoát ca
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
