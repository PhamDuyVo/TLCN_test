package com.cinema.booking.dto;

import com.cinema.booking.entity.MovieMedia.MediaType;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public final class MediaDtos {
    private MediaDtos() {}
    public record IntentRequest(@NotNull MediaType type) {}
    public record UploadIntent(String intentId, String uploadUrl, String apiKey, String signature,
                               Map<String, Object> parameters, long maxBytes, long expiresAt) {}
}
