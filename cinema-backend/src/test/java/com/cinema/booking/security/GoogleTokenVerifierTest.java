package com.cinema.booking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import static org.junit.jupiter.api.Assertions.*;

class GoogleTokenVerifierTest {
    final ObjectMapper mapper = new ObjectMapper();
    @Test void missingConfigurationOrTokenFailsClosed() {
        assertThrows(BadCredentialsException.class, () -> new GoogleTokenVerifier("", mapper).verify("untrusted"));
        assertThrows(BadCredentialsException.class, () -> new GoogleTokenVerifier("client", mapper).verify(null));
    }
    @Test void checksAudienceExpiryAndVerifiedIdentity() {
        var verifier = new GoogleTokenVerifier("client", mapper);
        var claims = mapper.createObjectNode().put("aud", "client").put("azp", "client")
                .put("sub", "subject").put("email", "existing@gmail.com")
                .put("email_verified", true).put("exp", 4102444800L);
        assertEquals("existing@gmail.com", verifier.verifiedEmail(claims));
        claims.put("aud", "other-client");
        assertThrows(BadCredentialsException.class, () -> verifier.verifiedEmail(claims));
        claims.put("aud", "client").put("email_verified", false);
        assertThrows(BadCredentialsException.class, () -> verifier.verifiedEmail(claims));
        claims.put("email_verified", true).put("exp", 1);
        assertThrows(BadCredentialsException.class, () -> verifier.verifiedEmail(claims));
        claims.put("exp", 4102444800L).put("email", "unlinked@example.com");
        assertThrows(BadCredentialsException.class, () -> verifier.verifiedEmail(claims));
    }
}
