import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Ticket, Download, Home, Calendar, MapPin } from 'lucide-react';

export const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const mockBookingCode = 'CGV-2026-889922';
  const qrPayload = JSON.stringify({ ticketCode: mockBookingCode, showtimeId: 102, seats: ['F5', 'F6'] });

  return (
    <div className="w-full bg-[#121212] py-12 text-zinc-100 min-h-screen flex justify-center items-center">
      <div className="max-w-xl w-full mx-4 bg-[#181818] border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-white tracking-wide">ĐẶT VÉ THÀNH CÔNG!</h1>
        <p className="text-xs text-zinc-400 mt-1">Cảm ơn bạn đã lựa chọn dịch vụ bán vé xem phim CGV Cinema.</p>

        {/* E-Ticket Card Layout */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left relative">
          <div className="flex justify-between items-start border-b border-zinc-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">MÃ ĐƠN VÉ:</span>
              <span className="text-lg font-black text-red-500 tracking-widest">{mockBookingCode}</span>
            </div>
            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
              ĐÃ THANH TOÁN
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-300 mb-6">
            <h3 className="font-black text-white text-base">AVATAR: DÒNG DÒNG NƯỚC</h3>
            <p className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> CGV Aeon Tân Phú • Phòng 2 (IMAX)
            </p>
            <p className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-red-500" /> 13:15 - Ngày 10/09/2026
            </p>
            <p className="font-bold text-white mt-1">
              Ghế: <span className="text-red-400 font-extrabold text-sm">F5, F6</span> (VIP)
            </p>
          </div>

          {/* QR Code Container for QR Check-in */}
          <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center w-fit mx-auto border-2 border-zinc-700 shadow-md">
            <QRCodeSVG value={qrPayload} size={150} level="H" />
            <span className="text-[10px] text-black font-bold tracking-widest mt-2">XUẤT TRÌNH KHI VÀO RẠP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg border border-zinc-600 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Ticket className="w-4 h-4" /> VÉ CỦA TÔI
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition cursor-pointer"
          >
            <Home className="w-4 h-4" /> VỀ TRANG CHỦ
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
