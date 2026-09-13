const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  /**
   * Tạo Nodemailer Transporter động dựa trên biến môi trường hiện tại
   */
  getTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      return null;
    }

    // Ưu tiên dùng service 'gmail' cho tương thích cao nhất với Google SMTP
    if (user.endsWith('@gmail.com') || (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail'))) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user.trim(),
          pass: pass.trim().replace(/\s+/g, ''), // Tự động xóa khoảng trắng trong App Password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Hoặc dùng SMTP custom với cấu hình Host & Port
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true cho port 465, false cho 587
      auth: {
        user: user.trim(),
        pass: pass.trim().replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // 1. Gửi mã OTP xác thực Đăng Ký Tài Khoản
  async sendRegistrationOtpEmail(toEmail, otpCode) {
    console.log(`\n======================================================`);
    console.log(`🔑 [MÃ OTP XÁC THỰC ĐĂNG KÝ CGV CINEMA]`);
    console.log(`Gửi tới Email: ${toEmail}`);
    console.log(`Mã OTP 6 chữ số: === ${otpCode} === (Hạn dùng: 10 phút)`);
    console.log(`======================================================\n`);

    const transporter = this.getTransporter();

    if (!transporter) {
      console.log('ℹ️ [Nodemailer] Chưa cấu hình SMTP_USER / SMTP_PASS trong file .env.');
      console.log('ℹ️ [Nodemailer] Mã OTP đã được in ra Terminal để kiểm thử.');
      return { success: true, simulated: true, message: 'OTP printed to server log (SMTP not configured)' };
    }

    try {
      const senderUser = process.env.SMTP_USER.trim();
      const mailOptions = {
        from: `"CGV Cinema Việt Nam" <${senderUser}>`, // Dùng chính Gmail đã xác thực để tránh bị Gmail chặn SPAM
        to: toEmail.trim(),
        subject: '[CGV Cinema] Mã Xác Thực Đăng Ký Tài Khoản Mới',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #121212; color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e71a0f; shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #e71a0f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 2px;">CGV CINEMA VIỆT NAM</h2>
              <p style="color: #888888; font-size: 12px; margin-top: 6px; text-transform: uppercase; tracking: 1px;">Xác thực địa chỉ Email kích hoạt tài khoản</p>
            </div>
            
            <p style="font-size: 14px; color: #e0e0e0;">Xin chào quý khách,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #cccccc;">Cảm ơn bạn đã lựa chọn dịch vụ tại <b>CGV Cinema</b>. Đây là mã xác thực OTP 6 chữ số để kích hoạt tài khoản thành viên của bạn:</p>
            
            <div style="background-color: #1a1a1a; text-align: center; padding: 22px; border-radius: 10px; margin: 24px 0; border: 1px dashed #e71a0f;">
              <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #e71a0f; font-family: monospace;">${otpCode}</span>
            </div>
            
            <p style="font-size: 13px; color: #999999; line-height: 1.5;">Mã OTP này có hiệu lực trong <b>10 phút</b>. Vui lòng tuyệt đối không chia sẻ mã này cho bất kỳ ai khác.</p>
            <hr style="border: 0; border-top: 1px solid #2a2a2a; margin: 24px 0;" />
            <p style="font-size: 11px; color: #666666; text-align: center; line-height: 1.4;">Trân trọng,<br/><b style="color: #888888;">Đội ngũ Hỗ Trợ Khách Hàng CGV Cinema</b></p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Nodemailer Success] Đã gửi mail OTP tới ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ [Nodemailer Error] Không thể gửi email OTP:', error.message);
      console.error('📋 [Nodemailer Error Detail]:', error);
      return { success: false, error: error.message };
    }
  }

  // 2. Gửi mã OTP Quên Mật Khẩu
  async sendOtpEmail(toEmail, otpCode) {
    console.log(`\n======================================================`);
    console.log(`🔑 [MÃ OTP QUÊN MẬT KHẨU CGV CINEMA]`);
    console.log(`Gửi tới: ${toEmail}`);
    console.log(`Mã OTP 6 chữ số: === ${otpCode} === (Hạn dùng: 10 phút)`);
    console.log(`======================================================\n`);

    const transporter = this.getTransporter();

    if (!transporter) {
      console.log('ℹ️ [Nodemailer] Chưa cấu hình SMTP_USER / SMTP_PASS trong .env. Mã OTP đặt lại mật khẩu đã in ra console!');
      return { success: true, simulated: true };
    }

    try {
      const senderUser = process.env.SMTP_USER.trim();
      const mailOptions = {
        from: `"CGV Cinema Việt Nam" <${senderUser}>`,
        to: toEmail.trim(),
        subject: '[CGV Cinema] Mã Xác Nhận Khôi Phục Mật Khẩu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #121212; color: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e71a0f;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #e71a0f; margin: 0;">CGV CINEMA VIỆT NAM</h2>
              <p style="color: #888888; font-size: 12px; margin-top: 4px;">Mã xác thực khôi phục mật khẩu tài khoản</p>
            </div>
            <p style="font-size: 14px;">Xin chào,</p>
            <p style="font-size: 14px; line-height: 1.5;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản <b>${toEmail}</b> tại CGV Cinema.</p>
            <div style="background-color: #181818; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #e71a0f;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e71a0f; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="font-size: 13px; color: #aaaaaa;">Mã xác thực này có hiệu lực trong <b>10 phút</b> và chỉ sử dụng được 1 lần.</p>
            <hr style="border: 0; border-top: 1px solid #333333; margin: 20px 0;" />
            <p style="font-size: 11px; color: #666666; text-align: center;">Trân trọng,<br/>Đội ngũ Hỗ Trợ Khách Hàng CGV Cinema</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Nodemailer Success] Đã gửi OTP đặt lại mật khẩu tới ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ [Nodemailer Error] Lỗi gửi email OTP đặt lại mật khẩu:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
