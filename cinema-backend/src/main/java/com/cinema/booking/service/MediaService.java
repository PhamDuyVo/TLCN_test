package com.cinema.booking.service;

import com.cinema.booking.dto.MediaDtos.UploadIntent;
import com.cinema.booking.entity.Movie;
import com.cinema.booking.entity.MovieMedia;
import com.cinema.booking.entity.MovieMedia.*;
import com.cinema.booking.repository.MovieMediaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final MovieMediaRepository repository;
    private final EntityManager em;
    private final CloudinaryGateway cloud;
    @Value("${CLOUDINARY_IMAGE_MAX_BYTES:10485760}") private long imageMaxBytes;
    @Value("${CLOUDINARY_VIDEO_MAX_BYTES:104857600}") private long videoMaxBytes;
    public static final long SIGNATURE_SECONDS = 3600;
    public static final long CLEANUP_GRACE_SECONDS = 7200;

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public UploadIntent createIntent(Long movieId, MediaType type, Long adminId) {
        cloud.requireConfigured();
        lockMovie(movieId);
        String mode = cloud.folderMode();
        Instant now = Instant.now();
        String id = UUID.randomUUID().toString();
        String folder = "cinema/movies/" + movieId + "/" + type.name().toLowerCase(Locale.ROOT);
        boolean video = type == MediaType.TRAILER;
        long limit = video ? videoMaxBytes : imageMaxBytes;
        if (limit <= 0) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Giới hạn upload không hợp lệ");
        Map<String, Object> params = new TreeMap<>();
        params.put("timestamp", now.getEpochSecond());
        params.put("public_id", id);
        params.put(mode.equals("dynamic") ? "asset_folder" : "folder", folder);
        params.put("overwrite", false);
        params.put("allowed_formats", video ? "mp4" : "jpg,png,webp");
        MovieMedia media = new MovieMedia();
        media.setId(id); media.setMovieId(movieId); media.setAdminId(adminId);
        media.setType(type); media.setState(State.PENDING);
        media.setPublicId(mode.equals("dynamic") ? id : folder + "/" + id);
        media.setResourceType(video ? "video" : "image");
        media.setIssuedAt(now); media.setCleanupAfter(now.plusSeconds(CLEANUP_GRACE_SECONDS));
        media.setMaxBytes(limit);
        repository.save(media);
        return new UploadIntent(id, "https://api.cloudinary.com/v1_1/" + cloud.cloudName() + "/" + media.getResourceType() + "/upload",
                cloud.apiKey(), cloud.signature(params), params, limit, now.plusSeconds(SIGNATURE_SECONDS).getEpochSecond());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<MovieMedia> list(Long movieId) {
        return repository.findByMovieIdAndState(movieId, State.ATTACHED);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public MovieMedia complete(Long movieId, String intentId, Long adminId) {
        Movie movie = lockMovie(movieId);
        MovieMedia media = repository.lockById(intentId).orElseThrow(() -> bad("Upload intent không tồn tại"));
        if (!media.getMovieId().equals(movieId) || !media.getAdminId().equals(adminId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Upload intent không thuộc quản trị viên/phim này");
        if (media.getState() == State.ATTACHED) return media; // Retry after a lost HTTP response.
        if (media.getState() != State.PENDING || !Instant.now().isBefore(media.getIssuedAt().plusSeconds(SIGNATURE_SECONDS)))
            throw bad("Upload intent đã hết hạn hoặc đã bị thay thế");
        Map<String, Object> resource = cloud.resource(media.getPublicId(), media.getResourceType());
        verify(media, resource);
        for (MovieMedia old : repository.findByMovieIdAndState(movieId, State.ATTACHED)) {
            if (old.getType() == media.getType()) obsolete(old);
        }
        media.setAssetId(resource.get("asset_id").toString());
        media.setSecureUrl(resource.get("secure_url").toString());
        media.setFormat(resource.get("format").toString());
        media.setBytes(((Number) resource.get("bytes")).longValue());
        media.setWidth(((Number) resource.get("width")).intValue());
        media.setHeight(((Number) resource.get("height")).intValue());
        media.setVersion(((Number) resource.get("version")).longValue());
        if (resource.get("duration") instanceof Number n) media.setDuration(n.doubleValue());
        media.setState(State.ATTACHED);
        setUrl(movie, media.getType(), media.getSecureUrl());
        return media;
    }

    static void verify(MovieMedia media, Map<String, Object> r) {
        boolean video = media.getType() == MediaType.TRAILER;
        Set<String> formats = video ? Set.of("mp4") : Set.of("jpg", "png", "webp");
        if (!media.getPublicId().equals(r.get("public_id")) || !media.getResourceType().equals(r.get("resource_type"))
                || !"upload".equals(r.get("type")) || !formats.contains(r.get("format"))
                || !(r.get("bytes") instanceof Number b) || b.longValue() <= 0 || b.longValue() > media.getMaxBytes()
                || !(r.get("width") instanceof Number w) || w.intValue() <= 0
                || !(r.get("height") instanceof Number h) || h.intValue() <= 0
                || !(r.get("version") instanceof Number v) || v.longValue() <= 0
                || !(r.get("asset_id") instanceof String a) || a.isBlank()
                || !(r.get("secure_url") instanceof String u) || !u.startsWith("https://res.cloudinary.com/") || u.length() > 500)
            throw bad("Tài nguyên Cloudinary không hợp lệ hoặc vượt giới hạn dung lượng");
        if (video && (!(r.get("duration") instanceof Number d) || !Double.isFinite(d.doubleValue()) || d.doubleValue() <= 0))
            throw bad("Trailer không hợp lệ");
        try {
            Instant created = Instant.parse(r.get("created_at").toString());
            if (created.isBefore(media.getIssuedAt().minusSeconds(60))
                    || created.isAfter(media.getIssuedAt().plusSeconds(SIGNATURE_SECONDS + 60))) throw bad("Thời gian upload không hợp lệ");
        } catch (NullPointerException | java.time.format.DateTimeParseException e) {
            throw bad("Thiếu thời gian upload được xác minh");
        }
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void remove(Long movieId, MediaType type) {
        Movie movie = lockMovie(movieId);
        repository.findByMovieIdAndState(movieId, State.ATTACHED).stream()
                .filter(m -> m.getType() == type).forEach(this::obsolete);
        // Clearing a legacy URL is safe: never derive a deletion public_id from it.
        setUrl(movie, type, null);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void retireMovie(Long movieId) {
        lockMovie(movieId);
        for (State state : List.of(State.ATTACHED, State.PENDING))
            repository.findByMovieIdAndState(movieId, state).forEach(this::obsolete);
    }
    private void obsolete(MovieMedia media) {
        media.setState(State.OBSOLETE);
        Instant safe = media.getIssuedAt().plusSeconds(CLEANUP_GRACE_SECONDS);
        media.setCleanupAfter(safe.isAfter(Instant.now()) ? safe : Instant.now());
    }
    private Movie lockMovie(Long id) {
        Movie movie = em.find(Movie.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (movie == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Phim không tồn tại");
        return movie;
    }
    private static void setUrl(Movie movie, MediaType type, String url) {
        switch (type) {
            case POSTER -> movie.setPosterUrl(url);
            case BANNER -> movie.setBannerUrl(url);
            case TRAILER -> movie.setTrailerUrl(url);
        }
    }
    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
