-- Apply after schema_and_seed.sql. No foreign keys: cleanup must survive movie deletion.
CREATE TABLE IF NOT EXISTS movie_media (
    id CHAR(36) PRIMARY KEY,
    movie_id BIGINT UNSIGNED NOT NULL,
    admin_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(16) NOT NULL,
    state VARCHAR(16) NOT NULL,
    public_id VARCHAR(255) NOT NULL UNIQUE,
    resource_type VARCHAR(10) NOT NULL,
    issued_at DATETIME(6) NOT NULL,
    cleanup_after DATETIME(6) NOT NULL,
    max_bytes BIGINT NOT NULL,
    asset_id VARCHAR(100),
    secure_url VARCHAR(500),
    format VARCHAR(16),
    bytes BIGINT,
    width INT,
    height INT,
    duration DOUBLE,
    version BIGINT,
    attempts INT NOT NULL DEFAULT 0,
    INDEX idx_media_cleanup (state, cleanup_after),
    INDEX idx_media_movie (movie_id, type, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
