import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import showtimeApi from '../../api/showtimeApi';
import useCountdown from '../../hooks/useCountdown';
import { comboItems, dataOf, errorMessage, timedHold } from '../../utils/booking';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const id = Number(params.get('showtimeId'));
  if (!Number.isSafeInteger(id) || id <= 0) return <main className="bg-[#121212] min-h-screen p-10 text-zinc-100"><p>Chưa có suất chiếu để thanh toán.</p><Link to="/" className="text-red-400 underline">Chọn phim và ghế</Link></main>;
  return <CheckoutSession key={id} showtimeId={id} />;
}
function CheckoutSession({ showtimeId }) {
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [combos, setCombos] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [promotionCode, setPromotionCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [error, setError] = useState('');
  const [online, setOnline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retry, setRetry] = useState(0);
  const submittingRef = useRef(false);
  const { formattedTime, isExpired } = useCountdown(context?.hold.expiresAt, context?.hold.clockOffset);
  useEffect(() => {
    let active = true, running = false;
    async function refresh() {
      if (running || submittingRef.current) return;
      running = true;
      try {
        const [map, hold, products] = await Promise.all([showtimeApi.getShowtimeSeats(showtimeId).then(dataOf), showtimeApi.getHold(showtimeId).then(dataOf), bookingApi.getCombos().then(dataOf)]);
        if (active) { setContext({ ...map, hold: timedHold(hold) }); setCombos(products); setOnline(true); setError(''); }
      } catch (e) { if (active) { setOnline(false); setError(errorMessage(e)); } }
      finally { running = false; }
    }
    refresh(); const timer = setInterval(refresh, 5000);
    const visible = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [showtimeId, retry]);
  const seatIds = context?.hold.seatIds || [];
  const validHold = context?.hold.status === 'ACTIVE' && !isExpired && seatIds.length > 0;
  const payloadKey = JSON.stringify({ showtimeId, seatIds, combos: comboItems(quantities), promotionCode: promotionCode.trim().toUpperCase() });
  useEffect(() => {
    if (!validHold || !online) return;
    let active = true;
    const timer = setTimeout(() => {
      bookingApi.quote(JSON.parse(payloadKey)).then(dataOf).then(data => { if (active) { setQuote({ key: payloadKey, data }); setQuoteError(''); } }).catch(e => { if (active) { setQuote(null); setQuoteError(errorMessage(e)); } });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [payloadKey, validHold, online, retry]);
  const currentQuote = quote?.key === payloadKey ? quote.data : null;
  async function submit() {
    if (submittingRef.current || !validHold || !online || !currentQuote) return;
    submittingRef.current = true; setSubmitting(true); setError('');
    try {
      const booking = dataOf(await bookingApi.createBooking({ ...JSON.parse(payloadKey), paymentMethod: 'PAY_AT_COUNTER' }));
      if (!booking?.bookingCode) throw new Error('Máy chủ chưa trả mã đặt vé. Vui lòng kiểm tra Vé của tôi trước khi thử lại.');
      navigate(`/booking-success?bookingCode=${encodeURIComponent(booking.bookingCode)}`, { replace: true });
    } catch (e) { setError(errorMessage(e)); setQuote(null); setOnline(false); }
    finally { submittingRef.current = false; setSubmitting(false); }
  }
  const show = context?.showtime;
  return <main className="min-h-screen bg-[#121212] text-zinc-100 py-10"><div className="max-w-6xl mx-auto px-4"><h1 className="text-2xl font-black border-b border-zinc-800 pb-4 mb-6">XÁC NHẬN ĐẶT VÉ</h1>
    {error && <p role="alert" className="text-red-400 mb-4">{error} <button onClick={() => setRetry(v => v + 1)} className="underline">Thử lại</button></p>}
    {!context ? <p role="status">Đang tải đơn đặt vé…</p> : !validHold ? <div role="alert" className="bg-[#181818] border border-zinc-800 p-6 rounded-xl">Không còn ghế được giữ trong phiên này. <Link className="text-red-400 underline" to={`/booking/${showtimeId}`}>Quay lại chọn ghế</Link></div> : <div className="grid lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-6">
      <section className="bg-[#181818] border border-zinc-800 rounded-xl p-6"><h2 className="font-bold text-amber-400 mb-4">COMBO BẮP NƯỚC</h2>{!combos.length && <p className="text-zinc-400">Chưa có combo khả dụng.</p>}{combos.map(combo => <div key={combo.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-3 flex justify-between items-center gap-4"><div><h3 className="font-bold">{combo.name}</h3><p className="text-xs text-zinc-400">{combo.description}</p><p className="text-amber-400 text-sm mt-2">{formatCurrency(combo.price)}</p></div><div className="flex gap-3 items-center"><button disabled={submitting || !(quantities[combo.id] > 0)} aria-label={`Giảm ${combo.name}`} onClick={() => setQuantities(q => ({ ...q, [combo.id]: Math.max(0, (q[combo.id] || 0) - 1) }))} className="bg-zinc-700 rounded px-2 disabled:opacity-40">−</button><span>{quantities[combo.id] || 0}</span><button disabled={submitting} aria-label={`Thêm ${combo.name}`} onClick={() => setQuantities(q => ({ ...q, [combo.id]: (q[combo.id] || 0) + 1 }))} className="bg-red-600 rounded px-2">+</button></div></div>)}</section>
      <section className="bg-[#181818] border border-zinc-800 rounded-xl p-6"><label className="font-bold block mb-3" htmlFor="promotion">MÃ GIẢM GIÁ / VOUCHER</label><input id="promotion" value={promotionCode} disabled={submitting} onChange={e => { setPromotionCode(e.target.value); setQuoteError(''); }} placeholder="Nhập mã ưu đãi" className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 w-full uppercase" /><p className="text-xs text-zinc-500 mt-2">Mã và tổng tiền được máy chủ kiểm tra tự động.</p>{quoteError && <p role="alert" className="text-red-400 mt-3">{quoteError} <button className="underline" onClick={() => setRetry(v => v + 1)}>Thử lại</button></p>}</section>
      <section className="bg-[#181818] border border-zinc-800 rounded-xl p-6"><h2 className="font-bold mb-2">THANH TOÁN TẠI QUẦY</h2><p className="text-sm text-zinc-400">Đặt chỗ trực tuyến, thanh toán tại quầy rạp. Xác nhận đặt vé chưa phải xác nhận đã thanh toán.</p></section>
    </div><aside className="bg-[#181818] border border-zinc-800 rounded-xl p-6 h-fit"><h2 className="font-bold mb-4">CHI TIẾT ĐẶT VÉ</h2><p className="text-red-400 font-bold mb-4">Giữ ghế: {formattedTime}</p><h3 className="font-bold">{show.movieTitle}</h3><p className="text-sm text-zinc-400 my-2">{show.cinemaName} · {show.hallName}</p><p className="text-sm text-zinc-400">{formatDateTime(show.startTime)}</p><p className="my-4">Ghế: {context.seats.filter(s => seatIds.includes(s.id)).map(s => s.seatNumber).join(', ')}</p>
      {currentQuote ? <div className="border-y border-zinc-800 py-4 space-y-3 text-sm">{[['Tiền vé', currentQuote.seatAmount], ['Combo', currentQuote.comboAmount], ['Giảm giá', currentQuote.discountAmount]].map(([label, value]) => <p key={label} className="flex justify-between"><span>{label}</span><span>{formatCurrency(value)}</span></p>)}<p className="text-lg font-bold text-red-500 flex justify-between"><span>Tổng tiền</span><span>{formatCurrency(currentQuote.finalAmount)}</span></p></div> : <p role="status" className="text-zinc-400 my-4">{quoteError ? 'Chưa có báo giá hợp lệ.' : 'Đang xác nhận giá với máy chủ…'}</p>}
      <button disabled={!currentQuote || submitting || !online || !validHold} onClick={submit} className="bg-[#e71a0f] rounded-lg w-full py-3 font-bold mt-6 disabled:opacity-40">{submitting ? 'ĐANG ĐẶT VÉ…' : 'XÁC NHẬN ĐẶT VÉ'}</button><Link to={`/booking/${showtimeId}`} className="block text-center text-sm text-zinc-400 mt-4">Quay lại chọn ghế</Link>
    </aside></div>}
  </div></main>;
}
