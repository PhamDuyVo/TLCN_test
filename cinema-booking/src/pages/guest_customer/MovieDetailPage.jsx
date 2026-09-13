import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react';
import movieApi from '../../api/movieApi';
import showtimeApi from '../../api/showtimeApi';
import { Calendar, Clock, Film, Play, Ticket, MapPin, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cinemasWithShowtimes, setCinemasWithShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('showtimes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getMovieById(id);
        if (res.success && res.data) {
          setMovie(res.data);
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết phim:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await showtimeApi.getShowtimesByMovie(id, selectedDate);
        if (res.success && res.data) {
          setCinemasWithShowtimes(res.data);
        }
      } catch (err) {
        console.error('Lỗi lấy lịch chiếu:', err);
      }
    };

    fetchShowtimes();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#121212] py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* 1. Movie Header Banner */}
        <div className="bg-[#181818] rounded-xl p-6 md:p-8 border border-zinc-800 flex flex-col md:flex-row gap-8 shadow-xl">
          <div className="w-full md:w-72 aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg bg-zinc-900 flex-shrink-0">
            <img
              src={movie?.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'}
              alt={movie?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#e71a0f] text-white font-black text-xs px-2.5 py-1 rounded shadow">
              {movie?.age_rating || 'P'}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-red-950/80 text-red-400 border border-red-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  {movie?.status === 'now_showing' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-0.5 rounded border border-zinc-700">
                  {movie?.genre_names || 'Hành Động, Viễn Tưởng'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">
                {movie?.title || 'AVATAR: DÒNG DÒNG NƯỚC'}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-6 text-xs text-zinc-300 border-y border-zinc-800 py-4">
                <p><span className="text-zinc-500 font-medium">Đạo diễn:</span> {movie?.director || 'James Cameron'}</p>
                <p><span className="text-zinc-500 font-medium">Diễn viên:</span> {movie?.cast_names || 'Sam Worthington, Zoe Saldana'}</p>
                <p><span className="text-zinc-500 font-medium">Thời lượng:</span> {movie?.duration_minutes || 120} phút</p>
                <p><span className="text-zinc-500 font-medium">Khởi chiếu:</span> {formatDate(movie?.release_date)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="#showtimes-section"
                className="bg-[#e71a0f] hover:bg-[#c41200] text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/40 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4" /> MUA VÉ NGAY
              </a>
            </div>
          </div>
        </div>

        {/* 2. Ribbon Tab Bar: Suất Chiếu */}
        <div id="showtimes-section" className="mt-12">
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              onClick={() => setActiveTab('showtimes')}
              className={`px-8 py-3 font-extrabold text-sm border-b-2 transition cursor-pointer ${
                activeTab === 'showtimes'
                  ? 'border-[#e71a0f] text-[#e71a0f]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              LỊCH CHIẾU THỰC TẾ (MYSQL DB)
            </button>
          </div>

          <div className="bg-[#181818] rounded-xl p-6 border border-zinc-800">
            {/* Cinema List from DB */}
            {cinemasWithShowtimes.length > 0 ? (
              cinemasWithShowtimes.map((cinema) => (
                <div key={cinema.cinema_id} className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800 mb-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h4 className="font-bold text-white text-base">{cinema.cinema_name}</h4>
                    <span className="text-xs text-zinc-400">{cinema.cinema_address}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {cinema.showtimes.map((st) => (
                      <button
                        key={st.showtime_id}
                        onClick={() => navigate(`/booking/${st.showtime_id}`)}
                        className="bg-zinc-900 hover:bg-[#e71a0f] text-zinc-200 hover:text-white border border-zinc-700 hover:border-[#e71a0f] p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition duration-200 group cursor-pointer shadow-sm"
                      >
                        <span className="text-base font-black text-white group-hover:scale-105 transition">
                          {new Date(st.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[11px] text-zinc-400 group-hover:text-red-100">
                          {st.room_name} ({st.screen_format})
                        </span>
                        <span className="text-[10px] text-amber-400 group-hover:text-white font-semibold mt-1">
                          {Number(st.base_price).toLocaleString()} ₫
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                Chưa có suất chiếu cho phim này trong CSDL.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
