import { Film, Phone, Mail, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-[#1f1f1f] text-zinc-400 text-xs mt-auto">
      {/* 1. Cinema Screen Format Badges Bar */}
      <div className="bg-[#121212] border-b border-[#1f1f1f] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 font-black text-sm tracking-wider text-zinc-500">
          <span className="hover:text-red-500 cursor-pointer transition">IMAX 3D</span>
          <span>•</span>
          <span className="hover:text-red-500 cursor-pointer transition">4DX</span>
          <span>•</span>
          <span className="hover:text-red-500 cursor-pointer transition">STARIUM</span>
          <span>•</span>
          <span className="hover:text-red-500 cursor-pointer transition">GOLD CLASS</span>
          <span>•</span>
          <span className="hover:text-red-500 cursor-pointer transition">L'AMOUR</span>
          <span>•</span>
          <span className="hover:text-red-500 cursor-pointer transition">SWEETBOX</span>
        </div>
      </div>

      {/* 2. Footer Info Columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-sm text-zinc-200 uppercase mb-3 text-red-500">Giới thiệu CGV Cinema</h4>
          <ul className="space-y-2 text-zinc-400">
            <li><a href="#" className="hover:text-white">Về Chúng Tôi</a></li>
            <li><a href="#" className="hover:text-white">Hệ Thống Rạp Chiếu</a></li>
            <li><a href="#" className="hover:text-white">Tuyển Dụng Nhân Viên</a></li>
            <li><a href="#" className="hover:text-white">Liên Hệ Quảng Cáo</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-zinc-200 uppercase mb-3 text-red-500">Quy Định & Điều Khoản</h4>
          <ul className="space-y-2 text-zinc-400">
            <li><a href="#" className="hover:text-white">Điều Khoản Chung</a></li>
            <li><a href="#" className="hover:text-white">Điều Khoản Giao Dịch</a></li>
            <li><a href="#" className="hover:text-white">Chính Sách Thanh Toán</a></li>
            <li><a href="#" className="hover:text-white">Chính Sách Bảo Mật</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-zinc-200 uppercase mb-3 text-red-500">Hỗ Trợ Khách Hàng</h4>
          <div className="space-y-2 text-zinc-400">
            <p className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Phone className="w-4 h-4 text-red-500" /> Hotline: 1900 6017
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" /> hoidap@cgv.vn
            </p>
            <p className="text-zinc-500 text-[11px] mt-2">Giờ làm việc: 8:00 - 22:00 (Tất cả các ngày)</p>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-zinc-200 uppercase mb-3 text-red-500">Bảo Mật & Chứng Nhận</h4>
          <div className="flex items-center gap-2 text-zinc-400 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Thanh toán an toàn 100% qua MoMo & VNPay</span>
          </div>
          <p className="text-zinc-500 text-[11px]">
            Hệ thống bán vé trực tuyến chuẩn mã hóa SSL/TLS & Mã hóa vé QR điện tử chống làm giả.
          </p>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="bg-[#050505] border-t border-[#181818] py-4 text-center text-zinc-600 text-[11px]">
        <p>© 2026 CGV Cinema System - Đồ án Tốt nghiệp Nhóm 5. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;
