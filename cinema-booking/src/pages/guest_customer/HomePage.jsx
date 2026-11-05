import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../../components/movie/MovieCard';
import movieApi from '../../api/movieApi';
import { dataOf, errorMessage, safeUrl } from '../../utils/booking';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('now_showing');
  const [result, setResult] = useState({ movies: [], loading: true, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    movieApi.getAllMovies(activeTab).then(dataOf).then(movies => {
      if (active) setResult({ movies, loading: false, error: '' });
    }).catch(error => { if (active) setResult({ movies: [], loading: false, error: errorMessage(error) }); });
    return () => { active = false; };
  }, [activeTab, retry]);
  const featured = result.movies[0];
  return <div className="bg-[#121212] pb-16 text-zinc-100">
    <section className="relative h-[480px] bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border-b border-zinc-800 overflow-hidden">
      {safeUrl(featured?.bannerUrl || featured?.posterUrl) && <img className="absolute w-full h-full object-cover opacity-40" src={safeUrl(featured.bannerUrl || featured.posterUrl)} alt="" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 pt-48">
        <p className="text-red-500 font-bold">UTE CINEMA</p>
        <h1 className="text-4xl font-black mt-3">{featured?.title || 'KHÁM PHÁ ĐIỆN ẢNH'}</h1>
        <p className="text-zinc-300 mt-3 max-w-2xl line-clamp-2">{featured?.description}</p>
        {featured && <Link className="inline-block bg-[#e71a0f] rounded-lg px-6 py-3 font-bold mt-6" to={`/movies/${featured.id}`}>XEM LỊCH CHIẾU</Link>}
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <h2 className="text-center text-2xl font-black mb-8">MOVIE SELECTION</h2>
      <div className="flex justify-center gap-4 mb-8">{[['now_showing', 'PHIM ĐANG CHIẾU'], ['coming_soon', 'PHIM SẮP CHIẾU']].map(([key, label]) => <button key={key} onClick={() => { setResult({ movies: [], loading: true, error: '' }); setActiveTab(key); if (key === activeTab) setRetry(v => v + 1); }} className={`px-6 py-3 rounded-full font-bold ${key === activeTab ? 'bg-[#e71a0f]' : 'bg-zinc-900 text-zinc-400'}`}>{label}</button>)}</div>
      {result.loading ? <p role="status">Đang tải phim…</p> : result.error ? <div role="alert" className="text-red-400">{result.error} <button onClick={() => setRetry(v => v + 1)} className="underline">Thử lại</button></div> : result.movies.length ? <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">{result.movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}</div> : <p className="text-center text-zinc-400 py-12">Chưa có phim trong danh mục này.</p>}
    </section>
  </div>;
}
