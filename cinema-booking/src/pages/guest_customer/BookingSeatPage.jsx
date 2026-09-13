import { useState } from 'react';
import { useParams, useNavigate } from 'react';
import useCountdown from '../../hooks/useCountdown';
import { formatCurrency } from '../../utils/format';
import { Clock, ShieldAlert, ArrowRight } from 'lucide-react';

// Giả lập ma trận 8 hàng x 10 cột ghế phòng chiếu UTE Cinema
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

export const BookingSeatPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { formattedTime } = useCountdown(300); // 5 phút đếm ngược
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock trạng thái một số ghế đã bán
  const BOOKED_SEATS = ['C5', 'C6', 'D4', 'D5'];

  const toggleSeat = (seatId, price) => {
    if (BOOKED_SEATS.includes(seatId)) return;

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seatId);
      if (exists) {
        return prev.filter((s) => s.id !== seatId);
      } else {
        if (prev.length >= 8) {
          alert('Tối đa chỉ được chọn 8 ghế trong một lần đặt!');
          return prev;
        }
        return [...prev, { id: seatId, price }];
      }
    });
  };

  const getSeatTypeAndPrice = (row) => {
    if (row === 'H') return { type: 'Ghế Đôi', price: 160000, color: 'border-pink-500 hover:bg-pink-900/40' };
    if (['E', 'F', 'G'].includes(row)) return { type: 'VIP', price: 110000, color: 'border-amber-500 hover:bg-amber-900/40' };
    return { type: 'Thường', price: 90000, color: 'border-zinc-600 hover:bg-zinc-700' };
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="w-full bg-[#121212] py-8 text-zinc-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* 1. Showtime Details & Timer Bar */}
        <div className="bg-[#181818] border border-zinc-800 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white">AVATAR: DÒNG DÒNG NƯỚC</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              UTE Cinema Thủ Đức • Phòng 2 (IMAX) • 13:15, 10/09/2026
            </p>
          </div>

          <div className="flex items-center gap-3 bg-red-950/60 border border-red-900/60 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-red-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-red-300 font-bold uppercase">Thời gian giữ ghế:</span>
              <span className="text-lg font-black text-red-400 tracking-widest">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. Seat Map Container (Left 2 cols) */}
          <div className="lg:col-span-2 bg-[#181818] border border-zinc-800 rounded-xl p-6 flex flex-col items-center">
            {/* Curved Screen Banner */}
            <div className="w-3/4 mb-12 text-center">
              <div className="h-2 bg-gradient-to-r from-zinc-700 via-zinc-300 to-zinc-700 rounded-full shadow-[0_10px_20px_rgba(255,255,255,0.2)]" />
              <p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mt-2">MÀN HÌNH CHIẾU</p>
            </div>

            {/* Seat Grid */}
            <div className="space-y-3 mb-8">
              {ROWS.map((row) => {
                const { price, color } = getSeatTypeAndPrice(row);
                return (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-zinc-500 text-xs text-center">{row}</span>
                    <div className="flex gap-2">
                      {COLS.map((col) => {
                        const seatId = `${row}${col}`;
                        const isBooked = BOOKED_SEATS.includes(seatId);
                        const isSelected = selectedSeats.some((s) => s.id === seatId);

                        let seatBg = 'bg-zinc-900 text-zinc-300 ' + color;
                        if (isBooked) seatBg = 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed';
                        if (isSelected) seatBg = 'bg-[#e71a0f] text-white border-[#e71a0f] shadow-md shadow-red-900/60 font-bold';

                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => toggleSeat(seatId, price)}
                            className={`w-8 h-8 rounded text-xs font-semibold border flex items-center justify-center transition cursor-pointer ${seatBg}`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seat Legend */}
            <div className="flex flex-wrap justify-center items-center gap-6 border-t border-zinc-800 pt-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-900 border border-zinc-600 rounded" />
                <span>Ghế thường</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-900 border border-amber-500 rounded" />
                <span>Ghế VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-900 border border-pink-500 rounded" />
                <span>Ghế đôi (Couple)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#e71a0f] rounded" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-800 rounded opacity-60" />
                <span>Đã bán</span>
              </div>
            </div>
          </div>

          {/* 3. Booking Summary Sidebar (Right 1 col) */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6 flex flex-col justify-between h-fit">
            <div>
              <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 mb-4">THÔNG TIN ĐẶT VÉ</h2>
              <div className="space-y-3 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tên phim:</span>
                  <span className="font-semibold text-white">Avatar 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rạp chiếu:</span>
                  <span>UTE Cinema Thủ Đức</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Suất chiếu:</span>
                  <span>13:15 - 10/09/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ghế đã chọn:</span>
                  <span className="font-bold text-red-500">
                    {selectedSeats.length > 0 ? selectedSeats.map((s) => s.id).join(', ') : 'Chưa chọn'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-800 my-6 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-400">TỔNG TIỀN TẠM TÍNH:</span>
                <span className="text-2xl font-black text-[#e71a0f]">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/checkout', { state: { selectedSeats, totalPrice } })}
              className={`w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-[#e71a0f] hover:bg-[#c41200] text-white shadow-lg shadow-red-900/50'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              TIẾP TỤC BƯỚC THANH TOÁN <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSeatPage;
