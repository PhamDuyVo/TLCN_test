import { useState } from 'react';
import { useLocation, useNavigate } from 'react';
import { formatCurrency } from '../../utils/format';
import { CreditCard, QrCode, CheckCircle, Tag, ShoppingBag, ArrowRight } from 'lucide-react';

const MOCK_COMBOS = [
  { id: 1, name: 'UTE Combo 1', desc: '1 Bắp ngọt (L) + 1 Nước ngọt (L)', price: 89000 },
  { id: 2, name: 'UTE Couple Combo', desc: '1 Bắp lớn (L) + 2 Nước ngọt (L)', price: 119000 },
  { id: 3, name: 'UTE Family Snack', desc: '1 Bắp phô mai + 2 Nước + 1 Snack Khoai', price: 149000 },
];

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats = [{ id: 'F5', price: 110000 }, { id: 'F6', price: 110000 }], totalPrice = 220000 } = location.state || {};

  const [comboQuantities, setComboQuantities] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  const updateCombo = (id, delta) => {
    setComboQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const comboTotal = MOCK_COMBOS.reduce((sum, c) => sum + (comboQuantities[c.id] || 0) * c.price, 0);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'BANMOI50') {
      setDiscountAmount(50000);
      alert('Áp dụng mã giảm giá BANMOI50 thành công (-50.000 ₫)');
    } else {
      alert('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const finalTotal = Math.max(0, totalPrice + comboTotal - discountAmount);

  return (
    <div className="w-full bg-[#121212] py-10 text-zinc-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-black text-white mb-6 border-b border-zinc-800 pb-4">
          XÁC NHẬN ĐƠN HÀNG & THANH TOÁN
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Section: Combos & Voucher & Payment Method (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Combo Bắp Nước Selection */}
            <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-amber-400 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" /> DỊCH VỤ ĐÍNH KÈM / COMBO BẮP NƯỚC
              </h2>
              <div className="space-y-4">
                {MOCK_COMBOS.map((combo) => {
                  const qty = comboQuantities[combo.id] || 0;
                  return (
                    <div
                      key={combo.id}
                      className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-bold text-white text-sm">{combo.name}</h3>
                        <p className="text-xs text-zinc-400">{combo.desc}</p>
                        <span className="text-xs font-bold text-amber-400 mt-1 block">
                          {formatCurrency(combo.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                        <button
                          onClick={() => updateCombo(combo.id, -1)}
                          className="w-6 h-6 bg-zinc-700 hover:bg-zinc-600 rounded text-white font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-white w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateCombo(combo.id, 1)}
                          className="w-6 h-6 bg-[#e71a0f] hover:bg-[#c41200] rounded text-white font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Voucher & Discount Code */}
            <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-500" /> MÃ GIẢM GIÁ / VOUCHER
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá (VD: BANMOI50)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg border border-zinc-600 cursor-pointer"
                >
                  ÁP DỤNG
                </button>
              </div>
            </div>

            {/* 3. Payment Method Selection */}
            <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-500" /> CHỌN PHƯƠNG THỨC THANH TOÁN
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'vnpay', name: 'Cổng thanh toán VNPay (Quét mã VietQR / ATM)', desc: 'Thanh toán tức thì qua ứng dụng ngân hàng' },
                  { id: 'momo', name: 'Ví Điện Tử MoMo', desc: 'Thanh toán qua ứng dụng Ví MoMo' },
                  { id: 'card', name: 'Thẻ Quốc Tế (Visa, MasterCard, JCB)', desc: 'Thanh toán qua cổng thẻ bảo mật SSL' },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                      paymentMethod === item.id
                        ? 'bg-red-950/40 border-[#e71a0f]'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === item.id}
                      onChange={() => {}}
                      className="mt-1 accent-[#e71a0f]"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Right: Summary & Checkout Button (1 col) */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 mb-4">
              CHI TIẾT ĐƠN HÀNG
            </h2>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Phim:</span>
                <span className="font-bold text-white">Avatar 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Rạp:</span>
                <span>UTE Cinema Thủ Đức</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Suất chiếu:</span>
                <span>13:15 - 10/09/2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Ghế đã chọn:</span>
                <span className="font-bold text-red-500">
                  {selectedSeats.map((s) => s.id).join(', ')}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-3">
                <span className="text-zinc-500">Tiền vé:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              {comboTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tiền bắp nước:</span>
                  <span>{formatCurrency(comboTotal)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá (Voucher):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 my-6 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-400">TỔNG THANH TOÁN:</span>
              <span className="text-2xl font-black text-[#e71a0f]">{formatCurrency(finalTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/booking-success')}
              className="w-full py-3.5 bg-[#e71a0f] hover:bg-[#c41200] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition cursor-pointer"
            >
              THANH TOÁN NGAY <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
