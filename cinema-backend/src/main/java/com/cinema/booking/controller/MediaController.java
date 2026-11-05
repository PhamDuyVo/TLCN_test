package com.cinema.booking.controller;

import com.cinema.booking.dto.ApiResponse;
import com.cinema.booking.dto.MediaDtos.*;
import com.cinema.booking.entity.MovieMedia;
import com.cinema.booking.entity.MovieMedia.MediaType;
import com.cinema.booking.security.UserPrincipal;
import com.cinema.booking.service.MediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/movies/{movieId}/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService mediaService;
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<MovieMedia>> list(@PathVariable Long movieId) {
        return ApiResponse.success(mediaService.list(movieId));
    }
    @PostMapping("/intents")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UploadIntent> intent(@PathVariable Long movieId, @Valid @RequestBody IntentRequest request,
            @AuthenticationPrincipal UserPrincipal admin) {
        return ApiResponse.success(mediaService.createIntent(movieId, request.type(), admin.getId()));
    }
    @PostMapping("/intents/{intentId}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MovieMedia> complete(@PathVariable Long movieId, @PathVariable String intentId,
            @AuthenticationPrincipal UserPrincipal admin) {
        return ApiResponse.success(mediaService.complete(movieId, intentId, admin.getId()));
    }
    @DeleteMapping("/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> remove(@PathVariable Long movieId, @PathVariable MediaType type) {
        mediaService.remove(movieId, type);
        return ApiResponse.success("Đã gỡ tài nguyên", null);
    }
}
