package com.cinema.booking.security;

import com.cinema.booking.config.SecurityConfig;
import com.cinema.booking.controller.AuthController;
import com.cinema.booking.service.AuthService;
import com.cinema.booking.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class SecurityConfigTest {
    @Autowired MockMvc mvc;
    @MockBean JwtTokenProvider tokens;
    @MockBean CustomUserDetailsService users;
    @MockBean AuthService auth;

    @Test void anonymousProtectedEndpointsReturn401() throws Exception {
        for (String route : new String[]{"/admin/users", "/media/upload", "/auth/me"}) {
            mvc.perform(get(route)).andExpect(status().isUnauthorized());
        }
        mvc.perform(put("/auth/profile").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Test\"}")).andExpect(status().isUnauthorized());
    }
    @Test void customerCannotUseAdminOrMedia() throws Exception {
        when(tokens.validateAccessToken("access")).thenReturn(true);
        when(tokens.getEmailFromToken("access")).thenReturn("customer@example.com");
        when(users.loadUserByUsername("customer@example.com")).thenReturn(UserPrincipal.create(
                User.builder().email("customer@example.com").role(User.UserRole.CUSTOMER).build()));
        for (String route : new String[]{"/admin/users", "/media/upload"}) {
            mvc.perform(get(route).header("Authorization", "Bearer access")).andExpect(status().isForbidden());
        }
    }
    @Test void refreshAndLockedUserCannotAuthenticateRequests() throws Exception {
        mvc.perform(get("/auth/me").header("Authorization", "Bearer refresh")).andExpect(status().isUnauthorized());
        when(tokens.validateAccessToken("locked")).thenReturn(true);
        when(tokens.getEmailFromToken("locked")).thenReturn("locked@example.com");
        when(users.loadUserByUsername("locked@example.com")).thenReturn(UserPrincipal.create(
                User.builder().email("locked@example.com").status(User.UserStatus.LOCKED).build()));
        mvc.perform(get("/auth/me").header("Authorization", "Bearer locked")).andExpect(status().isUnauthorized());
    }
    @Test void otpVerificationRequiresRegistrationFields() throws Exception {
        mvc.perform(post("/auth/verify-registration-otp").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@example.com\",\"otpCode\":\"123456\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(auth);
    }
    @Test void legacyRegisterRouteCannotBypassOtp() throws Exception {
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Test\",\"email\":\"new@example.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk());
        verify(auth).registerInit(any());
        verify(auth, never()).register(any());
    }
}
