import { Link } from 'react-router-dom';
import { Ticket, Info, Clock, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const MovieCard = ({ movie }) => {
  const {
    id,
    title,
    poster_url,
    age_rating = 'P',
    duration_minutes = 120,
    release_date,
    status = 'now_showing',
    screen_format = '2D',
  } = movie;

  const ageBadgeColors = {
    P: 'badge-age-P',
    K: 'badge-age-K',
    C13: 'badge-age-C13',
    T13: 'badge-age-C13',
    C16: 'badge-age-C16',
    T16: 'badge-age-C16',
    C18: 'badge-age-C18',
    T18: 'badge-age-C18',
  };

  return (
    <div className="group relative bg-[#181818] rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500/50 shadow-md hover:shadow-red-950/40 transition duration-300 flex flex-col">
      {/* 1. Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Age Rating Badge Top-Left */}
        <div className={`absolute top-2 left-2 px-2.5 py-1 rounded text-xs font-black tracking-wider shadow-md ${ageBadgeColors[age_rating] || 'badge-age-P'}`}>
          {age_rating}
        </div>

        {/* Screen Format Tag Top-Right */}
        <div className="absolute top-2 right-2 bg-black/80 text-zinc-300 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border border-zinc-700">
          {screen_format}
        </div>

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-center items-center gap-3 p-4">
          <Link
            to={`/movies/${id}`}
            className="w-full max-w-[160px] py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-zinc-600"
          >
            <Info className="w-3.5 h-3.5" /> Xem Chi Tiết
          </Link>
          <Link
            to={`/movies/${id}`}
            className="w-full max-w-[160px] py-2.5 bg-[#e71a0f] hover:bg-[#c41200] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-900/50"
          >
            <Ticket className="w-4 h-4" /> MUA VÉ NGAY
          </Link>
        </div>
      </div>

      {/* 2. Movie Info Container */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-[#141414]">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 line-clamp-1 group-hover:text-red-500 transition mb-1" title={title}>
            {title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" /> {duration_minutes} phút
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" /> {formatDate(release_date) || 'Đang chiếu'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
