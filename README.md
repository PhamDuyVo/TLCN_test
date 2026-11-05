# HỆ THỐNG BÁN VÉ XEM PHIM (TLCN - ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM)

Dự án được xây dựng theo đúng chuẩn thiết kế trong Báo cáo Tiểu luận Chuyên ngành (Nhóm 5):
- **Phân hệ Frontend:** React.js (Vite, TailwindCSS, React Router v7, Axios, Lucide Icons).
- **Phân hệ Backend:** Java Spring Boot 3 (Java 21 LTS, Spring Security 6, JWT, Spring Data JPA, Hibernate, WebSocket STOMP, Mail, MySQL).
- **Cơ sở dữ liệu:** MySQL 8.0 (19 bảng chuẩn hóa theo ERD).

---

## 📁 Cấu trúc thư mục dự án

```text
TLCN_test/
├── cinema-booking/             # Phân hệ Frontend (React + Vite)
│   ├── src/
│   │   ├── api/                # Cấu hình gọi API sang Backend
│   │   ├── components/         # Các UI components
│   │   ├── pages/              # Các trang giao diện (Khách hàng & Admin)
│   │   └── ...
│   ├── .env.example             # Frontend environment variable template
│   └── package.json
│
├── cinema-backend/             # Phân hệ Backend (Java Spring Boot 3)
│   ├── src/main/java/com/cinema/booking/
│   │   ├── config/             # SecurityConfig, CorsConfig
│   │   ├── controller/         # Auth, Movie, Showtime, Booking, Admin, Promo, Combo
│   │   ├── dto/                # Request & Response DTOs
│   │   ├── entity/             # 19 JPA Entities ánh xạ CSDL
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Token Provider & Filter
│   │   └── service/            # Business Logic Services
│   ├── src/main/resources/
│   │   └── application.yml     # Cấu hình port 5000, MySQL, JWT, Mail, VNPay
│   └── pom.xml
│
├── database/                   # File kịch bản CSDL MySQL
│   └── schema_and_seed.sql     # Script tạo 19 bảng và nạp dữ liệu mẫu
│
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Khởi tạo Cơ sở Dữ liệu (MySQL)
1. Mở **MySQL Workbench** hoặc **Navicat / DBeaver / Command Line**.
2. Mở file `database/schema_and_seed.sql` và thực thi (Execute).
3. Cơ sở dữ liệu `movie_ticket_system_fixed1` với 19 bảng và đầy đủ dữ liệu mẫu (phim, rạp, phòng chiếu, ghế, suất chiếu, combo) sẽ được tự động tạo.

### 2. Chạy Backend (Java Spring Boot)
1. Sao chép `cinema-backend/.env.example` thành `cinema-backend/.env.local`.
2. Điền thông tin MySQL và các dịch vụ cần thiết vào `.env.local`.
3. Chạy backend:

```bash
cd cinema-backend
mvn spring-boot:run
```
* Backend sẽ chạy tại: `http://localhost:5000/api`
* Kiểm tra API tài liệu / dữ liệu phim: `http://localhost:5000/api/movies`

### 3. Chạy Frontend (React.js)
```bash
cd cinema-booking
copy .env.example .env
npm install
npm run dev
```
* Giao diện người dùng sẽ chạy tại: `http://localhost:5173`
* Tự động kết nối tới Backend tại port `5000`.
