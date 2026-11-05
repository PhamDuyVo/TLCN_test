package com.cinema.booking.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

/** Validates the existing Google popup access token with Google, never caller-supplied identity. */
@Component
public class GoogleTokenVerifier {
    private final String clientId;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId, ObjectMapper mapper) {
        this.clientId = clientId;
        this.mapper = mapper;
    }

    public String verify(String token) {
        if (clientId == null || clientId.isBlank() || token == null || token.isBlank()) {
            throw new BadCredentialsException("Google sign-in is unavailable or missing a token");
        }
        try {
            URI uri = URI.create("https://oauth2.googleapis.com/tokeninfo?access_token="
                    + URLEncoder.encode(token, StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(5)).GET().build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new BadCredentialsException("Invalid Google token");
            return verifiedEmail(mapper.readTree(response.body()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadCredentialsException("Google verification unavailable");
        } catch (Exception e) {
            // Do not propagate HTTP errors: their URLs can contain the bearer token.
            throw new BadCredentialsException("Google verification failed");
        }
    }

    String verifiedEmail(JsonNode claims) {
        String email = claims.path("email").asText();
        if (!clientId.equals(claims.path("aud").asText())
                || !clientId.equals(claims.path("azp").asText())
                || claims.path("sub").asText().isBlank()
                || !claims.path("email_verified").asBoolean()
                || claims.path("exp").asLong() <= Instant.now().getEpochSecond()
                || email.isBlank()
                // Without a stored Google subject, only link email identities Google owns.
                || !email.toLowerCase(java.util.Locale.ROOT).endsWith("@gmail.com")) {
            throw new BadCredentialsException("Google identity cannot be verified; use email sign-in");
        }
        return email;
    }
}
