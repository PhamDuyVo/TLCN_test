import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { Film, DollarSign, Users, Ticket, TrendingUp, Calendar, Plus } from 'lucide-react';

const REVENUE_DATA = [
  { day: 'Thứ 2', revenue: 12500000 },
  { day: 'Thứ 3', revenue: 15200000 },
  { day: 'Thứ 4', revenue: 22800000 },
  { day: 'Thứ 5', revenue: 18400000 },
  { day: 'Thứ 6', revenue: 35600000 },
  { day: 'Thứ 7', revenue: 48900000 },
  { day: 'Chủ Nhật', revenue: 52100000 },
];

export const DashboardPage = () => (
  <div className="space-y-8 text-zinc-100">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-black text-white">DASHBOARD QUẢN TRỊ DOANH THU</h1>
      <span className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1 rounded text-zinc-300">
        Hệ thống Rạp UTE Cinema
      </span>
    </div>

    {/* Stat Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-[#141414] border border-zinc-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-400 font-medium">TỔNG DOANH THU TUẦN</span>
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-2xl font-black text-white">205,500,000 ₫</h3>
        <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
          <TrendingUp className="w-3.5 h-3.5" /> +18.4% so với tuần trước
        </span>
      </div>

      <div className="bg-[#141414] border border-zinc-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-400 font-medium">TỔNG VÉ ĐÃ BÁN</span>
          <Ticket className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-white">1,842 Vé</h3>
        <span className="text-[11px] text-zinc-400 mt-2 block">Tỷ lệ lấp đầy trung bình 74.2%</span>
      </div>

      <div className="bg-[#141414] border border-zinc-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-400 font-medium">PHIM CHIẾU HOT</span>
          <Film className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white line-clamp-1">Avatar 3</h3>
        <span className="text-[11px] text-amber-400 mt-2 block">Chiếm 52% tổng doanh thu</span>
      </div>

      <div className="bg-[#141414] border border-zinc-800 p-5 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-400 font-medium">TÀI KHOẢN KHÁCH HÀNG</span>
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-2xl font-black text-white">12,450</h3>
        <span className="text-[11px] text-blue-400 mt-2 block">+142 thành viên mới tuần này</span>
      </div>
    </div>

    {/* Recharts Revenue Line Chart */}
    <div className="bg-[#141414] border border-zinc-800 p-6 rounded-xl">
      <h2 className="text-base font-bold text-white mb-6">BIỂU ĐỒ TĂNG TRƯỞNG DOANH THU THEO NGÀY (VND)</h2>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
            <YAxis stroke="#a1a1aa" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="revenue" stroke="#e71a0f" strokeWidth={3} dot={{ fill: '#e71a0f' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export const ManageMoviesPage = () => (
  <div className="space-y-6 text-zinc-100">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">QUẢN LÝ DANH MỤC PHIM</h1>
      <button className="bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
        <Plus className="w-4 h-4" /> Thêm Phim Mới
      </button>
    </div>
  </div>
);

export const ManageShowtimesPage = () => (
  <div className="space-y-6 text-zinc-100">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">QUẢN LÝ LỊCH CHIẾU PHIM</h1>
      <button className="bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
        <Plus className="w-4 h-4" /> Thêm Suất Chiếu
      </button>
    </div>
  </div>
);

export const ManageCinemasPage = () => (
  <div className="space-y-6 text-zinc-100">
    <h1 className="text-xl font-bold text-white">QUẢN LÝ CỤM RẠP & PHÒNG CHIẾU</h1>
  </div>
);

export const ManageUsersPage = () => (
  <div className="space-y-6 text-zinc-100">
    <h1 className="text-xl font-bold text-white">QUẢN LÝ NGƯỜI DÙNG & NHÂN VIÊN</h1>
  </div>
);

export const ManagePromotionsPage = () => (
  <div className="space-y-6 text-zinc-100">
    <h1 className="text-xl font-bold text-white">QUẢN LÝ CHƯƠNG TRÌNH KHUYẾN MÃI</h1>
  </div>
);

export const ManageBookingsPage = () => (
  <div className="space-y-6 text-zinc-100">
    <h1 className="text-xl font-bold text-white">QUẢN LÝ ĐƠN HÀNG VÀ VÉ CHI TIẾT</h1>
  </div>
);
