import { useState } from 'react';
import { useParams, useNavigate } from 'react';
import { Calendar, Clock, Film, Play, Ticket, MapPin, Tag } from 'lucide-react';

export const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2026-09-10');
  const [selectedCinema, setSelectedCinema] = useState('cgv_tan_phu');
  const [activeTab, setActiveTab] = useState('showtimes');

  // MOCK dữ liệu suất chiếu theo rạp chuẩn CGV
  const MOCK_SHOWTIMES = [
    { id: 101, time: '10:30', room: 'Phòng 1', screen_format: '2D Phụ đề', price: 90000 },
    { id: 102, time: '13:15', room: 'Phòng 2 (IMAX)', screen_format: 'IMAX 3D', price: 150000 },
    { id: 103, time: '16:00', room: 'Phòng 1', screen_format: '2D Phụ đề', price: 90000 },
    { id: 104, time: '19:30', room: 'Phòng 3', screen_format: '2D Phụ đề', price: 110000 },
    { id: 105, time: '21:45', room: 'Phòng 4', screen_format: '2D Lồng tiếng', price: 90000 },
  ];

  return (
    <div className="w-full bg-[#121212] py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* 1. Top Breadcrumb & Movie Header Banner */}
        <div className="bg-[#181818] rounded-xl p-6 md:p-8 border border-zinc-800 flex flex-col md:flex-row gap-8 shadow-xl">
          {/* Movie Poster */}
          <div className="w-full md:w-72 aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg bg-zinc-900 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
              alt="Movie Poster"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#e71a0f] text-white font-black text-xs px-2.5 py-1 rounded shadow">
              C13
            </div>
          </div>

          {/* Movie Detail Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-red-950/80 text-red-400 border border-red-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  ĐANG CHIẾU
                </span>
                <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-2.5 py-0.5 rounded border border-zinc-700">
                  IMAX 3D / 2D
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">
                AVATAR: DÒNG DÒNG NƯỚC (AVATAR 3)
              </h1>
              <p className="text-zinc-400 text-xs italic mt-1">Avatar: The Way of Water - Pandora Next Chapter</p>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-6 text-xs text-zinc-300 border-y border-zinc-800 py-4">
                <p><span className="text-zinc-500 font-medium">Đạo diễn:</span> James Cameron</p>
                <p><span className="text-zinc-500 font-medium">Diễn viên:</span> Sam Worthington, Zoe Saldana</p>
                <p><span className="text-zinc-500 font-medium">Thể loại:</span> Hành Động, Khoa Học Viễn Tưởng</p>
                <p><span className="text-zinc-500 font-medium">Thời lượng:</span> 192 phút</p>
                <p><span className="text-zinc-500 font-medium">Khởi chiếu:</span> 10/09/2026</p>
                <p><span className="text-zinc-500 font-medium">Ngôn ngữ:</span> Tiếng Anh - Phụ đề Tiếng Việt</p>
              </div>

              <div className="mt-4 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/40 p-3 rounded">
                ⚠️ <strong>Quy định độ tuổi C13:</strong> Phim dành cho khán giả từ đủ 13 tuổi trở lên. Rạp sẽ kiểm tra giấy tờ tùy thân khi check-in.
              </div>
            </div>

            {/* Quick Navigation Anchor Button */}
            <div className="mt-6 flex gap-4">
              <a
                href="#showtimes-section"
                className="bg-[#e71a0f] hover:bg-[#c41200] text-white px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-900/40 transition cursor-pointer"
              >
                <Ticket className="w-4 h-4" /> MUA VÉ NGAY
              </a>
              <button
                onClick={() => setActiveTab('trailer')}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-5 py-3 rounded-md font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 text-red-500 fill-red-500" /> Xem Trailer
              </button>
            </div>
          </div>
        </div>

        {/* 2. Ribbon Tab Bar: Suất Chiếu & Chi Tiết Nội Dung */}
        <div id="showtimes-section" className="mt-12">
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              onClick={() => setActiveTab('showtimes')}
              className={`px-8 py-3 font-extrabold text-sm border-b-2 transition cursor-pointer ${
                activeTab === 'showtimes'
                  ? 'border-[#e71a0f] text-[#e71a0f]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              LỊCH CHIẾU & ĐẶT VÉ
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={`px-8 py-3 font-extrabold text-sm border-b-2 transition cursor-pointer ${
                activeTab === 'description'
                  ? 'border-[#e71a0f] text-[#e71a0f]'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              NỘI DUNG PHIM
            </button>
          </div>

          {activeTab === 'showtimes' && (
            <div className="bg-[#181818] rounded-xl p-6 border border-zinc-800">
              {/* Date Selection Horizontal Scroll Bar */}
              <h3 className="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-500" /> CHỌN NGÀY CHIẾU:
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
                {[
                  { date: '2026-09-10', day: 'Hôm nay', num: '10/09' },
                  { date: '2026-09-11', day: 'Thứ 6', num: '11/09' },
                  { date: '2026-09-12', day: 'Thứ 7', num: '12/09' },
                  { date: '2026-09-13', day: 'Chủ Nhật', num: '13/09' },
                  { date: '2026-09-14', day: 'Thứ 2', num: '14/09' },
                ].map((item) => (
                  <button
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={`flex flex-col items-center justify-center min-w-[90px] py-2.5 rounded-lg border text-xs transition cursor-pointer ${
                      selectedDate === item.date
                        ? 'bg-[#e71a0f] border-[#e71a0f] text-white font-bold shadow-md shadow-red-950/50'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] opacity-80">{item.day}</span>
                    <span className="text-sm font-black mt-0.5">{item.num}</span>
                  </button>
                ))}
              </div>

              {/* Cinema Filter & Showtime List */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-sm font-bold text-zinc-300 uppercase mb-4 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" /> CỤM RẠP CGV HỒ CHÍ MINH:
                </h3>
                <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h4 className="font-bold text-white text-base">CGV Aeon Tân Phú</h4>
                    <span className="text-xs text-zinc-400">30 Bờ Bao Tân Thắng, Q.Tân Phú</span>
                  </div>

                  {/* Showtimes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {MOCK_SHOWTIMES.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => navigate(`/booking/${st.id}`)}
                        className="bg-zinc-900 hover:bg-[#e71a0f] text-zinc-200 hover:text-white border border-zinc-700 hover:border-[#e71a0f] p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition duration-200 group cursor-pointer shadow-sm"
                      >
                        <span className="text-base font-black text-white group-hover:scale-105 transition">
                          {st.time}
                        </span>
                        <span className="text-[11px] text-zinc-400 group-hover:text-red-100">
                          {st.room}
                        </span>
                        <span className="text-[10px] text-amber-400 group-hover:text-white font-semibold mt-1">
                          {st.price.toLocaleString()} ₫
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="bg-[#181818] rounded-xl p-6 border border-zinc-800 text-zinc-300 text-sm leading-relaxed">
              <h3 className="text-lg font-bold text-white mb-3">Tóm Tắt Nội Dung Phim</h3>
              <p className="mb-4">
                Trở lại với Pandora sau hơn một thập kỷ, phần tiếp theo tiếp tục câu chuyện về gia đình Sully (Jake, Neytiri và các con của họ), những rắc rối theo chân họ, những nỗ lực giữ an toàn cho nhau, những trận chiến đấu sinh tồn và những bi kịch mà họ phải chịu đựng.
              </p>
              <p>
                Bộ phim hứa hẹn mang lại trải nghiệm thị giác bùng nổ với công nghệ quay phim 3D dưới nước độc quyền của đạo diễn James Cameron.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
