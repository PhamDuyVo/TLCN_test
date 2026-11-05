package com.cinema.booking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.mail.from:${spring.mail.username:}}")
    private String fromAddress;

    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("[UTE Cinema] Mã xác thực OTP");
            message.setText("Xin chào,\n\nMã OTP xác thực của bạn cho mục đích [" + purpose + "] là: " + otpCode +
                    "\nMã có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ UTE Cinema.");
            mailSender.send(message);
            log.info("OTP email sent");
        } catch (Exception e) {
            log.error("OTP email delivery failed");
            throw new IllegalStateException("Không thể gửi mã OTP. Vui lòng thử lại sau.");
        }
    }

    @Async
    public void sendTicketEmail(String toEmail, String bookingCode, String movieTitle, String showtimeInfo, String seatNumbers, String totalAmount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("[UTE Cinema] Xác nhận đặt vé thành công - Mã đơn: " + bookingCode);
            message.setText("Chúc mừng bạn đã đặt vé xem phim thành công tại UTE Cinema!\n\n" +
                    "• Mã đơn hàng: " + bookingCode + "\n" +
                    "• Tên phim: " + movieTitle + "\n" +
                    "• Suất chiếu: " + showtimeInfo + "\n" +
                    "• Vị trí ghế: " + seatNumbers + "\n" +
                    "• Tổng thanh toán: " + totalAmount + " VNĐ\n\n" +
                    "Vui lòng xuất trình mã đơn hàng hoặc mã QR trên ứng dụng khi đến rạp để nhận vé vào phòng chiếu.\n\n" +
                    "Chúc bạn có trải nghiệm xem phim vui vẻ!");
            mailSender.send(message);
            log.info("Đã gửi email vé điện tử đơn {} tới {}", bookingCode, toEmail);
        } catch (Exception e) {
            log.error("Ticket email delivery failed");
        }
    }
}
