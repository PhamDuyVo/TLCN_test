-- =====================================================================
-- CSDL HỆ THỐNG BÁN VÉ XEM PHIM (Nhóm 5 - TLCN)
-- Bám sát: Chương 2 - Yêu cầu chức năng (8 nhóm) & phi chức năng
-- Actor: Guest, Customer, Staff, Admin
-- Cách dùng: MySQL Workbench > Database > Reverse Engineer > chọn file này
--            để tự động sinh EER Diagram (ERD)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS movie_ticket_system_fixed1
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_ticket_system_fixed1;

-- ---------------------------------------------------------------------
-- NHÓM 1: TÀI KHOẢN & PHÂN QUYỀN (mục 2.1 - Nhóm 1)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name         VARCHAR(100)  NOT NULL,
    email             VARCHAR(150)  NOT NULL UNIQUE,
    phone             VARCHAR(20)   UNIQUE,
    password_hash     VARCHAR(255)  NOT NULL COMMENT 'Băm bằng BCrypt (yêu cầu bảo mật)',
    role              ENUM('customer','staff','admin') NOT NULL DEFAULT 'customer',
    cinema_id         INT UNSIGNED NULL COMMENT 'Rạp làm việc, chỉ áp dụng cho role=staff',
    status            ENUM('active','locked') NOT NULL DEFAULT 'active',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_staff_cinema CHECK (role != 'staff' OR cinema_id IS NOT NULL)
    -- Lưu ý: CHECK constraint chỉ được MySQL enforce thực sự từ bản 8.0.16 trở lên.
) ENGINE=InnoDB;

