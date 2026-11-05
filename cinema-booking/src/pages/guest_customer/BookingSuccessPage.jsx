import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import bookingApi from '../../api/bookingApi';
import { dataOf, errorMessage } from '../../utils/booking';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function BookingSuccessPage() {
  const [params] = useSearchParams();
  const code = params.get('bookingCode');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!code) return;
    let active = true;
    bookingApi.getBookingDetail(code).then(dataOf).then(data => { if (active) { setBooking(data); setError(''); } }).catch(e => { if (active) { setBooking(null); setError(errorMessage(e)); } });
    return () => { active = false; };
  }, [code, retry]);
  const current = booking?.bookingCode === code ? booking : null;
  const paid = ['PAID', 'CHECKED_IN'].includes(current?.status);
  const reserved = current?.status === 'PENDING_PAYMENT';
  return <main className="bg-[#121212] min-h-screen py-12 text-zinc-100"><div className="max-w-xl mx-auto bg-[#181818] border border-zinc-800 rounded-2xl p-8 shadow-xl">
    {!code ? <p role="alert">Thiếu mã đặt vé. Vui lòng kiểm tra Vé của tôi.</p> : error ? <p role="alert" className="text-red-400">{error} <button onClick={() => setRetry(v => v + 1)} className="underline">Thử lại</button></p> : !current ? <p role="status">Đang xác minh đặt vé…</p> : <><h1 className="text-2xl font-black">{reserved ? 'ĐÃ XÁC NHẬN ĐẶT CHỖ' : paid ? 'ĐÃ THANH TOÁN' : 'TRẠNG THÁI ĐẶT VÉ'}</h1>{reserved && <p className="text-amber-400 mt-3">Chưa thanh toán — vui lòng thanh toán tại quầy rạp.</p>}<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6 space-y-3"><p className="font-bold text-red-400">{current.bookingCode}</p><p className="text-sm text-zinc-400">{current.status}</p><h2 className="font-bold text-lg">{current.movieTitle}</h2><p>{current.cinemaName} · {current.hallName}</p><p>{formatDateTime(current.showtimeStart)}</p><p>Ghế: {current.seatNumbers?.join(', ')}</p><p className="text-lg font-bold">{reserved ? 'Cần thanh toán' : 'Tổng tiền'}: {formatCurrency(current.finalAmount)}</p>{reserved && current.expiresAt && <p className="text-sm text-amber-400">Hạn thanh toán: {formatDateTime(current.expiresAt)}</p>}</div>
      {paid && current.tickets?.filter(ticket => ticket.qrPayload && ['PAID', 'CHECKED_IN'].includes(ticket.status)).map(ticket => <div key={ticket.id} className="bg-white text-black rounded-lg p-4 mt-4 flex flex-col items-center"><QRCodeSVG value={ticket.qrPayload} size={150} /><p className="mt-2">{ticket.seatNumber} · {ticket.ticketCode}</p></div>)}<button onClick={() => setRetry(v => v + 1)} className="text-zinc-400 underline text-sm mt-5">Cập nhật trạng thái</button></>}
    <div className="flex gap-4 mt-8"><Link to="/my-tickets" className="bg-zinc-800 rounded-lg px-5 py-3 font-bold">VÉ CỦA TÔI</Link><Link to="/" className="bg-[#e71a0f] rounded-lg px-5 py-3 font-bold">VỀ TRANG CHỦ</Link></div>
  </div></main>;
}
