import { useState } from 'react';
import MovieCard from '../../components/movie/MovieCard';
import { Film, Ticket, ChevronRight, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Dữ liệu mẫu phim phục vụ thiết kế giao diện UI/UX CGV
const MOCK_MOVIES = [
  {
    id: 1,
    title: 'AVATAR: DÒNG DÒNG NƯỚC (AVATAR 3)',
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
    age_rating: 'C13',
    duration_minutes: 192,
    release_date: '2026-09-10',
    status: 'now_showing',
    screen_format: 'IMAX 3D',
  },
  {
    id: 2,
    title: 'QUẬN 9: CHIẾN DỊCH BẢO VỆ',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
    age_rating: 'C18',
    duration_minutes: 135,
    release_date: '2026-09-12',
    status: 'now_showing',
    screen_format: '2D Phụ đề',
  },
  {
    id: 3,
    title: 'HOÀNG TỬ DẢI NGÂN HÀ',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    age_rating: 'P',
    duration_minutes: 110,
    release_date: '2026-09-15',
    status: 'now_showing',
    screen_format: '2D Lồng tiếng',
  },
  {
    id: 4,
    title: 'KẺ ẨN DANH 2: THÁCH THỨC',
    poster_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop',
    age_rating: 'C16',
    duration_minutes: 125,
    release_date: '2026-09-18',
    status: 'now_showing',
    screen_format: '2D Phụ đề',
  },
  {
    id: 5,
    title: 'BÍ MẬT ĐẢO NGUYÊN SINH',
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    age_rating: 'C13',
    duration_minutes: 140,
    release_date: '2026-09-25',
    status: 'coming_soon',
    screen_format: 'IMAX 2D',
  },
];

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('now_showing');
  const navigate = useNavigate();

  const filteredMovies = MOCK_MOVIES.filter((m) => m.status === activeTab);

  return (
    <div className="w-full bg-[#121212] pb-16">
      {/* 1. Hero Banner Slider Carousel */}
      <div className="relative w-full h-[480px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-black overflow-hidden border-b border-zinc-800">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop"
          alt="Hero Banner"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/60" />

        <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-4 flex justify-between items-end">
          <div className="max-w-2xl">
            <span className="bg-[#e71a0f] text-white text-xs font-extrabold px-3 py-1 rounded uppercase tracking-widest">
              SUPER BLOCKBUSTER 2026
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-wide drop-shadow-md">
              AVATAR: DÒNG DÒNG NƯỚC
            </h1>
            <p className="text-zinc-300 text-sm mt-2 line-clamp-2">
              Hành trình trở lại hành tinh Pandora rực rỡ với định dạng chiếu IMAX 3D siêu chân thực tại hệ thống rạp CGV Cinema.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => navigate('/movies/1')}
                className="bg-[#e71a0f] hover:bg-[#c41200] text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/50 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4" /> MUA VÉ NGAY
              </button>
              <button
                onClick={() => navigate('/movies/1')}
                className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-600 px-5 py-3 rounded-md font-semibold text-sm transition cursor-pointer"
              >
                Xem Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        {/* CGV Retro Title Divider */}
        <div className="cgv-title-section">
          <h2 className="inline-block bg-[#121212] px-6 text-2xl font-black text-white tracking-widest uppercase">
            --- MOVIE SELECTION ---
          </h2>
        </div>

        {/* Tab Toggle: Phim Đang Chiếu vs Phim Sắp Chiếu */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('now_showing')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition duration-300 cursor-pointer ${
              activeTab === 'now_showing'
                ? 'bg-[#e71a0f] text-white shadow-lg shadow-red-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            PHIM ĐANG CHIẾU
          </button>
          <button
            onClick={() => setActiveTab('coming_soon')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition duration-300 cursor-pointer ${
              activeTab === 'coming_soon'
                ? 'bg-[#e71a0f] text-white shadow-lg shadow-red-900/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            PHIM SẮP CHIẾU
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* 3. Event & Promotion Banner Section */}
        <div className="mt-16 bg-[#181818] rounded-xl p-8 border border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> THÀNH VIÊN & ƯU ĐÃI ĐẶC BIỆT
            </h3>
            <span className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white cursor-pointer">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-900/40 to-zinc-900 p-5 rounded-lg border border-red-900/50">
              <span className="text-xs font-bold text-red-400 uppercase">Thứ 4 Vui Vẻ</span>
              <h4 className="text-lg font-bold text-white mt-1">Đồng Giá 50k Vé Xem Phim</h4>
              <p className="text-xs text-zinc-400 mt-2">Áp dụng cho tất cả thành viên CGV khi đặt vé online vào ngày Thứ 4 hàng tuần.</p>
            </div>
            <div className="bg-gradient-to-r from-amber-900/40 to-zinc-900 p-5 rounded-lg border border-amber-900/50">
              <span className="text-xs font-bold text-amber-400 uppercase">Combo Bắp Nước</span>
              <h4 className="text-lg font-bold text-white mt-1">Giảm 20% Combo Couple</h4>
              <p className="text-xs text-zinc-400 mt-2">Thêm Combo Bắp Nước Caramel khi thanh toán vé trực tuyến.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-900/40 to-zinc-900 p-5 rounded-lg border border-blue-900/50">
              <span className="text-xs font-bold text-blue-400 uppercase">Thanh Toán MoMo / VNPay</span>
              <h4 className="text-lg font-bold text-white mt-1">Hoàn Tiền Đến 30k</h4>
              <p className="text-xs text-zinc-400 mt-2">Nhập mã ưu đãi khi chuyển hướng thanh toán cổng ngân hàng.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
