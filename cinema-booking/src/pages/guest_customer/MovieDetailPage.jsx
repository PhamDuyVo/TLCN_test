import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import movieApi from '../../api/movieApi';
import showtimeApi from '../../api/showtimeApi';
import { dataOf, errorMessage, safeUrl, serverTime, vietnamDate } from '../../utils/booking';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [date, setDate] = useState(vietnamDate);
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    movieApi.getMovieById(id).then(dataOf).then(data => { if (active) { setMovie(data); setError(''); } }).catch(e => { if (active) { setMovie(null); setError(errorMessage(e)); } });
    return () => { active = false; };
  }, [id, retry]);
  useEffect(() => {
    let active = true;
    showtimeApi.getShowtimesByMovie(id, date).then(dataOf).then(data => { if (active) { setShows(data); setShowError(''); } }).catch(e => { if (active) { setShows([]); setShowError(errorMessage(e)); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, date, retry]);
  const groups = Object.values(shows.reduce((all, show) => { (all[show.cinemaId] ||= { name: show.cinemaName, shows: [] }).shows.push(show); return all; }, {}));
  return <main className="bg-[#121212] min-h-screen text-zinc-100 py-10"><div className="max-w-7xl mx-auto px-4">
    {error && <p role="alert" className="text-red-400">{error} <button onClick={() => setRetry(v => v + 1)} className="underline">Thử lại</button></p>}
    {!movie && !error && <p role="status">Đang tải phim…</p>}
    {movie && <section className="bg-[#181818] rounded-xl border border-zinc-800 p-8 flex flex-col md:flex-row gap-8">
      <div className="w-64 aspect-[2/3] bg-zinc-900 shrink-0">{safeUrl(movie.posterUrl) && <img src={safeUrl(movie.posterUrl)} alt={movie.title} className="w-full h-full object-cover rounded-lg" />}</div>
      <div><p className="text-red-400">{movie.ageRating} · {movie.genres?.join(', ')}</p><h1 className="text-4xl font-black mt-3">{movie.title}</h1><div className="text-sm text-zinc-400 space-y-2 my-6"><p>Đạo diễn: {movie.director || 'Chưa cập nhật'}</p><p>Diễn viên: {movie.cast || 'Chưa cập nhật'}</p><p>{movie.durationMinutes} phút · Khởi chiếu {formatDate(movie.releaseDate)}</p></div><p className="text-zinc-300 whitespace-pre-line">{movie.description}</p>{safeUrl(movie.trailerUrl) && <a href={safeUrl(movie.trailerUrl)} target="_blank" rel="noreferrer" className="inline-block border border-red-700 rounded-lg px-5 py-3 mt-5">Xem trailer</a>}</div>
    </section>}
    <section className="mt-10"><h2 className="text-xl font-bold mb-5">LỊCH CHIẾU</h2><label className="text-zinc-400">Ngày chiếu <input type="date" value={date} min={vietnamDate()} onChange={e => { if (e.target.value) { setDate(e.target.value); setLoading(true); } }} className="bg-zinc-900 border border-zinc-700 rounded p-3 ml-3 text-white" /></label>
      {loading ? <p className="mt-6" role="status">Đang tải lịch chiếu…</p> : showError ? <p role="alert" className="text-red-400 mt-6">{showError} <button onClick={() => setRetry(v => v + 1)}>Thử lại</button></p> : !groups.length ? <p className="text-zinc-400 py-8">Chưa có suất chiếu trong ngày này.</p> : groups.map(group => <div key={group.name} className="bg-[#181818] rounded-xl border border-zinc-800 p-6 mt-6"><h3 className="font-bold mb-4">{group.name}</h3><div className="flex flex-wrap gap-3">{group.shows.map(show => {
        const past = serverTime(show.startTime) <= Date.now() || ['CANCELLED', 'COMPLETED'].includes(show.status?.toUpperCase());
        const content = <><span>{formatDateTime(show.startTime)}</span><span className="text-xs text-zinc-400">{show.hallName} · {show.screenType}</span><span className="text-amber-400">{formatCurrency(show.basePrice)}</span></>;
        return past ? <div key={show.id} className="p-3 border border-zinc-800 rounded-lg flex flex-col opacity-40">{content}<span>Không khả dụng</span></div> : <Link key={show.id} to={`/booking/${show.id}`} className="p-3 border border-zinc-700 hover:border-red-500 rounded-lg flex flex-col gap-1">{content}</Link>;
      })}</div></div>)}
    </section>
  </div></main>;
}
