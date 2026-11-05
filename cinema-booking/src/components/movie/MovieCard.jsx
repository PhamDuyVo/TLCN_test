import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';
import { safeUrl } from '../../utils/booking';
export default function MovieCard({ movie }) {
  return <Link to={`/movies/${movie.id}`} className="group bg-[#181818] rounded-lg overflow-hidden border border-zinc-800 hover:border-red-500/50 shadow-md flex flex-col">
    <div className="relative aspect-[2/3] bg-zinc-900 flex items-center justify-center">
      {safeUrl(movie.posterUrl) ? <img src={safeUrl(movie.posterUrl)} alt={movie.title} loading="lazy" className="w-full h-full object-cover" /> : <span className="text-zinc-500">Chưa có poster</span>}
      {movie.ageRating && <span className="absolute top-2 left-2 bg-red-600 rounded px-2 py-1 text-xs font-bold text-white">{movie.ageRating}</span>}
    </div>
    <div className="p-4"><h3 className="font-bold text-zinc-100 group-hover:text-red-500">{movie.title}</h3><p className="text-xs text-zinc-400 mt-2">{movie.durationMinutes != null && `${movie.durationMinutes} phút · `}{formatDate(movie.releaseDate)}</p><p className="text-red-400 text-xs mt-3">Chi tiết & lịch chiếu →</p></div>
  </Link>;
}
