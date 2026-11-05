import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import showtimeApi from '../../api/showtimeApi';
import useCountdown from '../../hooks/useCountdown';
import { canSelectSeat, dataOf, errorMessage, timedHold } from '../../utils/booking';
import { formatCurrency, formatDateTime } from '../../utils/format';
const CinemaHall3D = lazy(() => import('../../components/booking/CinemaHall3D'));

export default function BookingSeatPage() {
  const { showtimeId } = useParams();
  return <BookingSession key={showtimeId} showtimeId={showtimeId} />;
}
function BookingSession({ showtimeId }) {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [hold, setHold] = useState(null);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState('2D');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(false);
  const operation = useRef(false);
  const alive = useRef(true);
  const { formattedTime, isExpired } = useCountdown(hold?.expiresAt, hold?.clockOffset);
  const refresh = useCallback(async () => {
    if (operation.current) return;
    operation.current = true;
    try {
      const [seats, current] = await Promise.all([showtimeApi.getShowtimeSeats(showtimeId).then(dataOf), showtimeApi.getHold(showtimeId).then(dataOf)]);
      if (!alive.current) return;
      setMap(seats); setHold(timedHold(current)); setSelected(current.status === 'ACTIVE' ? current.seatIds : []); setOnline(true); setError('');
    } catch (e) { if (alive.current) { setError(errorMessage(e)); setOnline(false); } }
    finally { operation.current = false; }
  }, [showtimeId]);
  useEffect(() => {
    alive.current = true;
    Promise.resolve().then(refresh);
    const timer = setInterval(refresh, 5000);
    const onVisible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { alive.current = false; clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh]);
  async function save(ids, release = false) {
    if (operation.current) return;
    operation.current = true; setBusy(true); setError('');
    try {
      const current = dataOf(await (release ? showtimeApi.deleteHold(showtimeId) : showtimeApi.putHold(showtimeId, ids)));
      if (alive.current) { setHold(timedHold(current)); setSelected(current.seatIds || []); setOnline(true); }
    } catch (e) { if (alive.current) { setError(errorMessage(e)); setOnline(false); } }
    finally { operation.current = false; if (alive.current) setBusy(false); }
  }
  const expired = hold?.status === 'EXPIRED' || (hold?.status === 'ACTIVE' && isExpired);
  const own = !expired ? selected : [];
  function toggle(seat) {
    if (busy || expired || !online || !canSelectSeat(seat, own)) return;
    const next = own.includes(seat.id) ? own.filter(id => id !== seat.id) : [...own, seat.id];
    if (next.length > 8) { setError('Tối đa 8 ghế trong một lần đặt.'); return; }
    save(next, next.length === 0);
  }
  const chosen = map?.seats.filter(seat => own.includes(seat.id)) || [];
  const rows = Object.groupBy ? Object.groupBy(map?.seats || [], seat => seat.seatRow) : (map?.seats || []).reduce((all, seat) => { (all[seat.seatRow] ||= []).push(seat); return all; }, {});
  const show = map?.showtime;
  return <main className="bg-[#121212] min-h-screen py-8 text-zinc-100"><div className="max-w-7xl mx-auto px-4">
    <header className="bg-[#181818] border border-zinc-800 rounded-xl p-5 flex justify-between flex-wrap gap-4 mb-8"><div><h1 className="text-xl font-black">{show?.movieTitle || 'CHỌN GHẾ'}</h1><p className="text-sm text-zinc-400 mt-1">{show?.cinemaName} · {show?.hallName} · {formatDateTime(show?.startTime)}</p></div><div className="text-red-400"><p className="text-xs">Thời gian giữ ghế</p><strong className="text-2xl">{hold?.expiresAt ? formattedTime : 'Chưa giữ ghế'}</strong></div></header>
    {error && <div role="alert" className="text-red-400 mb-4">{error} <button onClick={refresh} className="underline">Tải lại trạng thái</button></div>}
    {expired && <div role="alert" className="bg-red-950 p-4 rounded-lg mb-4">Phiên giữ ghế đã hết hạn. <button disabled={busy || !online} onClick={() => save([])} className="underline disabled:opacity-40">Bắt đầu phiên mới</button></div>}
    {!map ? <p role="status">Đang tải sơ đồ ghế…</p> : <div className="grid lg:grid-cols-3 gap-8"><section className="lg:col-span-2 bg-[#181818] border border-zinc-800 rounded-xl p-5 overflow-hidden">
      <div className="flex gap-3 mb-6">{['2D', '3D'].map(mode => <button key={mode} aria-pressed={view === mode} onClick={() => setView(mode)} className={`px-5 py-2 rounded-lg ${view === mode ? 'bg-[#e71a0f]' : 'bg-zinc-800'}`}>{mode}</button>)}</div>
      {view === '2D' ? <div className="overflow-x-auto"><div className="min-w-max p-3"><div className="border-t-4 rounded-t-[50%] border-zinc-400 text-center text-xs text-zinc-500 mb-12 pt-3">MÀN HÌNH</div><div className="space-y-3">{Object.entries(rows).sort(([a], [b]) => a.localeCompare(b)).map(([row, seats]) => <div key={row} className="flex gap-2 items-center"><span className="w-6 text-zinc-500">{row}</span><div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(...map.seats.map(s => s.seatCol))}, 2rem)` }}>{seats.map(seat => <button key={seat.id} style={{ gridColumn: seat.seatCol }} title={`${seat.seatNumber} · ${seat.seatType} · ${formatCurrency(seat.finalPrice)} · ${seat.status}`} aria-label={`Ghế ${seat.seatNumber}`} aria-pressed={own.includes(seat.id)} disabled={busy || expired || !online || !canSelectSeat(seat, own)} onClick={() => toggle(seat)} className={`h-8 rounded border text-xs disabled:opacity-40 ${own.includes(seat.id) ? 'bg-[#e71a0f] border-red-500' : canSelectSeat(seat, own) ? 'bg-zinc-900 border-amber-600' : 'bg-zinc-700 border-zinc-700'}`}>{seat.seatCol}</button>)}</div></div>)}</div></div></div> : <Suspense fallback={<p role="status">Đang tải phòng 3D…</p>}><CinemaHall3D seats={map.seats} selectedIds={own} onToggle={toggle} disabled={busy || expired || !online} /></Suspense>}
      <p className="text-xs text-zinc-400 mt-6">Đỏ: đang chọn · Viền vàng: còn trống · Xám: đã bán / đang giữ / không khả dụng</p><p className="text-xs text-zinc-500 mt-2">Trạng thái ghế tự cập nhật mỗi 5 giây.</p>
    </section><aside className="bg-[#181818] border border-zinc-800 rounded-xl p-6 h-fit"><h2 className="font-bold border-b border-zinc-800 pb-4">THÔNG TIN ĐẶT VÉ</h2><div className="py-4 space-y-2">{chosen.map(s => <p key={s.id} className="flex justify-between"><span>{s.seatNumber} · {s.seatType}</span><span>{formatCurrency(s.finalPrice)}</span></p>)}{!chosen.length && <p className="text-zinc-500">Chưa chọn ghế</p>}</div><p className="text-xl text-red-500 font-bold mb-6">{formatCurrency(chosen.reduce((sum, s) => sum + Number(s.finalPrice), 0))}</p><button disabled={!chosen.length || busy || expired || !online} onClick={() => navigate(`/checkout?showtimeId=${showtimeId}`)} className="w-full bg-[#e71a0f] rounded-lg py-3 font-bold disabled:opacity-40">TIẾP TỤC THANH TOÁN</button><button disabled={!chosen.length || busy} onClick={() => save([], true)} className="w-full text-zinc-400 text-sm mt-4 disabled:opacity-40">Bỏ chọn tất cả</button></aside></div>}
  </div></main>;
}
