const db = require('./src/config/db');

async function migrate() {
  console.log('🚀 Executing Auth Database Migration...');

  try {
    // 1. Add google_id column if not exists
    const [cols] = await db.query("SHOW COLUMNS FROM users LIKE 'google_id'");
    if (cols.length === 0) {
      console.log('➕ Adding google_id column to users table...');
      await db.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER status");
    } else {
      console.log('✓ Column google_id already exists.');
    }

    // 2. Add is_email_verified column if not exists
    const [colsVerified] = await db.query("SHOW COLUMNS FROM users LIKE 'is_email_verified'");
    if (colsVerified.length === 0) {
      console.log('➕ Adding is_email_verified column to users table...');
      await db.query("ALTER TABLE users ADD COLUMN is_email_verified TINYINT(1) NOT NULL DEFAULT 1 AFTER status");
    } else {
      console.log('✓ Column is_email_verified already exists.');
    }

    // 3. Add avatar_url column if not exists
    const [colsAvatar] = await db.query("SHOW COLUMNS FROM users LIKE 'avatar_url'");
    if (colsAvatar.length === 0) {
      console.log('➕ Adding avatar_url column to users table...');
      await db.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER is_email_verified");
    } else {
      console.log('✓ Column avatar_url already exists.');
    }

    // 4. Create email_verifications table for registration OTPs
    console.log('➕ Creating email_verifications table if not exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        registration_data JSON NULL COMMENT 'Lưu dữ liệu đăng ký tạm thời trước khi xác thực OTP',
        attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Giới hạn nhập sai tối đa 3 lần',
        expires_at DATETIME NOT NULL,
        is_used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_otp_ver (email, otp_code, is_used)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Table email_verifications is ready.');

    console.log('✅ Auth DB Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ DB Migration Failed:', error.message);
    process.exit(1);
  }
}

migrate();
