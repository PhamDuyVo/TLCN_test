package com.cinema.booking.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@Component
@RequiredArgsConstructor
public class CloudinaryGateway {
    private final Cloudinary cloudinary;
    private volatile String folderMode;

    public void requireConfigured() {
        if (cloudinary.config.cloudName == null || cloudinary.config.cloudName.isBlank()
                || cloudinary.config.apiKey == null || cloudinary.config.apiKey.isBlank()
                || cloudinary.config.apiSecret == null || cloudinary.config.apiSecret.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cloudinary chưa được cấu hình");
    }
    public String cloudName() { return cloudinary.config.cloudName; }
    public String apiKey() { return cloudinary.config.apiKey; }
    public String signature(Map<String, Object> params) {
        return cloudinary.apiSignRequest(params, cloudinary.config.apiSecret, cloudinary.config.signatureVersion);
    }
    public synchronized String folderMode() {
        requireConfigured();
        if (folderMode != null) return folderMode;
        try {
            // Config endpoint is not exposed by all Java SDK versions.
            Map<?, ?> response = RestClient.create("https://api.cloudinary.com")
                .get().uri("/v1_1/{cloud}/config?settings=true", cloudName())
                .headers(h -> h.setBasicAuth(apiKey(), cloudinary.config.apiSecret))
                .retrieve().body(Map.class);
            Object mode = response != null && response.get("settings") instanceof Map<?, ?> settings
                    ? settings.get("folder_mode") : null;
            if (!"dynamic".equals(mode) && !"fixed".equals(mode)) throw new IllegalStateException();
            folderMode = mode.toString();
            return folderMode;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không xác định được Cloudinary folder mode");
        }
    }
    @SuppressWarnings("unchecked")
    public Map<String, Object> resource(String publicId, String resourceType) {
        requireConfigured();
        try {
            return cloudinary.api().resource(publicId, Map.of("resource_type", resourceType, "type", "upload"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Chưa xác minh được tài nguyên Cloudinary; hãy thử lại");
        }
    }
    public void destroy(String publicId, String resourceType) throws Exception {
        requireConfigured();
        Map<?, ?> response = cloudinary.uploader().destroy(publicId,
                Map.of("resource_type", resourceType, "type", "upload", "invalidate", true));
        if (!Set.of("ok", "not found").contains(response.get("result")))
            throw new IllegalStateException("Cloudinary cleanup failed");
    }
}
