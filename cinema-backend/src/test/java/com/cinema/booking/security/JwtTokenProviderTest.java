package com.cinema.booking.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

class JwtTokenProviderTest {
    static final String SECRET = "test-only-signing-key-with-at-least-32-bytes";
    JwtTokenProvider provider() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 60000L);
        ReflectionTestUtils.setField(provider, "jwtRefreshExpirationMs", 120000L);
        return provider;
    }
    @Test void preservesSigningAndClaimsWhileSeparatingTokenUses() {
        var provider = provider();
        var access = provider.generateAccessToken("existing@example.com", "ADMIN");
        var refresh = provider.generateRefreshToken("existing@example.com");
        var claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build().parseSignedClaims(access).getPayload();
        assertEquals("existing@example.com", claims.getSubject());
        assertEquals("ADMIN", claims.get("role"));
        assertNull(claims.get("type"));
        assertEquals("existing@example.com", provider.getEmailFromToken(refresh));
        assertTrue(provider.validateAccessToken(access));
        assertFalse(provider.validateRefreshToken(access));
        assertTrue(provider.validateRefreshToken(refresh));
        assertFalse(provider.validateAccessToken(refresh));
        assertFalse(provider.validateToken(access + "tampered"));
        assertFalse(provider.validateToken(null));
    }
    @Test void rejectsExpiredTokens() {
        var provider = provider();
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", -60000L);
        assertFalse(provider.validateAccessToken(provider.generateAccessToken("a@b.com", "CUSTOMER")));
    }
}