-- FK tới cinemas được thêm sau vì bảng cinemas khai báo ở phần dưới
CREATE TABLE password_resets (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(150) NOT NULL,
    otp_code       VARCHAR(6) NOT NULL,
    attempt_count  TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Khống chế tối đa 3 lần thử (UC-G06)',
    expires_at     DATETIME NOT NULL,
    is_used        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_otp (email, otp_code, is_used)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NHÓM 2: QUẢN LÝ PHIM
-- ---------------------------------------------------------------------
CREATE TABLE genres (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE COMMENT 'Thể loại phim'
) ENGINE=InnoDB;

CREATE TABLE movies (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    duration_minutes  SMALLINT UNSIGNED NOT NULL,
    director          VARCHAR(150),
    cast_names        TEXT COMMENT 'Danh sách diễn viên',
    release_date      DATE,
    age_rating        VARCHAR(10) COMMENT 'P, T13, T16, T18, C...',
    poster_url        VARCHAR(500),
    trailer_url       VARCHAR(500),
    status            ENUM('coming_soon','now_showing','ended') NOT NULL DEFAULT 'coming_soon',
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE movie_genres (
    movie_id   BIGINT UNSIGNED NOT NULL,
    genre_id   INT UNSIGNED NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NHÓM 3: QUẢN LÝ RẠP, PHÒNG CHIẾU, GHẾ
-- ---------------------------------------------------------------------
CREATE TABLE cinemas (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    address     VARCHAR(300) NOT NULL,
    city        VARCHAR(100),
    phone       VARCHAR(20),
    status      ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;

ALTER TABLE users
    -- RESTRICT (không phải SET NULL): không cho xóa rạp khi vẫn còn nhân viên
    -- thuộc rạp đó, để không xung đột với chk_staff_cinema (Admin phải chuyển
    -- nhân viên sang rạp khác hoặc khóa tài khoản trước khi xóa rạp) - lỗi 3823.
    ADD CONSTRAINT fk_users_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE RESTRICT;

CREATE TABLE rooms (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cinema_id   INT UNSIGNED NOT NULL,
    name        VARCHAR(50) NOT NULL COMMENT 'VD: Phòng 1, Phòng IMAX',
    room_type   VARCHAR(30) DEFAULT '2D' COMMENT '2D, 3D, IMAX...',
    total_seats SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE seat_types (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(50) NOT NULL COMMENT 'Ghế thường, VIP, Ghế đôi...',
    price_extra   DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Phụ thu so với giá vé cơ bản'
) ENGINE=InnoDB;

CREATE TABLE seats (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id       INT UNSIGNED NOT NULL,
    seat_type_id  INT UNSIGNED NOT NULL,
    row_label     VARCHAR(2)  NOT NULL COMMENT 'A, B, C...',
    seat_number   SMALLINT UNSIGNED NOT NULL,
    status        ENUM('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Khóa/mở ghế (mục 3.5)',
    UNIQUE KEY uq_room_seat (room_id, row_label, seat_number),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_type_id) REFERENCES seat_types(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NHÓM 4: QUẢN LÝ SUẤT CHIẾU
-- ---------------------------------------------------------------------
CREATE TABLE showtimes (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    movie_id     BIGINT UNSIGNED NOT NULL,
    room_id      INT UNSIGNED NOT NULL,
    start_time   DATETIME NOT NULL,
    end_time     DATETIME NOT NULL,
    base_price   DECIMAL(10,2) NOT NULL COMMENT 'Giá vé cơ bản của suất chiếu',
    screen_format VARCHAR(30) NOT NULL DEFAULT '2D' COMMENT 'Định dạng chiếu: 2D, 3D, 2D Phụ đề, 3D Lồng tiếng... (UC-A02)',
    status       ENUM('scheduled','ongoing','ended','cancelled') NOT NULL DEFAULT 'scheduled',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    INDEX idx_showtime_room_time (room_id, start_time)
    -- Lưu ý: việc kiểm tra trùng lịch (mục 4.5 / UC-A02) cần xử lý ở tầng ứng dụng/service,
    -- MySQL không hỗ trợ ràng buộc "no overlap" trực tiếp bằng CHECK constraint.
) ENGINE=InnoDB;

-- Trạng thái ghế theo TỪNG suất chiếu (phục vụ đặt vé realtime - mục 5.2-5.4)
CREATE TABLE showtime_seats (
    id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    showtime_id      BIGINT UNSIGNED NOT NULL,
    seat_id          BIGINT UNSIGNED NOT NULL,
    status           ENUM('available','held','booked') NOT NULL DEFAULT 'available',
    held_by_user_id  BIGINT UNSIGNED NULL COMMENT 'Ai đang tạm giữ ghế',
    hold_expires_at  DATETIME NULL COMMENT 'Hết hạn giữ ghế -> tự nhả (mục 5.4, 6.5)',
    UNIQUE KEY uq_showtime_seat (showtime_id, seat_id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (held_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NHÓM 8: KHUYẾN MÃI (đặt trước vì bookings sẽ tham chiếu tới)
-- ---------------------------------------------------------------------
CREATE TABLE promotions (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code               VARCHAR(30) NOT NULL UNIQUE,
    description         VARCHAR(255),
    discount_type      ENUM('percent','amount') NOT NULL,
    discount_value     DECIMAL(10,2) NOT NULL,
    min_order_amount   DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) NULL,
    start_date         DATETIME NOT NULL,
    end_date           DATETIME NOT NULL,
    usage_limit        INT UNSIGNED NULL COMMENT 'NULL = không giới hạn',
    used_count         INT UNSIGNED NOT NULL DEFAULT 0,
    status             ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;

-- Combo bắp nước
CREATE TABLE combos (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(255),
    price         DECIMAL(10,2) NOT NULL,
    is_available  BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Còn bán / tạm hết - KHÔNG quản lý tồn kho (đúng phạm vi Out of scope)',
    image_url     VARCHAR(500),
    status        ENUM('active','inactive') NOT NULL DEFAULT 'active'
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NHÓM 5 & 6: ĐẶT VÉ + THANH TOÁN
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
    id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_code          VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã đơn hàng hiển thị cho khách',
    customer_id           BIGINT UNSIGNED NULL COMMENT 'NULL nếu khách vãng lai mua tại quầy',
    guest_name            VARCHAR(100) NULL COMMENT 'Tên khách vãng lai (bán tại POS)',
    guest_phone           VARCHAR(20) NULL,
    guest_email           VARCHAR(150) NULL,
    showtime_id           BIGINT UNSIGNED NOT NULL,
    sale_channel          ENUM('online','pos') NOT NULL DEFAULT 'online',
    created_by_staff_id   BIGINT UNSIGNED NULL COMMENT 'Nhân viên tạo đơn nếu bán tại quầy (POS)',
    promotion_id          INT UNSIGNED NULL,
    seat_amount           DECIMAL(10,2) NOT NULL DEFAULT 0,
    combo_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
    status                ENUM('pending_payment','paid','cancelled','expired') NOT NULL DEFAULT 'pending_payment',
    created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at            DATETIME NULL COMMENT 'Hạn thanh toán trước khi tự hủy (mục 6.5)',
    paid_at               DATETIME NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
    FOREIGN KEY (created_by_staff_id) REFERENCES users(id),
    -- Xóa cứng chỉ nên cho phép khi used_count = 0 (xử lý ở backend); UC-A06 "xóa/khóa"
    -- nên hiểu là khóa mềm qua status='inactive' để giữ vết báo cáo doanh thu (Nhóm 7).
    -- ON DELETE SET NULL chỉ là lớp phòng vệ, không phải cách xóa khuyến mãi chính thức.
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    -- Online bắt buộc có tài khoản hoặc SĐT; POS tiền mặt được phép để trống
    CONSTRAINT chk_booking_contact CHECK (
        sale_channel = 'pos' OR customer_id IS NOT NULL OR guest_phone IS NOT NULL
    )
) ENGINE=InnoDB;

-- Ghế trong đơn = vé điện tử (mỗi ghế = 1 vé có QR riêng, mục 5.7)
CREATE TABLE booking_seats (
    id                     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id             BIGINT UNSIGNED NOT NULL,
    seat_id                BIGINT UNSIGNED NOT NULL,
    showtime_id            BIGINT UNSIGNED NOT NULL COMMENT 'Suất chiếu THỰC TẾ của vé này (có thể khác bookings.showtime_id sau khi đổi suất - UC-S09)',
    price                  DECIMAL(10,2) NOT NULL,
    qr_code                VARCHAR(64) NOT NULL UNIQUE COMMENT 'Token ngắn (UUID/hex) để máy quét đọc nhanh <1s',
    ticket_status          ENUM('valid','used','cancelled','exchanged') NOT NULL DEFAULT 'valid',
    original_ticket_id     BIGINT UNSIGNED NULL COMMENT 'Trỏ về vé bị thay thế khi đổi ghế/đổi suất (UC-S09)',
    checked_in_at          DATETIME NULL,
    checked_in_by_staff_id BIGINT UNSIGNED NULL COMMENT 'NV soát vé (QR Check-in)',
    -- Cột sinh tự động: chỉ có giá trị khi vé còn hiệu lực (valid/used), NULL khi
    -- cancelled/exchanged. MySQL cho phép nhiều NULL trong UNIQUE index, nên cột này
    -- mô phỏng "partial unique index" - đảm bảo 1 ghế/suất chiếu chỉ có tối đa 1 vé
    -- CÒN HIỆU LỰC tại persistence layer, nhưng vẫn cho phép rebook sau khi hủy/đổi vé.
    active_showtime_seat VARCHAR(40) GENERATED ALWAYS AS (
        CASE WHEN ticket_status IN ('valid','used')
             THEN CONCAT(showtime_id, '-', seat_id) ELSE NULL END
    ) STORED,
    UNIQUE KEY uq_active_showtime_seat (active_showtime_seat),
    UNIQUE KEY uq_booking_seat_showtime (booking_id, seat_id, showtime_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
    FOREIGN KEY (original_ticket_id) REFERENCES booking_seats(id),
    FOREIGN KEY (checked_in_by_staff_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE booking_combos (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT UNSIGNED NOT NULL,
    combo_id    INT UNSIGNED NOT NULL,
    quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    unit_price  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (combo_id) REFERENCES combos(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id        BIGINT UNSIGNED NOT NULL,
    method            ENUM('vnpay','momo','cash','pos_card') NOT NULL,
    payment_type      ENUM('initial','exchange_fee','refund') NOT NULL DEFAULT 'initial' COMMENT 'Phân biệt tiền vé gốc / phí đổi vé (UC-S09) / hoàn tiền',
    amount            DECIMAL(10,2) NOT NULL,
    status            ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
    transaction_code  VARCHAR(100) COMMENT 'Mã giao dịch trả về từ VNPay/MoMo',
    paid_at           DATETIME NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- INDEX TỐI ƯU HIỆU NĂNG (đáp ứng yêu cầu phi chức năng: API < 1.5s)
-- ---------------------------------------------------------------------
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_showtimes_movie_time ON showtimes(movie_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id, created_at);
CREATE INDEX idx_bookings_guest_phone ON bookings(guest_phone) COMMENT 'Tra cứu vé bằng SĐT khách vãng lai (UC-S08)';
CREATE INDEX idx_bookings_status_paid ON bookings(status, paid_at) COMMENT 'Thống kê doanh thu theo ngày/tháng dựa trên thời điểm thanh toán thực tế (UC-A07), không dùng created_at';
CREATE INDEX idx_showtime_seats_status ON showtime_seats(showtime_id, status);
-- Không cần thêm index riêng cho booking_seats.qr_code vì cột đã UNIQUE
-- -> MySQL tự tạo index ngầm cho ràng buộc UNIQUE này.

-- =====================================================================
-- GHI CHÚ THIẾT KẾ (đối chiếu yêu cầu phi chức năng - mục 2.2):
-- 1. Chống bán trùng ghế: cặp (showtime_id, seat_id) là UNIQUE trong
--    showtime_seats -> tại 1 thời điểm 1 ghế/suất chiếu chỉ có 1 dòng
--    trạng thái, kết hợp transaction + lock ở tầng backend khi giữ ghế.
-- 2. Đồng bộ realtime: showtime_seats.status là nguồn dữ liệu để
--    backend bắn sự kiện WebSocket/STOMP cho các client đang xem
--    cùng suất chiếu.
-- 3. Bảo mật: users.password_hash lưu BCrypt hash, không lưu mật khẩu gốc.
-- 4. QR vé: booking_seats.qr_code là UNIQUE, nên sinh bằng token ngẫu
--    nhiên/ký số (không dùng số thứ tự dễ đoán) để chống giả mạo.
-- =====================================================================