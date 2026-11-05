-- Additive compatibility for the repository's original MySQL schema.
-- Run once through scripts/migrate.py. No user/password/role table changes.
ALTER TABLE movies ADD COLUMN original_title VARCHAR(200) NULL;
ALTER TABLE movies ADD COLUMN banner_url VARCHAR(500) NULL;
ALTER TABLE movies ADD COLUMN end_date DATE NULL;
