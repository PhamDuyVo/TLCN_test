import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle, AlertTriangle, Search, Printer, Ticket, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const StaffLoginPage = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-zinc-100">
    <div className="max-w-md w-full bg-[#141414] border border-zinc-800 rounded-xl p-8 shadow-2xl">
      <div className="text-center mb-6">
        <span className="bg-[#e71a0f] text-white font-black text-2xl px-3 py-1 rounded inline-block">CGV</span>
        <h1 className="text-xl font-bold text-white mt-3">ĐĂNG NHẬP CA TRỰC NHÂN VIÊN</h1>
        <p className="text-xs text-zinc-400 mt-1">Cổng POS & Soát vé QR dành cho Nhân viên tại rạp</p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1">MÃ NHÂN VIÊN / EMAIL</label>
          <input
            type="text"
            placeholder="VD: staff01@cgv.vn"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1">MẬT KHẨU</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <button
          type="button"
          onClick={() => (window.location.href = '/staff/pos')}
          className="w-full py-3 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-900/50 transition cursor-pointer"
        >
          VÀO CA LÀM VIỆC
        </button>
      </form>
    </div>
  </div>
);

export const PosBookingPage = () => {
  const [selectedSeats, setSelectedSeats] = useState(['C3', 'C4']);
  const seatPrice = 110000;
  const totalPrice = selectedSeats.length * seatPrice;

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="flex justify-between items-center bg-[#141414] border border-zinc-800 p-4 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-500" /> POS BÁN VÉ TRỰC TIẾP TẠI QUẦY
          </h1>
          <p className="text-xs text-zinc-400">Ca làm việc: Sáng (Quầy 02 - CGV Aeon Tân Phú)</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4" /> In Vé Giấy Nhiệt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POS Showtime & Seat Selection */}
        <div className="lg:col-span-2 bg-[#141414] border border-zinc-800 rounded-xl p-6">
          <h2 className="text-sm font-bold text-zinc-300 uppercase mb-4">1. Chọn Phim & Suất Chiếu</h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-zinc-900 border border-red-500 p-3 rounded-lg text-xs cursor-pointer">
              <span className="font-bold text-white block">Avatar 3</span>
              <span className="text-zinc-400">13:15 • Phòng 2</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg text-xs cursor-pointer opacity-70">
              <span className="font-bold text-white block">Quận 9</span>
              <span className="text-zinc-400">14:00 • Phòng 1</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg text-xs cursor-pointer opacity-70">
              <span className="font-bold text-white block">Hoàng Tử Dải Ngân Hà</span>
              <span className="text-zinc-400">15:30 • Phòng 3</span>
            </div>
          </div>

          <h2 className="text-sm font-bold text-zinc-300 uppercase mb-4">2. Sơ Đồ Ghế POS</h2>
          <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 text-center">
            <div className="w-1/2 mx-auto bg-zinc-700 h-1 rounded-full mb-6" />
            <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
              {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((seat) => (
                <button
                  key={seat}
                  onClick={() =>
                    setSelectedSeats((prev) =>
                      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
                    )
                  }
                  className={`py-2 rounded text-xs font-bold border cursor-pointer ${
                    selectedSeats.includes(seat)
                      ? 'bg-[#e71a0f] border-[#e71a0f] text-white'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* POS Payment Calculation */}
        <div className="bg-[#141414] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3 mb-4">TỔNG HÓA ĐƠN POS</h2>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span>Ghế chọn:</span>
                <span className="font-bold text-red-400">{selectedSeats.join(', ')}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-3">
                <span className="font-bold text-zinc-400">Tổng tiền thu:</span>
                <span className="text-xl font-black text-red-500">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert('Thanh toán POS thành công! Lệnh in vé đã được gửi tới máy in nhiệt.')}
            className="w-full py-3.5 bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-sm rounded-lg shadow-lg cursor-pointer"
          >
            XÁC NHẬN NHẬN TIỀN & IN VÉ
          </button>
        </div>
      </div>
    </div>
  );
};

export const QrCheckInPage = () => {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decodedText) => {
        setScanResult({ status: 'valid', code: decodedText, time: new Date().toLocaleTimeString() });
      },
      (error) => {}
    );

    return () => {
      scanner.clear().catch((e) => {});
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-zinc-100">
      <div className="bg-[#141414] border border-zinc-800 p-6 rounded-xl text-center">
        <h1 className="text-xl font-black text-white flex items-center justify-center gap-2 mb-2">
          <QrCode className="w-6 h-6 text-red-500" /> SOÁT VÉ QR (SPEED CHECK-IN &lt; 1s)
        </h1>
        <p className="text-xs text-zinc-400">Hướng camera về phía Mã QR trên màn hình điện thoại hoặc vé giấy của khách hàng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Scanner Container */}
        <div className="bg-[#141414] border border-zinc-800 p-6 rounded-xl flex flex-col items-center">
          <div id="reader" className="w-full max-w-sm overflow-hidden rounded-lg border border-zinc-700" />
        </div>

        {/* Verification Result Panel */}
        <div className="bg-[#141414] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase border-b border-zinc-800 pb-3 mb-4">
              KẾT QUẢ KIỂM TRA VÉ
            </h2>
            {scanResult ? (
              <div className="bg-emerald-950/60 border border-emerald-800 p-6 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <span className="bg-emerald-900 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded">
                  VÉ HỢP LỆ (CHECK-IN SUCCESS)
                </span>
                <h3 className="font-bold text-white text-base mt-3">Avatar: Dòng Dòng Nước</h3>
                <p className="text-xs text-zinc-300 mt-1">CGV Aeon Tân Phú • Phòng 2 (IMAX)</p>
                <p className="text-xs text-amber-400 font-bold mt-1">Ghế: F5, F6</p>
                <span className="text-[10px] text-zinc-500 mt-3 block">Thời gian: {scanResult.time}</span>
              </div>
            ) : (
              <div className="bg-zinc-900 p-8 rounded-xl text-center text-zinc-500">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Đang chờ quét mã QR...</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg border border-zinc-600 mt-4 cursor-pointer"
          >
            QUÉT VÉ TIẾP THEO
          </button>
        </div>
      </div>
    </div>
  );
};

export const TicketLookupPage = () => (
  <div className="max-w-4xl mx-auto space-y-6 text-zinc-100">
    <div className="bg-[#141414] border border-zinc-800 p-6 rounded-xl">
      <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-red-500" /> TRA CỨU VÉ KHÁCH HÀNG
      </h1>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Nhập Số điện thoại khách hàng / Mã đặt chỗ (Booking ID)..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
        />
        <button className="bg-[#e71a0f] hover:bg-[#c41200] text-white font-bold text-xs px-6 py-2.5 rounded-lg cursor-pointer">
          TÌM KIẾM
        </button>
      </div>
    </div>
  </div>
);
