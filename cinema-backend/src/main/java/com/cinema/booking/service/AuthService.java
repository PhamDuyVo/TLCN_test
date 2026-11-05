package com.cinema.booking.service;

import com.cinema.booking.dto.AuthDtos.*;
import com.cinema.booking.entity.PasswordReset;
import com.cinema.booking.entity.User;
import com.cinema.booking.repository.PasswordResetRepository;
import com.cinema.booking.repository.UserRepository;
import com.cinema.booking.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final com.cinema.booking.security.GoogleTokenVerifier googleTokenVerifier;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    @Transactional
    public void registerInit(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được sử dụng, vui lòng chọn email khác.");
        }

        String otp = generateOtp();
        PasswordReset pr = PasswordReset.builder()
                .email(request.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .attemptCount(0)
                .build();
        passwordResetRepository.save(pr);

        emailService.sendOtpEmail(request.getEmail(), otp, "Đăng ký tài khoản");
    }

    @Transactional
    public AuthResponse verifyRegistrationOtp(RegisterRequest request, String otpCode) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email này đã được đăng ký.");
        }

        PasswordReset pr = passwordResetRepository.findTopByEmailAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(request.getEmail(), otpCode)
                .orElseThrow(() -> new IllegalArgumentException("Mã OTP không chính xác hoặc đã hết hạn."));

        if (pr.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết thời hạn 5 phút. Vui lòng yêu cầu mã mới.");
        }

        pr.setIsUsed(true);
        passwordResetRepository.save(pr);

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được đăng ký.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        return generateAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không chính xác."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Email hoặc mật khẩu không chính xác.");
        }

        if (user.getStatus() == User.UserStatus.LOCKED) {
            throw new IllegalArgumentException("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        String verifiedEmail = googleTokenVerifier.verify(request.getToken());

        User user = userRepository.findByEmail(verifiedEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName("Người dùng Google")
                    .email(verifiedEmail)
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(User.UserRole.CUSTOMER)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(newUser);
        });

        if (user.getStatus() == User.UserStatus.LOCKED) {
            throw new IllegalArgumentException("Tài khoản đã bị tạm khóa.");
        }

        return generateAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Refresh token không hợp lệ hoặc đã hết hạn.");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new org.springframework.security.authentication.BadCredentialsException("Account unavailable");
        }
        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống."));

        String otp = generateOtp();
        PasswordReset pr = PasswordReset.builder()
                .email(user.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();
        passwordResetRepository.save(pr);

        emailService.sendOtpEmail(user.getEmail(), otp, "Khôi phục mật khẩu");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordReset pr = passwordResetRepository.findTopByEmailAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(request.getEmail(), request.getOtpCode())
                .orElseThrow(() -> new IllegalArgumentException("Mã OTP không hợp lệ."));

        if (pr.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        pr.setIsUsed(true);
        passwordResetRepository.save(pr);
    }

    public UserDto getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        return mapToUserDto(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));

        user.setFullName(request.getFullName());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        user = userRepository.save(user);
        return mapToUserDto(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserDto(user))
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
