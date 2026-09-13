const authService = require('../services/authService');

class AuthController {
  // 1a. Bước 1 Đăng ký: Nhập thông tin & Gửi mã OTP tới Email
  async registerInit(req, res) {
    try {
      const { full_name, email, phone, password } = req.body;
      const result = await authService.registerInit({ full_name, email, phone, password });
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 1b. Bước 2 Đăng ký: Nhập OTP & Tạo tài khoản
  async verifyRegistrationOtp(req, res) {
    try {
      const { email, otp_code } = req.body;
      const result = await authService.verifyRegistrationOtp({ email, otp_code });
      res.status(201).json({
        success: true,
        message: 'Xác nhận OTP thành công. Tài khoản CGV của bạn đã được kích hoạt!',
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 1c. Đăng ký trực tiếp
  async register(req, res) {
    try {
      const { full_name, email, phone, password } = req.body;
      if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin' });
      }

      const result = await authService.register({ full_name, email, phone, password });
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 2. Đăng nhập Email & Mật khẩu
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
      }

      const result = await authService.login(email, password);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  // 3. Refresh Access Token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        message: 'Cấp mới Access Token thành công',
        data: result,
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  // 4. Đăng nhập / Đăng ký qua Google
  async googleAuth(req, res) {
    try {
      const { id_token, google_id, email, full_name, avatar_url } = req.body;
      if (!id_token && (!google_id || !email)) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp id_token hoặc thông tin Google hợp lệ' });
      }

      const result = await authService.googleAuth({ id_token, google_id, email, full_name, avatar_url });
      res.json({
        success: true,
        message: 'Đăng nhập bằng tài khoản Google thành công',
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 5. Quên mật khẩu: Gửi OTP
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email của bạn' });
      }

      const result = await authService.forgotPassword(email);
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 6. Đặt lại mật khẩu bằng OTP
  async resetPassword(req, res) {
    try {
      const { email, otp_code, new_password } = req.body;
      if (!email || !otp_code || !new_password) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, mã OTP và mật khẩu mới' });
      }

      const result = await authService.resetPassword({ email, otp_code, new_password });
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 7. Lấy thông tin cá nhân
  async getMe(req, res) {
    try {
      const user = await authService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 8. Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      if (!current_password || !new_password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
      }

      const result = await authService.changePassword({
        userId: req.user.id,
        current_password,
        new_password,
      });
      res.json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 9. Cập nhật profile
  async updateProfile(req, res) {
    try {
      const { full_name, phone, avatar_url } = req.body;
      const updatedUser = await authService.updateProfile({
        userId: req.user.id,
        full_name,
        phone,
        avatar_url,
      });
      res.json({ success: true, message: 'Cập nhật thông tin cá nhân thành công!', data: updatedUser });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
