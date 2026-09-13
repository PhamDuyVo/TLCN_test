const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');
const { OAuth2Client } = require('google-auth-library');

const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  // 1a. Bước 1 Đăng ký: Kiểm tra thông tin & Gửi mã OTP xác thực tới Email
  async registerInit({ full_name, email, phone, password }) {
    if (!email || !password || !full_name) {
      throw new Error('Vui lòng điền đầy đủ Họ và tên, Email và Mật khẩu!');
    }

    // Kiểm tra Email hoặc Số điện thoại đã tồn tại trong CSDL chưa
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone != "" AND phone = ?)',
      [email, phone || '']
    );
    if (existing.length > 0) {
      throw new Error('Địa chỉ Email hoặc Số điện thoại này đã được đăng ký tài khoản!');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Sinh mã OTP 6 chữ số
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // Hạn 10 phút

    const registrationData = JSON.stringify({
      full_name,
      email,
      phone: phone || null,
      password_hash,
    });

    // Vô hiệu hóa các OTP đăng ký chưa dùng cũ của Email này
    await db.query('UPDATE email_verifications SET is_used = 1 WHERE email = ? AND is_used = 0', [email]);

    // Lưu vào bảng email_verifications
    await db.query(
      'INSERT INTO email_verifications (email, otp_code, registration_data, expires_at, is_used, attempt_count) VALUES (?, ?, ?, ?, 0, 0)',
      [email, otp_code, registrationData, expires_at]
    );

    // Gửi Email chứa OTP
    await emailService.sendRegistrationOtpEmail(email, otp_code);

    return {
      message: 'Mã xác thực OTP đã được gửi tới Email của bạn. Vui lòng nhập mã để hoàn tất đăng ký!',
      email,
      expires_in_minutes: 10,
    };
  }

  // 1b. Bước 2 Đăng ký: Xác thực mã OTP & Tạo tài khoản chính thức vào CSDL
  async verifyRegistrationOtp({ email, otp_code }) {
    if (!email || !otp_code) {
      throw new Error('Vui lòng cung cấp Email và mã OTP xác thực!');
    }

    const [verifications] = await db.query(
      'SELECT * FROM email_verifications WHERE email = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (verifications.length === 0) {
      throw new Error('Yêu cầu xác thực OTP không tồn tại hoặc đã được sử dụng!');
    }

    const ver = verifications[0];

    // Kiểm tra hết hạn
    if (new Date() > new Date(ver.expires_at)) {
      throw new Error('Mã OTP đã hết hạn (chỉ có hiệu lực trong 10 phút). Vui lòng yêu cầu gửi lại mã mới!');
    }

    // Kiểm tra số lần thử sai
    if (ver.attempt_count >= 3) {
      await db.query('UPDATE email_verifications SET is_used = 1 WHERE id = ?', [ver.id]);
      throw new Error('Bạn đã nhập sai mã OTP quá 3 lần. Mã này đã bị hủy, vui lòng đăng ký lại!');
    }

    // Kiểm tra mã OTP
    if (ver.otp_code !== otp_code.trim()) {
      await db.query('UPDATE email_verifications SET attempt_count = attempt_count + 1 WHERE id = ?', [ver.id]);
      throw new Error(`Mã OTP không chính xác! (Còn ${2 - ver.attempt_count} lần thử)`);
    }

    // Mã OTP hợp lệ -> parse dữ liệu và tạo người dùng trong CSDL
    let regData;
    try {
      regData = typeof ver.registration_data === 'string' ? JSON.parse(ver.registration_data) : ver.registration_data;
    } catch (e) {
      throw new Error('Dữ liệu đăng ký không hợp lệ!');
    }

    // Double check email chưa bị trùng
    const [existingCheck] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingCheck.length > 0) {
      await db.query('UPDATE email_verifications SET is_used = 1 WHERE id = ?', [ver.id]);
      throw new Error('Email này đã được đăng ký trước đó!');
    }

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, status, is_email_verified) VALUES (?, ?, ?, ?, "customer", "active", 1)',
      [regData.full_name, regData.email, regData.phone || null, regData.password_hash]
    );

    const newUserId = result.insertId;

    // Đánh dấu OTP đã dùng
    await db.query('UPDATE email_verifications SET is_used = 1 WHERE id = ?', [ver.id]);

    // Tạo JWT Access Token & Refresh Token
    const token = jwt.sign(
      { id: newUserId, role: 'customer', email: regData.email },
      process.env.JWT_SECRET || 'cinema_booking_super_secret_jwt_key_2026',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: newUserId, role: 'customer' },
      process.env.JWT_REFRESH_SECRET || 'cinema_booking_super_secret_refresh_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: newUserId,
        full_name: regData.full_name,
        email: regData.email,
        phone: regData.phone,
        role: 'customer',
        status: 'active',
        is_email_verified: 1,
      },
      token,
      refreshToken,
    };
  }

  // 1c. Đăng ký trực tiếp (fallback)
  async register({ full_name, email, phone, password }) {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone != "" AND phone = ?)',
      [email, phone || '']
    );
    if (existing.length > 0) {
      throw new Error('Email hoặc số điện thoại đã được đăng ký!');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role, status, is_email_verified) VALUES (?, ?, ?, ?, "customer", "active", 1)',
      [full_name, email, phone || null, password_hash]
    );

    const newUserId = result.insertId;

    const token = jwt.sign(
      { id: newUserId, role: 'customer', email },
      process.env.JWT_SECRET || 'cinema_booking_super_secret_jwt_key_2026',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: newUserId, role: 'customer' },
      process.env.JWT_REFRESH_SECRET || 'cinema_booking_super_secret_refresh_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return {
      user: { id: newUserId, full_name, email, phone, role: 'customer', status: 'active', is_email_verified: 1 },
      token,
      refreshToken,
    };
  }

  // 2. Đăng nhập truyền thống bằng Email & Mật khẩu
  async login(email, password) {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    const user = users[0];

    if (user.status !== 'active') {
      throw new Error('Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động!');
    }

    if (!user.password_hash) {
      throw new Error('Tài khoản này được đăng ký qua Google. Vui lòng chọn "Đăng nhập bằng Google"!');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác!');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, cinema_id: user.cinema_id },
      process.env.JWT_SECRET || 'cinema_booking_super_secret_jwt_key_2026',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'cinema_booking_super_secret_refresh_jwt_key_2026',
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    return { user, token, refreshToken };
  }

  // 3. Refresh Token cấp mới Access Token
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Vui lòng cung cấp Refresh Token!');
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'cinema_booking_super_secret_refresh_jwt_key_2026'
      );

      const [users] = await db.query('SELECT id, role, email, status, cinema_id FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0 || users[0].status !== 'active') {
        throw new Error('Tài khoản không khả dụng!');
      }

      const user = users[0];
      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role, email: user.email, cinema_id: user.cinema_id },
        process.env.JWT_SECRET || 'cinema_booking_super_secret_jwt_key_2026',
        { expiresIn: '1d' }
      );

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new Error('Refresh Token không hợp lệ hoặc đã hết hạn!');
    }
  }

  // 4. Đăng nhập / Đăng ký qua Google Account (Hỗ trợ OIDC id_token & Profile Direct)
  async googleAuth({ id_token, google_id, email, full_name, avatar_url }) {
    let finalGoogleId = google_id;
    let finalEmail = email;
    let finalFullName = full_name;
    let finalAvatarUrl = avatar_url;

    // Bước 1: Kiểm tra & Verify id_token qua google-auth-library nếu có
    if (id_token) {
      try {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: id_token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
          // Bắt buộc Email từ Google đã được xác thực chính chủ
          if (payload.email_verified === false) {
            throw new Error('Địa chỉ Email Google chưa được xác minh, không thể sử dụng để đăng nhập!');
          }

          finalGoogleId = payload.sub || finalGoogleId;
          finalEmail = payload.email || finalEmail;
          finalFullName = payload.name || finalFullName;
          finalAvatarUrl = payload.picture || finalAvatarUrl;
        }
      } catch (err) {
        if (err.message.includes('xác minh')) {
          throw err;
        }
        console.warn('⚠️ Google id_token verification skipped/fallback:', err.message);
      }
    }

    if (!finalGoogleId || !finalEmail) {
      throw new Error('Thông tin xác thực Google không đầy đủ!');
    }

    let user;

    // Bước 2a: Tìm kiếm theo google_id trước (Ưu tiên người dùng đã từng đăng nhập Google)
    const [usersByGoogleId] = await db.query('SELECT * FROM users WHERE google_id = ?', [finalGoogleId]);

    if (usersByGoogleId.length > 0) {
      user = usersByGoogleId[0];
    } else {
      // Bước 2b: Chưa có google_id -> Tìm kiếm theo email để thực hiện Auto-Linking
      const [usersByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [finalEmail]);

      if (usersByEmail.length > 0) {
        user = usersByEmail[0];
        // Tự động liên kết tài khoản mật khẩu hiện tại với google_id mới
        await db.query(
          'UPDATE users SET google_id = ?, is_email_verified = 1, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
          [finalGoogleId, finalAvatarUrl || null, user.id]
        );
        user.google_id = finalGoogleId;
        user.is_email_verified = 1;
      } else {
        // Bước 2c: Người dùng hoàn toàn mới -> Tự động tạo tài khoản Google mới
        const dummyPassword = Math.random().toString(36).slice(-10) + '!A';
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(dummyPassword, salt);

        const [result] = await db.query(
          'INSERT INTO users (full_name, email, password_hash, role, status, google_id, is_email_verified, avatar_url) VALUES (?, ?, ?, "customer", "active", ?, 1, ?)',
          [finalFullName || 'Khách hàng Google', finalEmail, password_hash, finalGoogleId, finalAvatarUrl || null]
        );

        const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUsers[0];
      }
    }

    if (user.status !== 'active') {
      throw new Error('Tài khoản của bạn đã bị khóa!');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, cinema_id: user.cinema_id },
      process.env.JWT_SECRET || 'cinema_booking_super_secret_jwt_key_2026',
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'cinema_booking_super_secret_refresh_jwt_key_2026',
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    return { user, token, refreshToken };
  }

  // 5. Quên mật khẩu: Sinh mã OTP và gửi về Email
  async forgotPassword(email) {
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      throw new Error('Email này chưa được đăng ký trong hệ thống!');
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await db.query('UPDATE password_resets SET is_used = 1 WHERE email = ? AND is_used = 0', [email]);

    await db.query(
      'INSERT INTO password_resets (email, otp_code, expires_at, is_used, attempt_count) VALUES (?, ?, ?, 0, 0)',
      [email, otp_code, expires_at]
    );

    await emailService.sendOtpEmail(email, otp_code);

    return {
      message: 'Mã xác thực OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!',
      expires_in_minutes: 10,
    };
  }

  // 6. Xác thực OTP & Đổi mật khẩu mới
  async resetPassword({ email, otp_code, new_password }) {
    const [resets] = await db.query(
      'SELECT * FROM password_resets WHERE email = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (resets.length === 0) {
      throw new Error('Yêu cầu khôi phục mật khẩu không tồn tại hoặc đã được sử dụng!');
    }

    const resetReq = resets[0];

    if (new Date() > new Date(resetReq.expires_at)) {
      throw new Error('Mã OTP đã hết hạn (chỉ có hiệu lực trong 10 phút). Vui lòng yêu cầu mã mới!');
    }

    if (resetReq.attempt_count >= 3) {
      await db.query('UPDATE password_resets SET is_used = 1 WHERE id = ?', [resetReq.id]);
      throw new Error('Bạn đã nhập sai OTP quá 3 lần. Mã OTP này đã bị vô hiệu hóa!');
    }

    if (resetReq.otp_code !== otp_code.trim()) {
      await db.query('UPDATE password_resets SET attempt_count = attempt_count + 1 WHERE id = ?', [resetReq.id]);
      throw new Error(`Mã OTP không chính xác! (Còn ${2 - resetReq.attempt_count} lần thử)`);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [password_hash, email]);
    await db.query('UPDATE password_resets SET is_used = 1 WHERE id = ?', [resetReq.id]);

    return { message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.' };
  }

  // 7. Lấy thông tin tài khoản hiện tại
  async getUserById(id) {
    const [users] = await db.query(
      'SELECT id, full_name, email, phone, role, cinema_id, status, is_email_verified, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  // 8. Đổi mật khẩu người dùng (trong trang cá nhân)
  async changePassword({ userId, current_password, new_password }) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      throw new Error('Người dùng không tồn tại!');
    }

    const user = users[0];
    if (!user.password_hash) {
      throw new Error('Tài khoản này đăng nhập bằng Google, không có mật khẩu trực tiếp!');
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không chính xác!');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    return { message: 'Đổi mật khẩu thành công!' };
  }

  // 9. Cập nhật thông tin hồ sơ
  async updateProfile({ userId, full_name, phone, avatar_url }) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      throw new Error('Người dùng không tồn tại!');
    }

    if (phone) {
      const [existingPhone] = await db.query(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );
      if (existingPhone.length > 0) {
        throw new Error('Số điện thoại này đã được sử dụng bởi tài khoản khác!');
      }
    }

    await db.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [full_name || null, phone || null, avatar_url || null, userId]
    );

    return this.getUserById(userId);
  }
}

module.exports = new AuthService();
