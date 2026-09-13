import { useState, useEffect } from 'react';
import MovieCard from '../../components/movie/MovieCard';
import movieApi from '../../api/movieApi';
import { Film, Ticket, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('now_showing');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getAllMovies(activeTab);
        if (res.success && res.data && res.data.length > 0) {
          setMovies(res.data);
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách phim:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab]);

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
              Hành trình trở lại hành tinh Pandora rực rỡ với định dạng chiếu IMAX 3D siêu chân thực tại hệ thống rạp UTE Cinema.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={() => navigate('/movies/1')}
                className="bg-[#e71a0f] hover:bg-[#c41200] text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/50 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4" /> MUA VÉ NGAY
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        {/* UTE Cinema Retro Title Divider */}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
            <p className="text-xs">Đang tải dữ liệu phim từ CSDL MySQL...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800">
            Chưa có phim nào thuộc danh mục này trong CSDL.
          </div>
        )}

        {/* 3. Event & Promotion Banner Section */}
        <div className="mt-16 bg-[#181818] rounded-xl p-8 border border-zinc-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> THÀNH VIÊN & ƯU ĐÃI ĐẶC BIỆT
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-900/40 to-zinc-900 p-5 rounded-lg border border-red-900/50">
              <span className="text-xs font-bold text-red-400 uppercase">Thứ 4 Vui Vẻ</span>
              <h4 className="text-lg font-bold text-white mt-1">Đồng Giá 50k Vé Xem Phim</h4>
              <p className="text-xs text-zinc-400 mt-2">Áp dụng cho tất cả thành viên UTE Cinema khi đặt vé online vào ngày Thứ 4 hàng tuần.</p>
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
