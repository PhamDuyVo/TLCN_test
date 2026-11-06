# BÁO CÁO ĐỀ XUẤT & PHÂN TÍCH CÔNG NGHỆ SỬ DỤNG
## DỰ ÁN: HỆ THỐNG ĐẶT VÉ XEM PHIM TRỰC TUYẾN (CINEMA BOOKING SYSTEM)

---

### I. TỔNG QUAN VỀ KIẾN TRÚC HỆ THỐNG

Hệ thống Đặt vé Xem phim Trực tuyến được thiết kế theo kiến trúc **Client-Server hoàn toàn tách biệt (Decoupled Single Page Application - SPA Architecture)**. Frontend và Backend giao tiếp với nhau thông qua **RESTful APIs** chuẩn định dạng JSON và giao thức **WebSocket/STOMP** để xử lý các tính năng thời gian thực (Real-time seat locking / booking).

```
+-------------------------------------------------------------------+
|                        CLIENT LAYER (FRONTEND)                    |
|       React 19 + Vite + Tailwind CSS v4 + React Router v7         |
+-------------------------------------------------------------------+
                                  |
                                  | HTTP (REST API) / WebSocket
                                  v
+-------------------------------------------------------------------+
|                        BACKEND LAYER (JAVA)                       |
|           Java 17/21 LTS + Spring Boot 3.x Ecosystem               |
|                                                                   |
|   +------------------+   +------------------+   +--------------+  |
|   | Spring Security  |   | Spring Data JPA  |   | Spring Web   |  |
|   |   & JWT Auth     |   |   & Hibernate    |   |  & WebSocket |  |
|   +------------------+   +------------------+   +--------------+  |
+-------------------------------------------------------------------+
       |                       |                      |
       v                       v                      v
+--------------+       +---------------+      +------------------+
| MySQL RDBMS  |       | Cloudinary SDK|      | Gmail SMTP / OTP |
|  (Database)  |       | (Image Cloud) |      | (Email Service)  |
+--------------+       +---------------+      +------------------+
```

---

### II. CÔNG NGHỆ FRONTEND (REACT ECOSYSTEM)

Frontend đóng vai trò giao diện người dùng (Single Page Application - SPA), mang lại trải nghiệm mượt mà, phản hồi tức thì và tính tương tác cao khi người dùng duyệt phim, chọn suất chiếu, chọn ghế và thanh toán.

| Hạng mục | Công nghệ / Thư viện | Phiên bản | Mục đích & Vai trò trong dự án |
| :--- | :--- | :--- | :--- |
| **Core Framework** | **React** | 19.x | Thư viện tạo UI dạng component hóa, tái sử dụng cao, hiệu năng vượt trội với Virtual DOM. |
| **Build Tool** | **Vite** | 6.x / 8.x | Đóng gói mã nguồn, hỗ trợ HMR (Hot Module Replacement) siêu nhanh, tối ưu build production. |
| **Styling & UI** | **Tailwind CSS** | v4.x | Framework CSS Utility-first giúp xây dựng giao diện hiện đại, responsive, hỗ trợ Dark Mode và tùy chỉnh theme rạp phim dễ dàng. |
| **Icon Set** | **Lucide React** | Latest | Bộ icon vector phong phú, tối ưu dung lượng cho thanh điều hướng, nút bấm và trạng thái đặt vé. |
| **Routing** | **React Router DOM** | v7.x | Quản lý điều hướng client-side, phân quyền route (Public Route, Customer Route, Admin/Staff Route). |
| **Giao tiếp HTTP** | **Axios** | 1.x | Gửi request REST API, hỗ trợ Request/Response Interceptor tự động đính kèm Token JWT và xử lý lỗi tập trung. |
| **Xác thực Đăng nhập** | **@react-oauth/google** | 0.13.x | Đăng nhập nhanh bằng tài khoản Google (OAuth 2.0 Client), nâng cao trải nghiệm người dùng. |
| **Trực quan hóa Dữ liệu** | **Recharts** | 3.x | Vẽ biểu đồ doanh thu, số lượng vé bán ra, tỷ lệ lấp đầy phòng chiếu dành cho trang Quản trị (Admin Dashboard). |
| **Quét & Tạo Mã QR** | **html5-qrcode** & **qrcode.react** | Latest | - `qrcode.react`: Render mã QR chứa thông tin vé điện tử.<br>- `html5-qrcode`: Dành cho nhân viên rạp quét kiểm tra vé vào cổng. |
| **Thông báo (Toast)** | **React Toastify** | 11.x | Hiển thị thông báo phản hồi thao tác (thành công, thất bại, giữ ghế hết hạn) sinh động. |
| **Realtime Client** | **Socket.IO-Client** / **StompJS** | Latest | Đồng bộ trạng thái ghế đang chọn/đã đặt theo thời gian thực giữa các trình duyệt. |

