package com.cinema.booking.service;

import com.cinema.booking.dto.AuthDtos.*;
import com.cinema.booking.entity.*;
import com.cinema.booking.repository.*;
import com.cinema.booking.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {
    UserRepository users = mock(UserRepository.class);
    PasswordResetRepository resets = mock(PasswordResetRepository.class);
    JwtTokenProvider tokens = mock(JwtTokenProvider.class);
    EmailService email = mock(EmailService.class);
    GoogleTokenVerifier google = mock(GoogleTokenVerifier.class);
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    AuthService auth = new AuthService(users, resets, encoder, tokens, email, google);
    User existing;
    @BeforeEach void setup() {
        existing = User.builder().id(7L).email("old@example.com").fullName("Existing")
                .passwordHash(encoder.encode("password")).role(User.UserRole.ADMIN).status(User.UserStatus.ACTIVE).build();
        when(users.findByEmail(existing.getEmail())).thenReturn(Optional.of(existing));
        when(tokens.generateAccessToken(anyString(), anyString())).thenReturn("access");
        when(tokens.generateRefreshToken(anyString())).thenReturn("refresh");
    }
    @Test void existingBcryptAccountLogsInWithoutRehashOrNewAccount() {
        var hash = existing.getPasswordHash();
        var result = auth.login(new LoginRequest(existing.getEmail(), "password"));
        assertEquals("access", result.getAccessToken());
        assertEquals("ADMIN", result.getUser().getRole());
        assertEquals(hash, existing.getPasswordHash());
        verify(users, never()).save(any());
        assertThrows(BadCredentialsException.class, () -> auth.login(new LoginRequest(existing.getEmail(), "wrong")));
    }
    @Test void lockedAccountCannotLoginOrRefresh() {
        existing.setStatus(User.UserStatus.LOCKED);
        assertThrows(IllegalArgumentException.class, () -> auth.login(new LoginRequest(existing.getEmail(), "password")));
        when(tokens.validateRefreshToken("refresh")).thenReturn(true);
        when(tokens.getEmailFromToken("refresh")).thenReturn(existing.getEmail());
        assertThrows(BadCredentialsException.class, () -> auth.refreshToken("refresh"));
    }
    @Test void registrationSendsOtpThenCreatesOnlyCustomerWithBcrypt() {
        var request = new RegisterRequest("New User", "new@example.com", "0123456789", "secret");
        auth.registerInit(request);
        verify(users, never()).save(any());
        verify(email).sendOtpEmail(eq(request.getEmail()), matches("[0-9]{6}"), anyString());
        var otp = PasswordReset.builder().email(request.getEmail()).otpCode("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5)).build();
        when(resets.findTopByEmailAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(request.getEmail(), "123456")).thenReturn(Optional.of(otp));
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
        var result = auth.verifyRegistrationOtp(request, "123456");
        assertTrue(otp.getIsUsed());
        assertEquals("CUSTOMER", result.getUser().getRole());
        var capture = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(users).save(capture.capture());
        assertTrue(encoder.matches("secret", capture.getValue().getPasswordHash()));
    }
    @Test void invalidOrExpiredOtpCannotCreateAccount() {
        var request = new RegisterRequest("New", "new@example.com", null, "secret");
        assertThrows(IllegalArgumentException.class, () -> auth.verifyRegistrationOtp(request, "000000"));
        var expired = PasswordReset.builder().expiresAt(LocalDateTime.now().minusMinutes(1)).build();
        when(resets.findTopByEmailAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(request.getEmail(), "123456")).thenReturn(Optional.of(expired));
        assertThrows(IllegalArgumentException.class, () -> auth.verifyRegistrationOtp(request, "123456"));
        verify(users, never()).save(any());
    }
    @Test void googleNeverTrustsRequestEmail() {
        when(google.verify("proof")).thenReturn(existing.getEmail());
        var result = auth.googleAuth(new GoogleAuthRequest("proof", "attacker@example.com", "Fake", null));
        assertEquals(existing.getEmail(), result.getUser().getEmail());
        verify(users, never()).save(any());
    }
    @Test void legacyEnumsReadEitherCaseAndWriteOriginalSchemaValues() {
        var roles = new UserRoleConverter();
        for (var role : User.UserRole.values()) {
            assertEquals(role, roles.convertToEntityAttribute(role.name()));
            assertEquals(role, roles.convertToEntityAttribute(roles.convertToDatabaseColumn(role)));
            assertEquals(role.name().toLowerCase(java.util.Locale.ROOT), roles.convertToDatabaseColumn(role));
        }
        var status = new UserStatusConverter();
        assertEquals(User.UserStatus.LOCKED, status.convertToEntityAttribute("locked"));
        assertEquals("active", status.convertToDatabaseColumn(User.UserStatus.ACTIVE));
    }
}
