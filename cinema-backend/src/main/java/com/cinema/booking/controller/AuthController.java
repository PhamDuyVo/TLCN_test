package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.AuthDtos.*;
import com.cinema.booking.security.UserPrincipal;
import com.cinema.booking.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-init")
    public ResponseEntity<ApiResponse<String>> registerInit(@Valid @RequestBody RegisterRequest request) {
        authService.registerInit(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP xác thực đã được gửi về email của bạn."));
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyRegistrationOtp(@Valid @RequestBody VerifyRegistrationRequest request) {
        AuthResponse response = authService.verifyRegistrationOtp(request, request.getOtpCode());
        return ResponseEntity.ok(ApiResponse.success("Đăng ký tài khoản thành công!", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        // Legacy route starts the same OTP flow; it must not bypass email verification.
        authService.registerInit(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP xác thực đã được gửi về email của bạn."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.googleAuth(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công!", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP khôi phục đã được gửi về email của bạn."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa xác thực"));
        }
        UserDto userDto = authService.getMe(currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@AuthenticationPrincipal UserPrincipal currentUser,
                                                              @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        UserDto updated = authService.updateProfile(currentUser.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công!", updated));
    }
}