---

### III. CÔNG NGHỆ BACKEND (JAVA SPRING BOOT ECOSYSTEM)

Chuyển đổi phần Backend từ Node.js sang **Java Spring Boot 3.x** giúp hệ thống đạt chuẩn doanh nghiệp (Enterprise-grade), đảm bảo tính toàn vẹn dữ liệu, xử lý giao dịch an toàn (ACID Transactions) và dễ dàng bảo trì mở rộng.

| Hạng mục | Công nghệ / Thư viện | Phiên bản | Mục đích & Vai trò trong dự án |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ Lập trình** | **Java** | **Java 17 / 21 LTS** | Ngôn ngữ hướng đối tượng tĩnh (Strongly Typed), tận dụng tính năng hiện đại: Record Classes, Pattern Matching, Sealed Classes và Virtual Threads. |
| **Core Framework** | **Spring Boot** | **3.2.x / 3.3.x** | Khung phát triển ứng dụng Java hàng đầu, đơn giản hóa cấu hình, tích hợp nhúng Tomcat Web Server. |
| **Build System** | **Apache Maven** (hoặc Gradle) | 3.x | Quản lý phụ thuộc (dependencies), tự động tải thư viện và đóng gói ứng dụng thành file Runnable JAR. |
| **Bảo mật & Xác thực** | **Spring Security 6** + **JWT (JJWT)** | 0.12.x | - Phân quyền chi tiết (ROLE_USER, ROLE_STAFF, ROLE_ADMIN).<br>- Xác thực Stateless qua JWT Token.<br>- Mã hóa mật khẩu an toàn bằng `BCryptPasswordEncoder`. |
| **ORM & Persistence** | **Spring Data JPA** (Hibernate) | 6.x | Ánh xạ đối tượng Java với bảng trong DB (ORM), tự động hóa các thao tác CRUD, hỗ trợ JPQL và Native Queries. |
| **Database Pool** | **HikariCP** | Default | Connection pooling hiệu năng cao nhất hiện nay, giảm latency khi kết nối CSDL. |
| **Dịch vụ Thời gian thực** | **Spring WebSocket** + **STOMP** | Default | Xử lý giữ ghế thời gian thực (Real-time seat hold), gửi sự kiện cập nhật sơ đồ ghế lập tức đến các client. |
| **Tác vụ Ẩn (Scheduled)** | **Spring Scheduling** | `@EnableScheduling` | Tự động hủy các đơn hàng/ghế giữ chưa thanh toán sau 5-10 phút; gửi email nhắc lịch xem phim trước 2h. |
| **Gửi Mail & OTP** | **Spring Boot Starter Mail** | JavaMailSender | Tích hợp Gmail SMTP gửi mã OTP khôi phục mật khẩu, xác thực tài khoản và gửi Hóa đơn Vé điện tử. |
| **Lưu trữ Hình ảnh Cloud** | **Cloudinary Java SDK** | 1.x | Upload và quản lý link ảnh bìa phim, avatar người dùng, poster quảng cáo rạp lên hạ tầng Cloudinary. |
| **Tạo mã QR Vé** | **ZXing (Zebra Crossing)** | 3.5.x | Thư viện Java chuyên sinh hình ảnh QR Code tĩnh chứa thông tin xác thực vé. |
| **Validation** | **Jakarta Validation** | 3.x | Kiểm tra dữ liệu đầu vào DTO (`@NotNull`, `@NotBlank`, `@Email`, `@Size`,...) ngay tại Controller Layer. |
| **Tài liệu API** | **Springdoc OpenAPI 3** (Swagger UI) | 2.x | Tự động tạo trang tài liệu tương tác API (`/swagger-ui.html`) giúp Frontend dễ dàng tra cứu và test API. |
| **Mã sạch & Tiện ích** | **Lombok** | Latest | Tự động sinh Getter, Setter, Constructor, Builder pattern giúp viết code ngắn gọn. |

---

### IV. CƠ SỞ DỮ LIỆU & LƯU TRỮ (DATABASE & STORAGE)

1. **Hệ quản trị CSDL Quan hệ: MySQL 8.0+**
   - **Đặc tính**: CSDL quan hệ mạnh mẽ, tuân thủ thuộc tính ACID, phù hợp hoàn hảo cho hệ thống tài chính/đặt vé.
   - **Các thực thể chính trong hệ thống**:
     - `Users`: Lưu thông tin khách hàng, nhân viên, quản trị viên, thông tin OAuth Google.
     - `Movies`: Lưu danh sách phim, thời lượng, thể loại, đạo diễn, diễn viên, poster URL.
     - `Cinemas` & `CinemaHalls`: Quản lý danh sách rạp và phòng chiếu.
     - `Seats`: Quản lý sơ đồ ghế (Loại ghế: Thường, VIP, Sweetbox; Trạng thái: Đang trống, Đã đặt, Đang giữ).
     - `Showtimes`: Quản lý suất chiếu (Phim, Phòng, Thời gian bắt đầu/kết thúc, Giá vé cơ bản).
     - `Bookings` & `Tickets`: Lưu thông tin đơn đặt vé, danh sách ghế chọn, tổng tiền, mã QR.
     - `Payments`: Lưu lịch sử giao dịch thanh toán (Mã giao dịch, Phương thức: VNPay/MoMo/ZaloPay/Tiền mặt, Trạng thái).
     - `Promotions`: Quản lý mã giảm giá.

