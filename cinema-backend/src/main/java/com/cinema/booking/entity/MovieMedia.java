package com.cinema.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "movie_media", indexes = {
    @Index(name = "idx_media_cleanup", columnList = "state,cleanup_after"),
    @Index(name = "idx_media_movie", columnList = "movie_id,type,state")})
@Getter @Setter
public class MovieMedia {
    public enum MediaType { POSTER, BANNER, TRAILER }
    public enum State { PENDING, ATTACHED, OBSOLETE, CLEANED }
    @Id @Column(length = 36) private String id;
    // Scalar ids deliberately survive movie deletion for durable cleanup.
    @Column(name = "movie_id", nullable = false) private Long movieId;
    @Column(name = "admin_id", nullable = false) private Long adminId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private MediaType type;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private State state;
    @Column(name = "public_id", nullable = false, unique = true, length = 255) private String publicId;
    @Column(name = "resource_type", nullable = false, length = 10) private String resourceType;
    @Column(name = "issued_at", nullable = false) private Instant issuedAt;
    @Column(name = "cleanup_after", nullable = false) private Instant cleanupAfter;
    @Column(name = "max_bytes", nullable = false) private long maxBytes;
    @Column(name = "asset_id", length = 100) private String assetId;
    @Column(name = "secure_url", length = 500) private String secureUrl;
    @Column(length = 16) private String format;
    private Long bytes;
    private Integer width;
    private Integer height;
    private Double duration;
    private Long version;
    @Column(nullable = false) private int attempts;
}