2. **Dịch vụ Lưu trữ Đa phương tiện: Cloudinary CDN**
   - Lưu trữ toàn bộ hình ảnh tĩnh có dung lượng lớn (Poster phim, ảnh phòng chiếu, avatar).
   - Tối ưu hóa tốc độ tải trang nhờ mạng phân phối nội dung (CDN) toàn cầu.

---

### V. ĐÁNH GIÁ & LÝ DO LỰA CHỌN STACK CÔNG NGHỆ (REACT + JAVA SPRING BOOT)

#### 1. Sự kết hợp giữa ReactJS và Java Spring Boot
- **Tách biệt hoàn toàn nhiệm vụ (Separation of Concerns)**: Frontend chuyên trách trải nghiệm UI/UX, Backend tập trung vào nghiệp vụ (Business Logic) và Bảo mật.
- **Tính khả thi & Tốc độ phát triển**: Đội ngũ phát triển Frontend có thể phát triển độc lập song song với Backend dựa trên hợp đồng API (Swagger/OpenAPI).

#### 2. Lợi ích vượt trội khi chuyển đổi Backend từ Node.js sang Java Spring Boot
- **Kiểm soát Kiểu dữ liệu chặt chẽ (Strong Typing)**: Java giúp phát hiện lỗi ngay ở bước compile, hạn chế tối đa Runtime Exception so với JavaScript/Node.js.
- **Quản lý Giao dịch & Khóa đồng thời (Transaction & Locking Management)**:
  - Dự án đặt vé xem phim có bài toán kinh điển: **Nhiều người cùng đúp chuột chọn 1 ghế tại 1 thời điểm**.
  - Java Spring Boot kết hợp với `@Transactional` và JPA Locking (Pessimistic/Optimistic Locking) xử lý tranh chấp dữ liệu (Race Condition) cực kỳ vững chắc và chuẩn xác.
- **Bảo mật chuẩn Doanh nghiệp (Enterprise Security)**: Spring Security là chuẩn mực hàng đầu về bảo mật web, dễ dàng cấu hình phòng chống CSRF, CORS, XSS, Rate Limiting.
- **Bảo trì & Mở rộng dài hạn**: Cấu trúc Layered Architecture (Controller -> Service -> Repository -> Entity) của Spring Boot giúp dự án dễ đọc, dễ unit test và mở rộng sau này.

---

### VI. NGUYÊN LÝ GIAO TIẾP GIỮA FRONTEND & BACKEND

1. **Luồng Xác thực & Phân quyền (Authentication Flow)**:
   - User đăng nhập (Email/Pass hoặc Google OAuth) -> Backend Java kiểm tra -> Sinh chuỗi **JWT Access Token**.
   - Client React lưu Token vào `localStorage` / `sessionStorage` -> Gửi đính kèm header `Authorization: Bearer <token>` trong mỗi request Axios.

2. **Luồng Đặt vé & Giữ ghế thời gian thực (Booking & Realtime Seat Lock Flow)**:
   - Khi chọn ghế: Client gửi sự kiện qua **WebSocket STOMP** -> Spring Boot nhận và khóa tạm ghế trong Redis / DB memory trong 5 phút.
   - Sự kiện "Ghế đang được chọn" phát (broadcast) tới tất cả người dùng khác đang xem cùng suất chiếu đó.
   - Khi thanh toán thành công: Spring Boot cập nhật trạng thái đơn thành `CONFIRMED`, sinh mã QR code với ZXing, lưu DB và gửi vé điện tử qua Email.

---

### VII. KẾT LUẬN

Việc lựa chọn **ReactJS** cho Frontend và **Java Spring Boot 3** cho Backend cùng hệ quản trị CSDL **MySQL** tạo nên một stack công nghệ **mạnh mẽ, an toàn, chuẩn hóa doanh nghiệp và cực kỳ phù hợp cho dự án Hệ thống Đặt vé Xem phim Trực tuyến**. Cấu trúc này không chỉ đáp ứng xuất sắc các yêu cầu hiện tại mà còn sẵn sàng cho việc mở rộng quy mô (Scalability) trong tương lai.
